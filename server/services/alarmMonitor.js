const debug = require('debug')('app:services:alarmMonitor');
const Tank = require('../models/Tank');
const Alarm = require('../models/Alarm');
const SystemStatus = require('../models/SystemStatus');

class AlarmMonitor {
  constructor() {
    this.interval = null;
    this.checkInterval = 5000; // 5 seconds
    this.debug = require('debug')('app:alarmMonitor');
  }

  async checkAlarms() {
    try {
      const tanks = await Tank.find();

      for (const tank of tanks) {
        const alarms = await Alarm.find({ tankId: tank.name });

        // Your alarm checking logic here...
      }
    } catch (error) {
      this.debug('Error checking alarms:', error);
    }
  }

  start() {
    this.debug('Alarm monitor started');
    this.checkAlarms();
    this.interval = setInterval(() => this.checkAlarms(), this.checkInterval);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.debug('Alarm monitor stopped');
    }
  }
}

module.exports = AlarmMonitor;