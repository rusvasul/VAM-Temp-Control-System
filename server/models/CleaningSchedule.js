const mongoose = require('mongoose');

const cleaningScheduleSchema = new mongoose.Schema({
  tankId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['recurring', 'single'],
    required: true
  },
  schedule: {
    type: String,
    enum: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'],
    required: function() {
      return this.type === 'recurring';
    }
  },
  lastCleaning: {
    type: Date,
    required: true
  },
  nextCleaning: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Calculate next cleaning date before saving
cleaningScheduleSchema.pre('save', function(next) {
  if (this.type === 'single') {
    this.nextCleaning = this.lastCleaning;
    return next();
  }

  const intervals = {
    Daily: 1,
    Weekly: 7,
    'Bi-weekly': 14,
    Monthly: 30
  };

  const days = intervals[this.schedule];
  if (!days) {
    return next(new Error('Invalid schedule type'));
  }

  const nextDate = new Date(this.lastCleaning);
  nextDate.setDate(nextDate.getDate() + days);
  this.nextCleaning = nextDate;

  next();
});

module.exports = mongoose.model('CleaningSchedule', cleaningScheduleSchema);