const express = require('express');
const router = express.Router();
const BeerStyle = require('../models/BeerStyle');
const debug = require('debug')('app:beerStyles');

// GET /api/beer-styles
router.get('/', async (req, res) => {
  try {
    const styles = await BeerStyle.find({}).lean();
    debug(`Found ${styles.length} beer styles`);
    res.json(styles);
  } catch (error) {
    debug('Error fetching beer styles:', error);
    res.status(500).json({ error: 'Failed to fetch beer styles' });
  }
});

// POST /api/beer-styles
router.post('/', async (req, res) => {
  try {
    const { name, minTemp, maxTemp } = req.body;
    
    // Validate temperature range
    if (minTemp >= maxTemp) {
      return res.status(400).json({ 
        error: 'Minimum temperature must be less than maximum temperature' 
      });
    }

    const beerStyle = new BeerStyle({ name, minTemp, maxTemp });
    await beerStyle.save();
    
    debug('Created new beer style:', beerStyle);
    res.status(201).json(beerStyle);
  } catch (error) {
    debug('Error creating beer style:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Beer style with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create beer style' });
  }
});

// PUT /api/beer-styles/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, minTemp, maxTemp } = req.body;

    // Validate temperature range
    if (minTemp >= maxTemp) {
      return res.status(400).json({ 
        error: 'Minimum temperature must be less than maximum temperature' 
      });
    }

    const beerStyle = await BeerStyle.findByIdAndUpdate(
      id,
      { name, minTemp, maxTemp },
      { new: true, runValidators: true }
    );

    if (!beerStyle) {
      return res.status(404).json({ error: 'Beer style not found' });
    }

    debug('Updated beer style:', beerStyle);
    res.json(beerStyle);
  } catch (error) {
    debug('Error updating beer style:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Beer style with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to update beer style' });
  }
});

// DELETE /api/beer-styles/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const beerStyle = await BeerStyle.findByIdAndDelete(id);

    if (!beerStyle) {
      return res.status(404).json({ error: 'Beer style not found' });
    }

    debug('Deleted beer style:', beerStyle);
    res.status(204).send();
  } catch (error) {
    debug('Error deleting beer style:', error);
    res.status(500).json({ error: 'Failed to delete beer style' });
  }
});

module.exports = router;