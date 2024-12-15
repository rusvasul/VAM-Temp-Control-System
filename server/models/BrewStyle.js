const mongoose = require('mongoose');

const brewStyleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  minTemp: {
    type: Number,
    required: true
  },
  maxTemp: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BrewStyle', brewStyleSchema);