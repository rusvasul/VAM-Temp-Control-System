const User = require('../models/user');
const logger = require('../utils/log');
const jwt = require('jsonwebtoken');
const config = require('../config');

class UserService {
  static async get(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      return user;
    } catch (error) {
      logger.error('Error getting user:', error);
      throw error;
    }
  }

  static async getByEmail(email) {
    try {
      logger.debug('Getting user by email:', email);
      const user = await User.findOne({ email }).exec();
      logger.debug('Found user:', { exists: !!user });
      return user;
    } catch (err) {
      logger.error('Database error while getting user by email:', err);
      throw `Database error while getting the user by their email: ${err}`;
    }
  }

  static async update(userId, updates) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true }
      ).select('-password');
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  static async delete(userId) {
    try {
      await User.findByIdAndDelete(userId);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  static async authenticateWithPassword(email, password) {
    if (!email) throw 'Email is required';
    if (!password) throw 'Password is required';

    try {
      const user = await User.findOne({ email, status: 'active' }).exec();
      if (!user) return null;

      const passwordValid = await user.comparePassword(password);
      if (!passwordValid) return null;

      user.lastLoginAt = Date.now();
      const updatedUser = await user.save();
      return updatedUser;
    } catch (err) {
      logger.error('Database error while authenticating user:', err);
      throw `Database error while authenticating user ${email} with password: ${err}`;
    }
  }

  static async generateToken(user) {
    const token = jwt.sign(
      { 
        userId: user._id,
        isAdmin: user.isAdmin,
        status: user.status
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiration }
    );

    return token;
  }
}

module.exports = UserService;
