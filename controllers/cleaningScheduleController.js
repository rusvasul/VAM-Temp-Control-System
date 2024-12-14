const CleaningSchedule = require('../models/CleaningSchedule');

exports.createSchedule = async (req, res) => {
  try {
    const schedule = new CleaningSchedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await CleaningSchedule.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await CleaningSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await CleaningSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getScheduleByTankId = async (req, res) => {
  try {
    const schedule = await CleaningSchedule.findOne({ tankId: req.params.tankId });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 