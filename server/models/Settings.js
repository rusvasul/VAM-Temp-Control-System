const mongoose = require('mongoose');
const debug = require('debug')('app:models:settings');

const SettingsSchema = new mongoose.Schema({
  temperatureUnit: {
    type: String,
    enum: ['celsius', 'fahrenheit'], 
    default: 'celsius'
  },
  refreshRate: {
    type: Number,
    min: 1,
    max: 3600,
    default: 30
  },
  numberOfTanks: {
    type: Number,
    min: 1,
    max: 20,
    default: 9
  }
}, { timestamps: true });

// Log settings changes
SettingsSchema.post('save', function(doc) {
  debug('Settings saved:', doc);
});

// Add error handling for validation errors
SettingsSchema.post('save', function(error, doc, next) {
  if (error.name === 'ValidationError') {
    debug('Validation error when saving settings:', error);
    next(error);
  } else {
    next();
  }
});

// Ensure we're using the existing model if it exists
const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

module.exports = Settings;