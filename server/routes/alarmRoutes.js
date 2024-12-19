const express = require('express');
const router = express.Router();
const AlarmController = require('../controllers/alarmController');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/log');

logger.info('Alarm routes initialized');

// Get all alarms
router.get('/', authenticateToken, AlarmController.getAlarms);

module.exports = router; 