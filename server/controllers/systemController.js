const logger = require('../utils/log');
const Tank = require('../models/tank');
const User = require('../models/user');
const BrewStyle = require('../models/brewStyle');

class SystemController {
  static async getSystemStatus(req, res) {
    try {
      const [
        tankCount,
        userCount,
        brewStyleCount,
        activeTanks
      ] = await Promise.all([
        Tank.countDocuments(),
        User.countDocuments(),
        BrewStyle.countDocuments(),
        Tank.countDocuments({ status: 'Active' })
      ]);

      const systemStatus = {
        totalTanks: tankCount,
        activeTanks,
        totalUsers: userCount,
        totalBrewStyles: brewStyleCount,
        systemHealth: 'OK',
        lastUpdate: new Date().toISOString()
      };

      logger.debug('System status retrieved:', systemStatus);
      res.json(systemStatus);
    } catch (error) {
      logger.error('Error getting system status:', error);
      res.status(500).json({ error: 'Error retrieving system status' });
    }
  }
}

module.exports = SystemController; 