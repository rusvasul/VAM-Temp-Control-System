const mongoose = require('mongoose');

const productionScheduleSchema = new mongoose.Schema({
  tankId: {
    type: String,
    required: true
  },
  beerStyle: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ProductionSchedule', productionScheduleSchema);