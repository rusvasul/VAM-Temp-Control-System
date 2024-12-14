const express = require('express');
const router = express.Router();
const productionScheduleController = require('../controllers/productionScheduleController');
const debug = require('debug')('vam-tank-control:productionSchedulesRouter');

debug('Registering production schedule routes');

// GET /api/production-schedules
router.get('/', (req, res) => {
  productionScheduleController.getAllSchedules(req, res);
});

// GET /api/production-schedules/:id
router.get('/:id', (req, res) => {
  productionScheduleController.getScheduleById(req, res);
});

// POST /api/production-schedules
router.post('/', (req, res) => {
  productionScheduleController.createSchedule(req, res);
});

// PUT /api/production-schedules/:id
router.put('/:id', (req, res) => {
  productionScheduleController.updateSchedule(req, res);
});

// DELETE /api/production-schedules/:id
router.delete('/:id', (req, res) => {
  productionScheduleController.deleteSchedule(req, res);
});

debug('Production schedule routes registered');

module.exports = router;