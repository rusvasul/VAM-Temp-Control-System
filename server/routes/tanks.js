const express = require('express');
const router = express.Router();
const Tank = require('../models/Tank');
const debug = require('debug')('app:tanks');

// GET /api/tanks
router.get('/', async (req, res) => {
  debug('GET /api/tanks request received');
  try {
    const tanks = await Tank.find({}).lean();
    debug(`Found ${tanks.length} tanks`);
    
    // Transform MongoDB _id to id for client compatibility
    const transformedTanks = tanks.map(tank => ({
      id: tank._id.toString(),
      name: tank.name,
      temperature: tank.temperature,
      status: tank.status,
      mode: tank.mode,
      valveStatus: tank.valveStatus
    }));
    
    debug('Sending transformed tanks data:', transformedTanks);
    res.json(transformedTanks);
  } catch (error) {
    debug('Error fetching tanks:', error);
    console.error('Error fetching tanks:', error);
    res.status(500).json({ error: 'Failed to fetch tanks', message: error.message });
  }
});

// PUT /api/tanks/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  debug(`PUT /api/tanks/${id} request received with data:`, updates);

  try {
    const tank = await Tank.findById(id);
    
    if (!tank) {
      debug(`Tank not found with id: ${id}`);
      return res.status(404).json({ error: 'Tank not found' });
    }

    // Update only allowed fields
    const allowedUpdates = ['name', 'status', 'mode', 'valveStatus', 'setPoint'];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        tank[key] = updates[key];
      }
    });

    await tank.save();
    
    // Transform MongoDB _id to id for client compatibility
    const transformedTank = {
      id: tank._id.toString(),
      name: tank.name,
      temperature: tank.temperature,
      status: tank.status,
      mode: tank.mode,
      valveStatus: tank.valveStatus
    };
    
    debug('Tank updated successfully:', transformedTank);
    res.json(transformedTank);
  } catch (error) {
    debug(`Error updating tank: ${error.message}`);
    console.error('Error updating tank:', error);
    res.status(500).json({ error: 'Failed to update tank', message: error.message });
  }
});

// GET /api/tanks/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  debug(`GET /api/tanks/${id} request received`);
  
  try {
    const tank = await Tank.findById(id).lean();
    
    if (!tank) {
      debug(`Tank not found with id: ${id}`);
      return res.status(404).json({ error: 'Tank not found' });
    }
    
    // Transform MongoDB _id to id for client compatibility
    const transformedTank = {
      id: tank._id.toString(),
      name: tank.name,
      temperature: tank.temperature,
      status: tank.status,
      mode: tank.mode,
      valveStatus: tank.valveStatus
    };
    
    debug('Sending tank data:', transformedTank);
    res.json(transformedTank);
  } catch (error) {
    debug(`Error fetching tank: ${error.message}`);
    console.error('Error fetching tank:', error);
    res.status(500).json({ error: 'Failed to fetch tank', message: error.message });
  }
});

// GET /api/tanks/:id/temperature-stream
router.get('/:id/temperature-stream', (req, res) => {
  const { id } = req.params;
  debug(`SSE connection established for tank ${id}`);
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendTemperature = async () => {
    try {
      const tank = await Tank.findById(id).lean();
      if (tank) {
        const data = JSON.stringify({ temperature: tank.temperature });
        debug(`Sending temperature update for tank ${id}:`, data);
        res.write(`data: ${data}\n\n`);
      }
    } catch (error) {
      debug(`Error fetching tank temperature: ${error.message}`);
      console.error('Error fetching tank temperature:', error);
    }
  };

  // Send initial temperature
  sendTemperature();

  // Simulate temperature updates every 5 seconds
  const intervalId = setInterval(sendTemperature, 5000);

  // Clean up on client disconnect
  req.on('close', () => {
    debug(`SSE connection closed for tank ${id}`);
    clearInterval(intervalId);
  });
});

module.exports = router;