const mongoose = require('mongoose');

const tankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  temperature: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Inactive'
  },
  mode: {
    type: String,
    enum: ['Cooling', 'Heating', 'Idle'],
    default: 'Idle'
  },
  valveStatus: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Closed'
  }
}, { timestamps: true });

const Tank = mongoose.model('Tank', tankSchema);

module.exports = Tank;