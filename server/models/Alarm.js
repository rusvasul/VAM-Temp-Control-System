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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tank',
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

module.exports = mongoose.model('Alarm', AlarmSchema);