const express = require('express');
const router = express.Router();
const UserService = require('../services/user');
const jwt = require('jsonwebtoken');
const logger = require('../utils/log');

// Log route initialization
logger.info('Auth routes initialized');

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, isAdmin = false } = req.body;

    // Create new user using UserService
    const user = await UserService.createUser({ email, password, isAdmin });

    // Generate JWT token for immediate login
    const { token } = await UserService.regenerateToken(user);

    logger.info(`New user registered: ${email} with isAdmin: ${isAdmin}`);
    res.status(201).json({
      message: 'User created successfully',
      token,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    logger.error(`Registration error: ${error}`);
    if (error === 'User with this email already exists') {
      return res.status(400).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      logger.warn('Login attempt with missing credentials');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate user with password
    const user = await UserService.authenticateWithPassword(email, password);
    if (!user) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate new token
    const { token } = await UserService.regenerateToken(user);

    logger.info(`User logged in successfully: ${email} with isAdmin: ${user.isAdmin}`);
    res.json({
      token,
      isAdmin: user.isAdmin,
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Login error:', error);
    logger.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  try {
    // Check for authorization header
    if (!req.headers.authorization) {
      logger.info('Logout attempt with no token provided');
      return res.status(200).json({ message: 'No token to invalidate' });
    }

    // Validate token format
    const [bearer, token] = req.headers.authorization.split(' ');
    if (bearer !== 'Bearer' || !token) {
      logger.warn('Logout attempt with invalid token format');
      return res.status(400).json({ error: 'Invalid token format' });
    }

    logger.info('User logged out successfully');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    logger.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;