const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const debug = require('debug')('app:settings');

debug('Settings route module initialized');

// GET /api/settings
router.get('/', async (req, res) => {
  debug('GET /api/settings request received');
  try {
    debug('Fetching system settings');
    let settings = await Settings.findOne();
    debug('Found settings:', settings);
    
    if (!settings) {
      debug('No settings found, creating default settings');
      settings = await Settings.create({
        temperatureUnit: 'celsius',
        refreshRate: 30,
        numberOfTanks: 9
      });
      debug('Created default settings:', settings);
    }
    
    debug('Sending settings response');
    res.json(settings);
  } catch (error) {
    debug('Error in GET /api/settings:', error);
    console.error('Error fetching settings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch settings', 
      message: error.message,
      stack: error.stack 
    });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  debug('PUT /api/settings request received with body:', req.body);
  try {
    const { temperatureUnit, refreshRate, numberOfTanks } = req.body;

    // Input validation
    if (refreshRate && (refreshRate < 1 || refreshRate > 3600)) {
      debug('Invalid refresh rate value:', refreshRate);
      return res.status(400).json({
        error: 'Invalid refresh rate',
        message: 'Refresh rate must be between 1 and 3600 seconds'
      });
    }

    if (numberOfTanks && (numberOfTanks < 1 || numberOfTanks > 20)) {
      debug('Invalid number of tanks value:', numberOfTanks);
      return res.status(400).json({
        error: 'Invalid number of tanks',
        message: 'Number of tanks must be between 1 and 20'
      });
    }

    if (temperatureUnit && !['celsius', 'fahrenheit'].includes(temperatureUnit)) {
      debug('Invalid temperature unit:', temperatureUnit);
      return res.status(400).json({
        error: 'Invalid temperature unit',
        message: 'Temperature unit must be either celsius or fahrenheit'
      });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      debug('No settings found, creating new settings');
      settings = new Settings({
        temperatureUnit: 'celsius',
        refreshRate: 30,
        numberOfTanks: 9
      });
    }

    // Update only provided fields
    if (temperatureUnit !== undefined) settings.temperatureUnit = temperatureUnit;
    if (refreshRate !== undefined) settings.refreshRate = refreshRate;
    if (numberOfTanks !== undefined) settings.numberOfTanks = numberOfTanks;

    debug('Saving settings:', settings);
    await settings.save();
    debug('Settings saved successfully');
    res.json(settings);
  } catch (error) {
    debug('Error in PUT /api/settings:', error);
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      error: 'Failed to update settings', 
      message: error.message,
      stack: error.stack 
    });
  }
});

// Log all routes
debug('Settings routes:');
router.stack.forEach((route) => {
  if (route.route) {
    debug(`${Object.keys(route.route.methods)} ${route.route.path}`);
  }
});

module.exports = router;