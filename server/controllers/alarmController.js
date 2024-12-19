const logger = require('../utils/log');
const Tank = require('../models/tank');

class AlarmController {
  static async getAlarms(req, res) {
    try {
      // Get tanks with temperature outside normal range or in maintenance
      const tanks = await Tank.find({
        $or: [
          { status: 'Maintenance' },
          {
            $and: [
              { temperature: { $exists: true } },
              {
                $or: [
                  { temperature: { $gt: 80 } }, // High temp alarm
                  { temperature: { $lt: 32 } }  // Low temp alarm
                ]
              }
            ]
          }
        ]
      });

      const alarms = tanks.map(tank => ({
        tankId: tank._id,
        tankName: tank.name,
        type: tank.status === 'Maintenance' ? 'MAINTENANCE' : 'TEMPERATURE',
        severity: 'WARNING',
        message: tank.status === 'Maintenance' 
          ? `Tank ${tank.name} is under maintenance`
          : `Tank ${tank.name} temperature (${tank.temperature}°F) is outside normal range`,
        timestamp: new Date().toISOString()
      }));

      logger.debug('Retrieved alarms:', { count: alarms.length });
      res.json(alarms);
    } catch (error) {
      logger.error('Error getting alarms:', error);
      res.status(500).json({ error: 'Error retrieving alarms' });
    }
  }
}

module.exports = AlarmController; 