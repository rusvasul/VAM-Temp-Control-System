const CleaningSchedule = require('../models/CleaningSchedule');
const Tank = require('../models/Tank');
const debug = require('debug')('app:controllers:cleaningSchedules');
const { cleaningScheduleValidationSchema } = require('../models/CleaningSchedule');

const calculateNextCleaning = (lastCleaning, schedule) => {
  const date = new Date(lastCleaning);
  switch (schedule) {
    case 'Daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'Weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'Bi-weekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'Monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return date;
  }
  return date;
};

exports.createSchedule = async (req, res) => {
  debug('POST /api/cleaning-schedules called');
  try {
    const { tankId, type, schedule, lastCleaning } = req.body;
    debug('Request body:', req.body);

    // Validate request body
    const { error } = cleaningScheduleValidationSchema.validate(req.body);
    if (error) {
      debug('Validation error:', error.details);
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verify tank exists
    const tank = await Tank.findById(tankId);
    if (!tank) {
      debug(`Tank not found with id: ${tankId}`);
      return res.status(404).json({ error: 'Tank not found' });
    }

    // Calculate next cleaning date
    const nextCleaning = type === 'recurring' 
      ? calculateNextCleaning(lastCleaning, schedule)
      : new Date(lastCleaning);

    const cleaningSchedule = new CleaningSchedule({
      tankId: tank._id.toString(), // Convert ObjectId to string
      type,
      schedule,
      lastCleaning: new Date(lastCleaning),
      nextCleaning
    });

    await cleaningSchedule.save();
    debug('Cleaning schedule created:', cleaningSchedule);

    res.status(201).json(cleaningSchedule);
  } catch (error) {
    debug('Error creating cleaning schedule:', error);
    res.status(500).json({ error: 'Failed to create cleaning schedule' });
  }
};

exports.getSchedules = async (req, res) => {
  debug('GET /api/cleaning-schedules called');
  try {
    const schedules = await CleaningSchedule.find();
    debug('Found cleaning schedules:', schedules);
    res.json(schedules);
  } catch (error) {
    debug('Error fetching cleaning schedules:', error);
    res.status(500).json({ error: 'Failed to fetch cleaning schedules' });
  }
};

exports.getScheduleByTankId = async (req, res) => {
  const { tankId } = req.params;
  debug(`GET /api/cleaning-schedules/tank/${tankId} called`);
  try {
    const schedule = await CleaningSchedule.findOne({ tankId });
    if (!schedule) {
      debug(`No schedule found for tank: ${tankId}`);
      return res.status(404).json({ error: 'Schedule not found' });
    }
    debug('Found schedule:', schedule);
    res.json(schedule);
  } catch (error) {
    debug('Error fetching cleaning schedule:', error);
    res.status(500).json({ error: 'Failed to fetch cleaning schedule' });
  }
};

exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  debug(`PUT /api/cleaning-schedules/${id} called`);
  try {
    const schedule = await CleaningSchedule.findById(id);
    if (!schedule) {
      debug(`Schedule not found with id: ${id}`);
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const updates = req.body;
    if (updates.lastCleaning) {
      updates.nextCleaning = schedule.type === 'recurring'
        ? calculateNextCleaning(updates.lastCleaning, schedule.schedule)
        : new Date(updates.lastCleaning);
    }

    const updatedSchedule = await CleaningSchedule.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    debug('Schedule updated:', updatedSchedule);
    res.json(updatedSchedule);
  } catch (error) {
    debug('Error updating cleaning schedule:', error);
    res.status(500).json({ error: 'Failed to update cleaning schedule' });
  }
};

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  debug(`DELETE /api/cleaning-schedules/${id} called`);
  try {
    const schedule = await CleaningSchedule.findByIdAndDelete(id);
    if (!schedule) {
      debug(`Schedule not found with id: ${id}`);
      return res.status(404).json({ error: 'Schedule not found' });
    }
    debug('Schedule deleted successfully');
    res.status(204).send();
  } catch (error) {
    debug('Error deleting cleaning schedule:', error);
    res.status(500).json({ error: 'Failed to delete cleaning schedule' });
  }
}; 