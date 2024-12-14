const express = require('express');
const router = express.Router();
const Tank = require('../models/Tank');
const TemperatureHistory = require('../models/TemperatureHistory');
const debug = require('debug')('app:tanks');
const mongoose = require('mongoose');

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
    let tank;
    if (mongoose.Types.ObjectId.isValid(id)) {
      tank = await Tank.findById(id);
    } else {
      // Look up tank directly by name
      debug(`Looking for tank with name: ${id}`);
      tank = await Tank.findOne({ name: id });
    }

    if (!tank) {
      debug(`Tank not found with id/name: ${id}`);
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
    let tank;
    if (mongoose.Types.ObjectId.isValid(id)) {
      tank = await Tank.findById(id).lean();
    } else {
      // Look up tank directly by name
      debug(`Looking for tank with name: ${id}`);
      tank = await Tank.findOne({ name: id }).lean();
    }

    if (!tank) {
      debug(`Tank not found with id/name: ${id}`);
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
router.get('/:id/temperature-stream', async (req, res) => {
  const { id } = req.params;
  debug(`SSE connection established for tank ${id}`);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendTemperature = async () => {
    try {
      let tank;
      if (mongoose.Types.ObjectId.isValid(id)) {
        tank = await Tank.findById(id).lean();
      } else {
        debug(`Looking for tank with name: ${id}`);
        tank = await Tank.findOne({ name: id }).lean();
      }

      if (tank) {
        const latestTemperature = await TemperatureHistory.findOne({ tankId: tank._id })
          .sort({ timestamp: -1 })
          .lean();

        if (latestTemperature) {
          const data = JSON.stringify({
            temperature: latestTemperature.temperature,
            timestamp: latestTemperature.timestamp
          });
          debug(`Sending temperature update for tank ${id}:`, data);
          res.write(`data: ${data}\n\n`);
        }
      }
    } catch (error) {
      debug(`Error fetching tank temperature: ${error.message}`);
      console.error('Error fetching tank temperature:', error);
    }
  };

  // Send initial temperature
  await sendTemperature();

  // Simulate temperature updates every 5 seconds
  const intervalId = setInterval(sendTemperature, 5000);

  // Clean up on client disconnect
  req.on('close', () => {
    debug(`SSE connection closed for tank ${id}`);
    clearInterval(intervalId);
  });
});

// POST /api/tanks
router.post('/', async (req, res) => {
  const tankData = req.body;
  debug('POST /api/tanks request received with data:', tankData);

  try {
    const tank = new Tank({
      name: tankData.name,
      temperature: tankData.temperature || 68, // Default temperature
      status: tankData.status || 'Inactive',
      mode: tankData.mode || 'Idle',
      valveStatus: tankData.valveStatus || 'Closed'
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

    debug('Tank created successfully:', transformedTank);
    res.status(201).json(transformedTank);
  } catch (error) {
    debug(`Error creating tank: ${error.message}`);
    console.error('Error creating tank:', error);
    res.status(500).json({ error: 'Failed to create tank', message: error.message });
  }
});

// DELETE /api/tanks/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  debug(`DELETE /api/tanks/${id} request received`);

  try {
    let tank;
    if (mongoose.Types.ObjectId.isValid(id)) {
      tank = await Tank.findByIdAndDelete(id);
    } else {
      // Look up tank directly by name
      debug(`Looking for tank with name: ${id}`);
      tank = await Tank.findOneAndDelete({ name: id });
    }

    if (!tank) {
      debug(`Tank not found with id/name: ${id}`);
      return res.status(404).json({ error: 'Tank not found' });
    }

    debug('Tank deleted successfully');
    res.status(204).send();
  } catch (error) {
    debug(`Error deleting tank: ${error.message}`);
    console.error('Error deleting tank:', error);
    res.status(500).json({ error: 'Failed to delete tank', message: error.message });
  }
});

// POST /api/tanks/:id/temperature
router.post('/:id/temperature', async (req, res) => {
  const { id } = req.params;
  const { temperature } = req.body;
  debug(`POST /api/tanks/${id}/temperature request received with data:`, { temperature });

  try {
    let tank;
    if (mongoose.Types.ObjectId.isValid(id)) {
      tank = await Tank.findById(id);
    } else {
      debug(`Looking for tank with name: ${id}`);
      tank = await Tank.findOne({ name: id });
    }

    if (!tank) {
      debug(`Tank not found with id/name: ${id}`);
      return res.status(404).json({ error: 'Tank not found' });
    }

    if (typeof temperature !== 'number') {
      debug('Invalid temperature value:', temperature);
      return res.status(400).json({ error: 'Temperature must be a number' });
    }

    const temperatureHistory = new TemperatureHistory({
      tankId: tank._id,
      temperature
    });

    await temperatureHistory.save();

    // Update the tank's current temperature
    tank.temperature = temperature;
    await tank.save();

    debug('Temperature history recorded successfully:', temperatureHistory);
    res.status(201).json({
      id: temperatureHistory._id.toString(),
      tankId: tank._id.toString(),
      temperature: temperatureHistory.temperature,
      timestamp: temperatureHistory.timestamp
    });
  } catch (error) {
    debug(`Error recording temperature history: ${error.message}`);
    console.error('Error recording temperature history:', error);
    res.status(500).json({ error: 'Failed to record temperature history', message: error.message });
  }
});

// GET /api/tanks/:id/temperature-history
router.get('/:id/temperature-history', async (req, res) => {
  const { id } = req.params;
  const { start, end } = req.query;
  debug(`GET /api/tanks/${id}/temperature-history request received with query:`, { start, end });

  try {
    let tank;
    if (mongoose.Types.ObjectId.isValid(id)) {
      tank = await Tank.findById(id);
    } else {
      debug(`Looking for tank with name: ${id}`);
      tank = await Tank.findOne({ name: id });
    }

    if (!tank) {
      debug(`Tank not found with id/name: ${id}`);
      return res.status(404).json({ error: 'Tank not found' });
    }

    let query = { tankId: tank._id };
    if (start && end) {
      try {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('Invalid date format');
        }
        query.timestamp = { $gte: startDate, $lte: endDate };
        debug('Date range query:', { start: startDate, end: endDate });
      } catch (error) {
        debug('Invalid date parameters:', error);
        return res.status(400).json({ error: 'Invalid date format in start/end parameters' });
      }
    }

    const temperatureHistory = await TemperatureHistory.find(query)
      .sort({ timestamp: 1 })
      .select('temperature timestamp -_id');

    debug(`Found ${temperatureHistory.length} temperature records for tank ${id}`);
    res.json({
      tankId: tank._id.toString(),
      tankName: tank.name,
      history: temperatureHistory.map(record => ({
        temperature: record.temperature,
        timestamp: record.timestamp
      }))
    });
  } catch (error) {
    debug(`Error fetching temperature history: ${error.message}`);
    console.error('Error fetching temperature history:', error);
    res.status(500).json({ error: 'Failed to fetch temperature history', message: error.message });
  }
});

module.exports = router;