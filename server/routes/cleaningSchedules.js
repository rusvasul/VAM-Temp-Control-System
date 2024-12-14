const express = require('express');
const router = express.Router();
const cleaningScheduleController = require('../controllers/cleaningScheduleController');
const debug = require('debug')('app:routes:cleaningSchedules');

// Log route registration
debug('Registering cleaning schedule routes');

router.get('/', (req, res) => {
  cleaningScheduleController.getSchedules(req, res);
});

router.get('/tank/:tankId', (req, res) => {
  cleaningScheduleController.getScheduleByTankId(req, res); 
});

router.post('/', (req, res) => {
  cleaningScheduleController.createSchedule(req, res);
});

router.put('/:id', (req, res) => {
  cleaningScheduleController.updateSchedule(req, res);
});

router.delete('/:id', (req, res) => {
  cleaningScheduleController.deleteSchedule(req, res);
});

debug('Cleaning schedule routes registered');

module.exports = router;