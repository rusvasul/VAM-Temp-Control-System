const express = require('express');
const router = express.Router();
const cleaningScheduleController = require('../controllers/cleaningScheduleController');
const debug = require('debug')('app:routes:cleaningSchedules');

debug('Registering cleaning schedule routes');

// GET /api/cleaning-schedules
router.get('/', async (req, res) => {
  await cleaningScheduleController.getSchedules(req, res);
});

// GET /api/cleaning-schedules/tank/:tankId
router.get('/tank/:tankId', async (req, res) => {
  await cleaningScheduleController.getScheduleByTankId(req, res);
});

// POST /api/cleaning-schedules
router.post('/', async (req, res) => {
  await cleaningScheduleController.createSchedule(req, res);
});

// PUT /api/cleaning-schedules/:id
router.put('/:id', async (req, res) => {
  await cleaningScheduleController.updateSchedule(req, res);
});

// DELETE /api/cleaning-schedules/:id
router.delete('/:id', async (req, res) => {
  await cleaningScheduleController.deleteSchedule(req, res);
});

debug('Cleaning schedule routes registered');

module.exports = router; 