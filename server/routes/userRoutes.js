const express = require('express');
const router = express.Router();
const UserService = require('../services/user');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/log');

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    logger.debug('Getting current user profile:', { userId: req.user.userId });
    const user = await UserService.get(req.user.userId);
    
    if (!user) {
      logger.warn('User not found for /me endpoint:', { userId: req.user.userId });
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive fields
    const userProfile = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      preferences: user.preferences
    };

    logger.debug('User profile retrieved successfully:', { userId: req.user.userId });
    res.json(userProfile);
  } catch (error) {
    logger.error('Error getting user profile:', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ error: 'Error retrieving user profile' });
  }
});

// Other user routes...

module.exports = router; 