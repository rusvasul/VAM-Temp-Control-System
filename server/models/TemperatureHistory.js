const mongoose = require('mongoose');

const temperatureHistorySchema = new mongoose.Schema({
  tankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tank',
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for faster querying
temperatureHistorySchema.index({ tankId: 1, timestamp: -1 });

// Add methods to handle temperature history operations
temperatureHistorySchema.statics.addTemperatureReading = async function(tankId, temperature) {
  try {
    const reading = new this({
      tankId,
      temperature
    });
    return await reading.save();
  } catch (error) {
    console.error('Error adding temperature reading:', error);
    throw error;
  }
};

temperatureHistorySchema.statics.getTemperatureHistory = async function(tankId, startDate, endDate) {
  try {
    const query = { tankId };
    if (startDate && endDate) {
      query.timestamp = { $gte: startDate, $lte: endDate };
    }
    return await this.find(query).sort({ timestamp: 1 });
  } catch (error) {
    console.error('Error getting temperature history:', error);
    throw error;
  }
};

temperatureHistorySchema.statics.deleteTemperatureHistory = async function(tankId) {
  try {
    return await this.deleteMany({ tankId });
  } catch (error) {
    console.error('Error deleting temperature history:', error);
    throw error;
  }
};

// Pre-save hook to validate temperature range
temperatureHistorySchema.pre('save', function(next) {
  if (this.temperature < -50 || this.temperature > 150) {
    next(new Error('Temperature must be between -50°C and 150°C'));
  } else {
    next();
  }
});

const TemperatureHistory = mongoose.model('TemperatureHistory', temperatureHistorySchema);

module.exports = TemperatureHistory;