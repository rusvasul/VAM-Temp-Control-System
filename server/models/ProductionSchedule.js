const mongoose = require('mongoose');
const debug = require('debug')('app:models:productionSchedule');

const productionScheduleSchema = new mongoose.Schema({
  tankId: {
    type: String,
    required: [true, 'Tank ID is required']
  },
  brewStyle: {
    type: String,
    required: [true, 'Brew style is required'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add validation for dates
productionScheduleSchema.path('startDate').validate(function(value) {
  return value >= new Date();
}, 'Start date must be in the future');

productionScheduleSchema.path('endDate').validate(function(value) {
  if (this.startDate && value) {
    return value > this.startDate;
  }
  return true;
}, 'End date must be after start date');

// Add method to check for schedule conflicts
productionScheduleSchema.statics.checkConflict = async function(tankId, startDate, endDate, excludeId = null) {
  debug(`Checking conflicts for tank ${tankId} between ${startDate} and ${endDate}`);
  
  const query = {
    tankId,
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const conflictingSchedule = await this.findOne(query);
  debug(`Conflict check result: ${conflictingSchedule ? 'Conflict found' : 'No conflict'}`);
  
  return !!conflictingSchedule;
};

// Add pre-save hook for validation
productionScheduleSchema.pre('save', async function(next) {
  try {
    if (this.isModified('startDate') || this.isModified('endDate') || this.isModified('tankId')) {
      const hasConflict = await this.constructor.checkConflict(
        this.tankId,
        this.startDate,
        this.endDate,
        this._id
      );

      if (hasConflict) {
        throw new Error('Schedule conflicts with existing production schedule');
      }
    }
    next();
  } catch (error) {
    debug('Error in pre-save hook:', error);
    next(error);
  }
});

module.exports = mongoose.model('ProductionSchedule', productionScheduleSchema);