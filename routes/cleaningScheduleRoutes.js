const express = require('express');
const router = express.Router();
const cleaningScheduleController = require('../controllers/cleaningScheduleController');

router.post('/', cleaningScheduleController.createSchedule);
router.get('/', cleaningScheduleController.getAllSchedules);
router.put('/:id', cleaningScheduleController.updateSchedule);
router.delete('/:id', cleaningScheduleController.deleteSchedule);
router.get('/tank/:tankId', cleaningScheduleController.getScheduleByTankId);

module.exports = router; 