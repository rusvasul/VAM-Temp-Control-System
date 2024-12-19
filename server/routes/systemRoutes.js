const express = require('express');
const router = express.Router();
const SystemController = require('../controllers/systemController');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/log');

logger.info('System routes initialized');

// Get system status
router.get('/', authenticateToken, SystemController.getSystemStatus);

module.exports = router; 