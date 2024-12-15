const express = require('express');
const router = express.Router();
const BrewStyle = require('../models/BrewStyle');
const debug = require('debug')('app:brewStyles');

// GET /api/brew-styles
router.get('/', async (req, res) => {
  try {
    const styles = await BrewStyle.find({}).lean();
    debug(`Found ${styles.length} brew styles`);
    res.json(styles);
  } catch (error) {
    debug('Error fetching brew styles:', error);
    res.status(500).json({ error: 'Failed to fetch brew styles' });
  }
});

// POST /api/brew-styles
router.post('/', async (req, res) => {
  try {
    const { name, minTemp, maxTemp } = req.body;

    // Validate required fields
    if (!name || minTemp === undefined || maxTemp === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate temperature range
    if (minTemp >= maxTemp) {
      return res.status(400).json({ error: 'Minimum temperature must be less than maximum temperature' });
    }

    const brewStyle = new BrewStyle({ name, minTemp, maxTemp });
    await brewStyle.save();

    debug('Created new brew style:', brewStyle);
    res.status(201).json(brewStyle);
  } catch (error) {
    debug('Error creating brew style:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Brew style with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create brew style' });
  }
});

// PUT /api/brew-styles/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, minTemp, maxTemp } = req.body;

    // Validate required fields
    if (!name || minTemp === undefined || maxTemp === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate temperature range
    if (minTemp >= maxTemp) {
      return res.status(400).json({ error: 'Minimum temperature must be less than maximum temperature' });
    }

    const brewStyle = await BrewStyle.findByIdAndUpdate(
      id,
      { name, minTemp, maxTemp },
      { new: true, runValidators: true }
    );

    if (!brewStyle) {
      return res.status(404).json({ error: 'Brew style not found' });
    }

    debug('Updated brew style:', brewStyle);
    res.json(brewStyle);
  } catch (error) {
    debug('Error updating brew style:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Brew style with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to update brew style' });
  }
});

// DELETE /api/brew-styles/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const brewStyle = await BrewStyle.findByIdAndDelete(id);

    if (!brewStyle) {
      return res.status(404).json({ error: 'Brew style not found' });
    }

    debug('Deleted brew style:', brewStyle);
    res.sendStatus(204);
  } catch (error) {
    debug('Error deleting brew style:', error);
    res.status(500).json({ error: 'Failed to delete brew style' });
  }
});

module.exports = router; 