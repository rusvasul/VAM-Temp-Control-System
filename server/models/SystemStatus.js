const mongoose = require('mongoose');

const systemStatusSchema = new mongoose.Schema({
  chillerStatus: {
    type: String,
    enum: ['Running', 'Standby', 'Off'],
    default: 'Standby'
  },
  heaterStatus: {
    type: String,
    enum: ['Running', 'Standby', 'Off'],
    default: 'Standby'
  },
  systemMode: {
    type: String,
    enum: ['Cooling', 'Heating', 'Idle'],
    default: 'Idle'
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemStatus', systemStatusSchema);