const express = require('express');
const router = express.Router();
const UserService = require('../services/user');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const debug = require('debug')('app:routes:users');

// Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.get(req.user._id);
    res.json(user);
  } catch (error) {
    debug('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update current user's profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.update(req.user._id, req.body);
    res.json(user);
  } catch (error) {
    debug('Error updating user profile:', error);
    res.status(400).json({ error: error.toString() });
  }
});

// Update current user's preferences
router.put('/me/preferences', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.updatePreferences(req.user._id, req.body);
    res.json(user);
  } catch (error) {
    debug('Error updating user preferences:', error);
    res.status(400).json({ error: error.toString() });
  }
});

// Change current user's password
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await UserService.changePassword(req.user._id, currentPassword, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    debug('Error changing password:', error);
    res.status(400).json({ error: error.toString() });
  }
});

// Request password reset
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const tempPassword = await UserService.resetPassword(email);
    res.json({ 
      message: 'Password reset successful',
      tempPassword // In production, this would be sent via email instead
    });
  } catch (error) {
    debug('Error resetting password:', error);
    res.status(400).json({ error: error.toString() });
  }
});

// Admin routes
router.use(requireAdmin); // All routes below this line require admin privileges

// List all users
router.get('/', async (req, res) => {
  try {
    const users = await UserService.list(req.query);
    res.json(users);
  } catch (error) {
    debug('Error listing users:', error);
    res.status(500).json({ error: error.toString() });
  }
});

// Get specific user
router.get('/:id', async (req, res) => {
  try {
    const user = await UserService.get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    debug('Error fetching user:', error);
    res.status(500).json({ error: error.toString() });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const user = await UserService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    debug('Error creating user:', error);
    res.status(400).json({ error: error.toString() });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await UserService.update(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    debug('Error updating user:', error);
    res.status(400).json({ error: error.toString() });
  }
});

// Update user status
router.put('/:id/status', async (req, res) => {
  try {
    const user = await UserService.updateStatus(req.params.id, req.body.status, req.user._id);
    res.json(user);
  } catch (error) {
    debug('Error updating user status:', error);
    res.status(400).json({ error: error.toString() });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const success = await UserService.delete(req.params.id, req.user._id);
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    debug('Error deleting user:', error);
    res.status(500).json({ error: error.toString() });
  }
});

module.exports = router; 