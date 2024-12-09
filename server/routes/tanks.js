const express = require('express');
const router = express.Router();
const { Tank } = require('../models/init');

// GET /api/tanks
router.get('/', async (req, res) => {
  try {
    const tanks = await Tank.find({});
    res.json(tanks);
  } catch (error) {
    console.error('Error fetching tanks:', error);
    res.status(500).json({ error: 'Failed to fetch tanks', message: error.message });
  }
});

module.exports = router;