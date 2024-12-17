const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user.js');
const { generatePasswordHash, validatePassword } = require('../utils/password.js');

class UserService {
  static async list(filters = {}) {
    try {
      const query = { ...filters };
      return User.find(query).select('-password');
    } catch (err) {
      throw `Database error while listing users: ${err}`;
    }
  }

  static async get(id) {
    try {
      return User.findOne({ _id: id }).select('-password').exec();
    } catch (err) {
      throw `Database error while getting the user by their ID: ${err}`;
    }
  }

  static async getByEmail(email) {
    try {
      return User.findOne({ email }).select('-password').exec();
    } catch (err) {
      throw `Database error while getting the user by their email: ${err}`;
    }
  }

  static async update(id, data) {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const { password, isAdmin, status, ...updateData } = data;
      
      // If there's a password change, hash it
      if (password) {
        updateData.password = await generatePasswordHash(password);
      }

      const user = await User.findOneAndUpdate(
        { _id: id },
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw 'User not found';
      }

      return user;
    } catch (err) {
      throw `Database error while updating user ${id}: ${err}`;
    }
  }

  static async updatePreferences(id, preferences) {
    try {
      const user = await User.findOneAndUpdate(
        { _id: id },
        { $set: { preferences } },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw 'User not found';
      }

      return user;
    } catch (err) {
      throw `Database error while updating user preferences: ${err}`;
    }
  }

  static async updateStatus(id, status, adminId) {
    try {
      // Verify the admin user exists and is actually an admin
      const admin = await User.findOne({ _id: adminId, isAdmin: true });
      if (!admin) {
        throw 'Unauthorized to change user status';
      }

      const user = await User.findOneAndUpdate(
        { _id: id },
        { $set: { status } },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw 'User not found';
      }

      return user;
    } catch (err) {
      throw `Database error while updating user status: ${err}`;
    }
  }

  static async delete(id, adminId) {
    try {
      // Verify the admin user exists and is actually an admin
      const admin = await User.findOne({ _id: adminId, isAdmin: true });
      if (!admin) {
        throw 'Unauthorized to delete users';
      }

      const result = await User.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw `Database error while deleting user ${id}: ${err}`;
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
      throw `Database error while authenticating user ${email} with password: ${err}`;
    }
  }

  static async authenticateWithToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId).select('-password').exec();
      
      if (!user || user.status !== 'active') {
        throw 'User is not active';
      }

      return user;
    } catch (err) {
      throw `Invalid or expired token: ${err}`;
    }
  }

  static async regenerateToken(user) {
    const token = jwt.sign(
      { 
        userId: user._id,
        isAdmin: user.isAdmin,
        status: user.status
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    return { user, token };
  }

  static async createUser({ email, password, firstName, lastName, phoneNumber, position, department, isAdmin = false }) {
    if (!email) throw 'Email is required';
    if (!password) throw 'Password is required';

    const existingUser = await UserService.getByEmail(email);
    if (existingUser) throw 'User with this email already exists';

    const hash = await generatePasswordHash(password);

    try {
      const user = new User({
        email,
        password: hash,
        firstName,
        lastName,
        phoneNumber,
        position,
        department,
        isAdmin,
        preferences: {
          notifications: {
            email: {
              enabled: true,
              types: ['system', 'alarms']
            },
            push: {
              enabled: true,
              types: ['system', 'alarms']
            }
          },
          theme: 'system',
          dashboardLayout: new Map()
        }
      });

      await user.save();
      return user;
    } catch (err) {
      throw `Database error while creating new user: ${err}`;
    }
  }

  static async changePassword(id, currentPassword, newPassword) {
    if (!currentPassword) throw 'Current password is required';
    if (!newPassword) throw 'New password is required';

    try {
      const user = await User.findById(id);
      if (!user) throw 'User not found';

      const passwordValid = await user.comparePassword(currentPassword);
      if (!passwordValid) throw 'Current password is incorrect';

      user.password = await generatePasswordHash(newPassword);
      await user.save();

      return true;
    } catch (err) {
      throw `Error changing password: ${err}`;
    }
  }

  static async resetPassword(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) throw 'User not found';

      const tempPassword = randomUUID().slice(0, 8);
      user.password = await generatePasswordHash(tempPassword);
      await user.save();

      // In a real application, you would send this via email
      // For now, we'll just return it
      return tempPassword;
    } catch (err) {
      throw `Error resetting password: ${err}`;
    }
  }
}

module.exports = UserService;
