const mongoose = require('mongoose');

const beerStyleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  minTemp: {
    type: Number,
    required: true
  },
  maxTemp: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('BeerStyle', beerStyleSchema);