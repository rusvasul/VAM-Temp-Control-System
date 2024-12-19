const mongoose = require('mongoose');
const debug = require('debug')('app:models:productionSchedule');
const { format } = require('date-fns');

const productionScheduleSchema = new mongoose.Schema({
  tankId: {
    type: String,
    required: [true, 'Tank ID is required']
  },
  brewStyle: {
    type: String,
    required: [true, 'Brew style is required'],
    ref: 'BrewStyle'
  },
  batchNumber: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  expectedVolume: {
    type: Number,
    required: [true, 'Expected volume is required'],
    min: [0, 'Volume cannot be negative']
  },
  actualVolume: {
    type: Number,
    min: [0, 'Volume cannot be negative']
  },
  notes: {
    type: String,
    maxLength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add validation for start date
productionScheduleSchema.path('startDate').validate(function(value) {
  if (this.isNew) {
    return value >= new Date();
  }
  return true;
}, 'Start date must be in the future for new schedules');

// Add validation for actual volume
productionScheduleSchema.path('actualVolume').validate(function(value) {
  if (value !== undefined && this.expectedVolume) {
    return value <= this.expectedVolume * 1.1; // Allow 10% overflow
  }
  return true;
}, 'Actual volume cannot exceed expected volume by more than 10%');

// Calculate end date and batch number before saving
productionScheduleSchema.pre('save', async function(next) {
  try {
    // Only calculate if this is a new schedule or if start date or brew style changed
    if (this.isNew || this.isModified('startDate') || this.isModified('brewStyle')) {
      // Get the brew style details
      const BrewStyle = mongoose.model('BrewStyle');
      const brewStyle = await BrewStyle.findOne({ name: this.brewStyle });
      
      if (!brewStyle) {
        throw new Error('Brew style not found');
      }

      // Calculate total duration in days
      const totalDays = 
        brewStyle.operationTiming.primaryFermentationDays +
        (brewStyle.operationTiming.secondaryFermentationDays || 0) +
        brewStyle.operationTiming.clarificationDays +
        brewStyle.operationTiming.conditioningDays;

      // Calculate end date
      const endDate = new Date(this.startDate);
      endDate.setDate(endDate.getDate() + totalDays);
      this.endDate = endDate;

      // Set expected volume from recipe
      if (brewStyle.beverageType === 'mead') {
        this.expectedVolume = brewStyle.waterAddition.targetVolume;
      } else if (brewStyle.beverageType === 'cider') {
        this.expectedVolume = brewStyle.juice.totalVolume;
      } else if (brewStyle.beverageType === 'beer') {
        this.expectedVolume = brewStyle.water.mashVolume + brewStyle.water.spargeVolume;
      }

      // Generate batch number (recipe name + start date in yymmdd format)
      const dateStr = format(new Date(this.startDate), 'yyMMdd');
      this.batchNumber = `${brewStyle.name} ${dateStr}`;

      // Check for schedule conflicts
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

// Add method to check for schedule conflicts
productionScheduleSchema.statics.checkConflict = async function(tankId, startDate, endDate, excludeId = null) {
  debug(`Checking conflicts for tank ${tankId} between ${startDate} and ${endDate}`);
  
  const query = {
    tankId,
    status: { $ne: 'cancelled' },
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

// Add virtual for duration in days
productionScheduleSchema.virtual('durationDays').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Add virtual for progress percentage
productionScheduleSchema.virtual('progress').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'cancelled') return 0;
  
  const now = new Date();
  if (now < this.startDate) return 0;
  if (now > this.endDate) return 100;
  
  const total = this.endDate - this.startDate;
  const elapsed = now - this.startDate;
  return Math.round((elapsed / total) * 100);
});

module.exports = mongoose.model('ProductionSchedule', productionScheduleSchema);