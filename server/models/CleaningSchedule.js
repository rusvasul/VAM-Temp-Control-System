const mongoose = require('mongoose');
const debug = require('debug')('app:models:cleaningSchedule');

const cleaningScheduleSchema = new mongoose.Schema({
  tankId: {
    type: String,
    required: [true, 'Tank ID is required']
  },
  type: {
    type: String,
    enum: {
      values: ['recurring', 'single'],
      message: '{VALUE} is not a valid schedule type'
    },
    required: [true, 'Schedule type is required']
  },
  schedule: {
    type: String,
    enum: {
      values: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'],
      message: '{VALUE} is not a valid schedule frequency'
    },
    required: [
      function() { return this.type === 'recurring'; },
      'Schedule frequency is required for recurring schedules'
    ]
  },
  lastCleaning: {
    type: Date,
    required: [true, 'Last cleaning date is required']
  },
  nextCleaning: {
    type: Date,
    required: [true, 'Next cleaning date is required']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate next cleaning date before saving
cleaningScheduleSchema.pre('save', function(next) {
  try {
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
      throw new Error('Invalid schedule type');
    }

    const nextDate = new Date(this.lastCleaning);
    nextDate.setDate(nextDate.getDate() + days);
    this.nextCleaning = nextDate;

    debug(`Calculated next cleaning date for tank ${this.tankId}: ${this.nextCleaning}`);
    next();
  } catch (error) {
    debug('Error calculating next cleaning date:', error);
    next(error);
  }
});

// Add validation for lastCleaning date
cleaningScheduleSchema.path('lastCleaning').validate(function(value) {
  return value <= new Date();
}, 'Last cleaning date cannot be in the future');

module.exports = mongoose.model('CleaningSchedule', cleaningScheduleSchema);