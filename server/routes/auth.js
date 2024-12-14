const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/log');

// Log route initialization
logger.info('Auth routes initialized');

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password });
    await user.save();

    logger.info(`New user registered: ${email}`);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
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

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.SESSION_SECRET, 
      { expiresIn: '1h' }
    );

    logger.info(`User logged in successfully: ${email}`);
    res.json({ 
      token, 
      isAdmin: user.isAdmin || false,
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
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        logger.info('User logged out successfully');
        res.json({ message: 'Logged out successfully' });
      } else {
        logger.warn('Logout attempt with invalid token format');
        res.status(400).json({ error: 'Invalid token format' });
      }
    } else {
      logger.info('Logout attempt with no token provided');
      res.status(200).json({ message: 'No token to destroy' });
    }
  } catch (error) {
    logger.error('Logout error:', error);
    logger.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;