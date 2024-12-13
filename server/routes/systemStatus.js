const express = require('express');
const router = express.Router();
const SystemStatus = require('../models/SystemStatus');
const debug = require('debug')('app:systemStatus');
const SSE = require('express-sse');
const sse = new SSE();

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
    console.log('Received updates:', updates);

    let systemStatus = await SystemStatus.findOne();
    if (!systemStatus) {
      systemStatus = new SystemStatus();
    }

    // Adjust component statuses based on the new system mode
    if (updates.systemMode === 'Cooling') {
      updates.chillerStatus = 'Running';
      updates.heaterStatus = 'Off';
    } else if (updates.systemMode === 'Heating') {
      updates.chillerStatus = 'Off';
      updates.heaterStatus = 'Running';
    } else if (updates.systemMode === 'Idle') {
      updates.chillerStatus = 'Standby';
      updates.heaterStatus = 'Standby';
    }

    // Update only allowed fields
    const allowedUpdates = ['chillerStatus', 'heaterStatus', 'systemMode'];
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        systemStatus[field] = updates[field];
      }
    });

    console.log('Updated system status before save:', systemStatus);

    await systemStatus.save();
    debug('System status updated successfully:', systemStatus);

    // Emit SSE event with updated system status
    sse.send(systemStatus, 'systemStatusUpdate');

    res.json(systemStatus);
  } catch (error) {
    debug('Error updating system status:', error);
    console.error('Error updating system status:', error);
    res.status(500).json({ error: 'Failed to update system status', message: error.message });
  }
});

module.exports = router;