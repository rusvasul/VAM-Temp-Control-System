const express = require('express');
const router = express.Router();
const SystemStatus = require('../models/SystemStatus');
const debug = require('debug')('app:systemStatus');

// GET /api/system-status
router.get('/', async (req, res) => {
  debug('GET /api/system-status request received');
  try {
    let systemStatus = await SystemStatus.findOne();
    if (!systemStatus) {
      systemStatus = await SystemStatus.create({});
    }
    debug('Sending system status:', systemStatus);
    res.json(systemStatus);
  } catch (error) {
    debug('Error fetching system status:', error);
    console.error('Error fetching system status:', error);
    res.status(500).json({ error: 'Failed to fetch system status', message: error.message });
  }
});

// PUT /api/system-status
router.put('/', async (req, res) => {
  debug('PUT /api/system-status request received');
  try {
    const updates = req.body;
    let systemStatus = await SystemStatus.findOne();
    if (!systemStatus) {
      systemStatus = new SystemStatus();
    }

    // Validate system mode and component status combinations
    if (updates.systemMode === 'Cooling') {
      if (updates.heaterStatus === 'Running') {
        return res.status(400).json({ 
          error: 'Invalid state', 
          message: 'Heater cannot be running in Cooling mode' 
        });
      }
      updates.heaterStatus = 'Off';
    } else if (updates.systemMode === 'Heating') {
      if (updates.chillerStatus === 'Running') {
        return res.status(400).json({ 
          error: 'Invalid state', 
          message: 'Chiller cannot be running in Heating mode' 
        });
      }
      updates.chillerStatus = 'Off';
    } else if (updates.systemMode === 'Idle') {
      if (updates.chillerStatus === 'Running' || updates.heaterStatus === 'Running') {
        return res.status(400).json({ 
          error: 'Invalid state', 
          message: 'Neither chiller nor heater can be running in Idle mode' 
        });
      }
      updates.chillerStatus = 'Standby';
      updates.heaterStatus = 'Standby';
    }

    // Prevent simultaneous running of chiller and heater
    if (updates.chillerStatus === 'Running' && updates.heaterStatus === 'Running') {
      return res.status(400).json({ 
        error: 'Invalid state', 
        message: 'Chiller and heater cannot run simultaneously' 
      });
    }

    // Update only allowed fields
    const allowedUpdates = ['chillerStatus', 'heaterStatus', 'systemMode'];
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        systemStatus[field] = updates[field];
      }
    });

    await systemStatus.save();
    debug('System status updated successfully:', systemStatus);
    res.json(systemStatus);
  } catch (error) {
    debug('Error updating system status:', error);
    console.error('Error updating system status:', error);
    res.status(500).json({ error: 'Failed to update system status', message: error.message });
  }
});

module.exports = router;