const debug = require('debug')('app:services:alarmMonitor');
const Tank = require('../models/Tank');
const Alarm = require('../models/Alarm');
const SystemStatus = require('../models/SystemStatus');

class AlarmMonitor {
  constructor(checkInterval = 5000) { // Check every 5 seconds for testing
    this.checkInterval = checkInterval;
    this.intervalId = null;
  }

  async checkAlarms() {
    debug('Checking alarms');
    try {
      // Fetch all tanks and system status
      const tanks = await Tank.find();
      const systemStatus = await SystemStatus.findOne();

      if (!tanks?.length) {
        debug('No tanks found to monitor');
        return;
      }

      if (!systemStatus) {
        debug('No system status found');
        return;
      }

      debug(`Checking alarms for ${tanks.length} tanks`);

      for (const tank of tanks) {
        // Get all alarms for this tank
        const alarms = await Alarm.find({ tankId: tank._id });
        debug(`Found ${alarms.length} alarms for tank ${tank.name}`);

        for (const alarm of alarms) {
          try {
            await this.checkAlarmCondition(alarm, tank, systemStatus);
          } catch (error) {
            debug(`Error checking alarm condition for alarm ${alarm._id}:`, error);
            console.error('Error checking alarm condition:', error);
          }
        }
      }

      debug('Completed alarm check cycle');

    } catch (error) {
      debug('Error during alarm check cycle:', error);
      console.error('Error checking alarms:', error);
    }
  }

  async checkAlarmCondition(alarm, tank, systemStatus) {
    const shouldTrigger = this.evaluateAlarmCondition(alarm, tank, systemStatus);
    const wasActive = alarm.isActive;

    try {
      if (shouldTrigger !== wasActive) {
        alarm.isActive = shouldTrigger;
        await alarm.save();

        const sse = global.app.get('sse');
        if (sse) {
          sse.send({
            type: shouldTrigger ? 'ALARM_TRIGGERED' : 'ALARM_CLEARED',
            alarm: {
              id: alarm._id,
              name: alarm.name,
              tankId: tank._id,
              tankName: tank.name,
              temperature: tank.temperature,
              threshold: alarm.threshold,
              timestamp: new Date()
            }
          }, 'alarm-update');
        }

        debug(`Alarm ${alarm.name} for tank ${tank.name} ${shouldTrigger ? 'triggered' : 'cleared'} (Temperature: ${tank.temperature}°F)`);
      }
    } catch (error) {
      debug(`Error updating alarm status: ${error.message}`);
      throw error;
    }
  }

  evaluateAlarmCondition(alarm, tank, systemStatus) {
    switch (alarm.type) {
      case 'High Temperature':
        return tank.temperature > alarm.threshold;

      case 'Low Temperature':
        return tank.temperature < alarm.threshold;

      case 'System Error':
        return this.checkSystemError(tank, systemStatus);

      default:
        debug(`Unknown alarm type: ${alarm.type}`);
        return false;
    }
  }

  checkSystemError(tank, systemStatus) {
    // Check for various system error conditions
    const hasSystemError = (
      systemStatus.chillerStatus === 'Off' && tank.mode === 'Cooling' ||
      systemStatus.heaterStatus === 'Off' && tank.mode === 'Heating' ||
      (tank.mode !== 'Idle' && systemStatus.systemMode === 'Idle')
    );

    return hasSystemError;
  }

  start() {
    debug('Starting alarm monitor service');
    if (!this.intervalId) {
      this.checkAlarms(); // Run initial check immediately
      this.intervalId = setInterval(() => this.checkAlarms(), this.checkInterval);
      debug(`Alarm monitor started with ${this.checkInterval}ms check interval`);
    } else {
      debug('Alarm monitor already running');
    }
  }

  stop() {
    debug('Stopping alarm monitor service');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      debug('Alarm monitor stopped');
    } else {
      debug('Alarm monitor already stopped');
    }
  }
}

module.exports = AlarmMonitor;