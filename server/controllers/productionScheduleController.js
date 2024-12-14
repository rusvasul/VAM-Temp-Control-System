const ProductionSchedule = require('../models/ProductionSchedule');
const debug = require('debug')('vam-tank-control:productionScheduleController');

const checkScheduleConflict = async (schedule, excludeId = null) => {
  const conflictingSchedule = await ProductionSchedule.findOne({
    tankId: schedule.tankId,
    $or: [
      { startDate: { $lt: schedule.endDate }, endDate: { $gt: schedule.startDate } },
      { startDate: { $gte: schedule.startDate, $lt: schedule.endDate } },
      { endDate: { $gt: schedule.startDate, $lte: schedule.endDate } }
    ],
    _id: { $ne: excludeId }
  });
  return conflictingSchedule !== null;
};

exports.checkConflict = async (req, res) => {
  try {
    debug('Checking for schedule conflicts');
    const hasConflict = await checkScheduleConflict(req.body);
    res.json({ hasConflict });
  } catch (error) {
    debug('Error checking schedule conflict: %O', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    debug('Creating new production schedule');
    const hasConflict = await checkScheduleConflict(req.body);
    if (hasConflict) {
      return res.status(409).json({ error: 'Schedule conflicts with an existing schedule for the same tank' });
    }
    const newSchedule = new ProductionSchedule(req.body);
    const savedSchedule = await newSchedule.save();
    debug('Successfully created production schedule with id: %s', savedSchedule._id);
    res.status(201).json(savedSchedule);
  } catch (error) {
    debug('Error creating production schedule: %O', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getAllSchedules = async (req, res) => {
  try {
    debug('Retrieving all production schedules');
    const schedules = await ProductionSchedule.find();
    debug('Successfully retrieved %d production schedules', schedules.length);
    res.json(schedules);
  } catch (error) {
    debug('Error retrieving production schedules: %O', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    debug('Retrieving production schedule with id: %s', id);

    const schedule = await ProductionSchedule.findById(id);
    if (!schedule) {
      debug('Production schedule not found with id: %s', id);
      return res.status(404).json({ error: 'Production schedule not found' });
    }

    debug('Successfully retrieved production schedule');
    res.json(schedule);
  } catch (error) {
    debug('Error retrieving production schedule: %O', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    debug('Updating production schedule with id: %s', id);

    const hasConflict = await checkScheduleConflict(req.body, id);
    if (hasConflict) {
      return res.status(409).json({ error: 'Schedule conflicts with an existing schedule for the same tank' });
    }

    const updatedSchedule = await ProductionSchedule.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSchedule) {
      debug('Production schedule not found with id: %s', id);
      return res.status(404).json({ error: 'Production schedule not found' });
    }

    debug('Successfully updated production schedule');
    res.json(updatedSchedule);
  } catch (error) {
    debug('Error updating production schedule: %O', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    debug('Deleting production schedule with id: %s', id);

    const deletedSchedule = await ProductionSchedule.findByIdAndDelete(id);
    if (!deletedSchedule) {
      debug('Production schedule not found with id: %s', id);
      return res.status(404).json({ error: 'Production schedule not found' });
    }

    debug('Successfully deleted production schedule');
    res.json({ message: 'Production schedule deleted successfully' });
  } catch (error) {
    debug('Error deleting production schedule: %O', error);
    res.status(500).json({ error: error.message });
  }
};