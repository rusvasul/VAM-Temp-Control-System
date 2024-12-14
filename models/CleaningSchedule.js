const mongoose = require('mongoose');

const cleaningScheduleSchema = new mongoose.Schema({
  tankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tank',
    required: true
  },
  schedule: {
    type: String,
    enum: ['Daily', 'Weekly', 'Biweekly', 'Monthly'],
    required: true
  },
  lastCleaning: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CleaningSchedule', cleaningScheduleSchema); 