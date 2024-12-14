const mongoose = require('mongoose');
const debug = require('debug')('app:models:alarm');

const AlarmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['High Temperature', 'Low Temperature', 'System Error'],
    required: true
  },
  threshold: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return !isNaN(v);
      },
      message: 'Threshold must be a valid number'
    }
  },
  tankId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Log alarm creation
AlarmSchema.post('save', function(doc) {
  debug(`New alarm created: ${doc.name} (${doc._id})`);
});

// Log alarm updates
AlarmSchema.post('findOneAndUpdate', function(doc) {
  if (doc) {
    debug(`Alarm updated: ${doc.name} (${doc._id})`);
  }
});

// Log alarm deletion
AlarmSchema.post('findOneAndDelete', function(doc) {
  if (doc) {
    debug(`Alarm deleted: ${doc.name} (${doc._id})`);
  }
});

// Add error handling for validation errors
AlarmSchema.post('save', function(error, doc, next) {
  if (error.name === 'ValidationError') {
    debug('Validation error when saving alarm:', error);
    next(error);
  } else {
    next();
  }
});

// Method to check and trigger alarm based on tank conditions
AlarmSchema.methods.checkAndTrigger = async function(tank, systemStatus) {
  const shouldTrigger = this.type === 'High Temperature' ?
    tank.temperature > this.threshold :
    this.type === 'Low Temperature' ?
    tank.temperature < this.threshold :
    false; // For 'System Error' type, we'll need to implement specific logic

  try {
    if (shouldTrigger && !this.isActive) {
      this.isActive = true;
      await this.save();
      debug(`Alarm triggered: ${this.name} for tank ${tank.name} (Temperature: ${tank.temperature}°C, Threshold: ${this.threshold}°C)`);
      // Here you could emit an SSE event or use another method to notify the frontend
    } else if (!shouldTrigger && this.isActive) {
      this.isActive = false;
      await this.save();
      debug(`Alarm cleared: ${this.name} for tank ${tank.name} (Temperature: ${tank.temperature}°C, Threshold: ${this.threshold}°C)`);
      // Here you could emit an SSE event or use another method to notify the frontend
    }
  } catch (error) {
    debug('Error in checkAndTrigger:', error);
    throw new Error(`Failed to check/trigger alarm: ${error.message}`);
  }
};

module.exports = mongoose.model('Alarm', AlarmSchema);