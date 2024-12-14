const express = require('express');
const router = express.Router();
const Alarm = require('../models/Alarm');
const debug = require('debug')('app:alarms');

// Create a new alarm
router.post('/', async (req, res) => {
  try {
    debug('Creating new alarm with data:', req.body);
    const alarm = new Alarm(req.body);
    await alarm.save();
    debug('Successfully created alarm:', alarm._id);
    res.status(201).json(alarm);
  } catch (error) {
    debug('Error creating alarm:', error);
    res.status(400).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Get all alarms
router.get('/', async (req, res) => {
  try {
    debug('Fetching all alarms');
    const alarms = await Alarm.find().populate('tankId', 'name');
    debug(`Found ${alarms.length} alarms`);
    res.json(alarms);
  } catch (error) {
    debug('Error fetching alarms:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Get all active alarms
router.get('/active', async (req, res) => {
  try {
    debug('Fetching all active alarms');
    const activeAlarms = await Alarm.find({ isActive: true }).populate('tankId', 'name');
    debug(`Found ${activeAlarms.length} active alarms`);
    res.json(activeAlarms);
  } catch (error) {
    debug('Error fetching active alarms:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Get a specific alarm
router.get('/:id', async (req, res) => {
  try {
    debug('Fetching alarm with id:', req.params.id);
    const alarm = await Alarm.findById(req.params.id).populate('tankId', 'name');
    if (!alarm) {
      debug('Alarm not found with id:', req.params.id);
      return res.status(404).json({ error: 'Alarm not found' });
    }
    debug('Successfully fetched alarm:', alarm._id);
    res.json(alarm);
  } catch (error) {
    debug('Error fetching alarm:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Update an alarm
router.put('/:id', async (req, res) => {
  try {
    debug('Updating alarm with id:', req.params.id);
    debug('Update data:', req.body);

    const alarm = await Alarm.findById(req.params.id);
    if (!alarm) {
      debug('Alarm not found with id:', req.params.id);
      return res.status(404).json({ error: 'Alarm not found' });
    }

    // Validate update data
    if (req.body.type && !['High Temperature', 'Low Temperature', 'System Error'].includes(req.body.type)) {
      debug('Invalid alarm type:', req.body.type);
      return res.status(400).json({ error: 'Invalid alarm type' });
    }

    const updatedAlarm = await Alarm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    debug('Successfully updated alarm:', updatedAlarm._id);
    res.json(updatedAlarm);
  } catch (error) {
    debug('Error updating alarm:', error);
    res.status(400).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Delete an alarm
router.delete('/:id', async (req, res) => {
  try {
    debug('Deleting alarm with id:', req.params.id);
    const alarm = await Alarm.findByIdAndDelete(req.params.id);
    if (!alarm) {
      debug('Alarm not found with id:', req.params.id);
      return res.status(404).json({ error: 'Alarm not found' });
    }
    debug('Successfully deleted alarm:', req.params.id);
    res.json({ message: 'Alarm deleted successfully' });
  } catch (error) {
    debug('Error deleting alarm:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;