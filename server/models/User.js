const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const logger = require('../utils/log');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_activation'],
    default: 'pending_activation'
  },
  lastLoginAt: {
    type: Date
  },
  preferences: {
    notifications: {
      email: {
        enabled: { type: Boolean, default: true },
        types: [{ type: String, enum: ['system', 'alarms', 'schedules', 'maintenance'] }]
      },
      push: {
        enabled: { type: Boolean, default: true },
        types: [{ type: String, enum: ['system', 'alarms', 'schedules', 'maintenance'] }]
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    dashboardLayout: {
      type: Map,
      of: String
    }
  },
  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Email verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Remember me functionality
  rememberMeTokens: [{
    token: String,
    expires: Date,
    userAgent: String,
    lastUsed: Date
  }],
  
  // Security
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  backupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false
    }
  }],
  
  // Session tracking
  activeSessions: [{
    token: String,
    userAgent: String,
    lastActive: Date,
    ipAddress: String,
    expiresAt: Date
  }]
}, {
  timestamps: true,
  collection: 'users'
});

// Log schema creation
logger.info('Creating User model with schema:', {
  collection: userSchema.options.collection,
  paths: Object.keys(userSchema.paths),
  indexes: userSchema.indexes()
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    logger.debug('Pre-save hook triggered for user:', {
      id: this._id,
      email: this.email,
      isNew: this.isNew,
      collection: this.collection.name,
      passwordLength: this.password?.length,
      isPasswordModified: this.isModified('password'),
      passwordType: typeof this.password,
      passwordStart: this.password?.substring(0, 3) + '...'
    });
    
    if (!this.isModified('password')) {
      logger.debug('Password not modified, skipping hash');
      return next();
    }

    if (!this.password) {
      logger.error('No password provided for hashing');
      return next(new Error('Password is required'));
    }

    try {
      const salt = await bcrypt.genSalt(10);
      logger.debug('Generated salt for password hashing:', { 
        salt: salt.substring(0, 10) + '...',
        email: this.email,
        saltLength: salt.length
      });
      
      const hashedPassword = await bcrypt.hash(this.password, salt);
      logger.debug('Password hashed successfully:', {
        email: this.email,
        originalLength: this.password?.length,
        hashedLength: hashedPassword?.length,
        hashedStart: hashedPassword.substring(0, 10) + '...',
        bcryptFormat: hashedPassword.startsWith('$2a$') ? 'valid' : 'invalid',
        bcryptRounds: bcrypt.getRounds(hashedPassword)
      });
      
      this.password = hashedPassword;
      next();
    } catch (hashError) {
      logger.error('Error in password hashing:', {
        error: hashError.message,
        email: this.email,
        stack: hashError.stack,
        passwordLength: this.password?.length,
        passwordType: typeof this.password
      });
      next(hashError);
    }
  } catch (error) {
    logger.error('Unexpected error in pre-save hook:', {
      error: error.message,
      email: this.email,
      stack: error.stack
    });
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!candidatePassword) {
      logger.warn('Empty candidate password provided for comparison', {
        userId: this._id,
        email: this.email
      });
      return false;
    }

    if (!this.password) {
      logger.warn('No stored password hash found for user', {
        userId: this._id,
        email: this.email
      });
      return false;
    }

    // Log raw password details (first few chars only for security)
    logger.debug('Raw password comparison details:', {
      userId: this._id,
      email: this.email,
      candidatePasswordType: typeof candidatePassword,
      candidatePasswordStart: candidatePassword?.substring(0, 3) + '...',
      candidatePasswordLength: candidatePassword?.length,
      storedHashType: typeof this.password,
      storedHashStart: this.password?.substring(0, 10) + '...',
      storedHashLength: this.password?.length,
      storedHashFormat: this.password?.includes('$2a$') ? 'valid bcrypt' : 'invalid format',
      bcryptRounds: this.password?.startsWith('$2a$') ? bcrypt.getRounds(this.password) : 'invalid'
    });

    // Verify the stored hash is in bcrypt format
    if (!this.password.startsWith('$2a$')) {
      logger.error('Stored password hash is not in bcrypt format', {
        userId: this._id,
        email: this.email,
        storedHashStart: this.password?.substring(0, 10) + '...'
      });
      return false;
    }

    // Try to parse the stored hash
    try {
      const rounds = bcrypt.getRounds(this.password);
      logger.debug('Bcrypt hash details:', {
        email: this.email,
        rounds,
        hashVersion: this.password.substring(0, 4)
      });
    } catch (parseError) {
      logger.error('Error parsing bcrypt hash:', {
        error: parseError.message,
        email: this.email,
        storedHashStart: this.password?.substring(0, 10) + '...'
      });
    }

    // Perform the actual comparison
    logger.debug('Attempting bcrypt.compare...', {
      email: this.email,
      candidatePasswordLength: candidatePassword?.length,
      storedHashLength: this.password?.length
    });
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    
    logger.debug('Password comparison complete:', {
      userId: this._id,
      email: this.email,
      result,
      storedHashStart: this.password?.substring(0, 10) + '...',
      candidateLength: candidatePassword?.length,
      bcryptVersion: bcrypt.getRounds(this.password)
    });
    
    return result;
  } catch (error) {
    logger.error('Error comparing passwords:', {
      error: error.message,
      userId: this._id,
      email: this.email,
      stack: error.stack,
      storedHashStart: this.password?.substring(0, 10) + '...',
      candidateLength: candidatePassword?.length
    });
    throw new Error('Error comparing passwords');
  }
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return token;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 3600000; // 24 hours
  return token;
};

// Generate remember me token
userSchema.methods.generateRememberMeToken = function(userAgent) {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
  this.rememberMeTokens.push({
    token: hashedToken,
    expires: new Date(Date.now() + 30 * 24 * 3600000), // 30 days
    userAgent,
    lastUsed: new Date()
  });
  
  return token;
};

const User = mongoose.model('User', userSchema);

// Log model creation
logger.info('User model created:', {
  modelName: User.modelName,
  collection: User.collection.name,
  database: User.db.name
});

module.exports = User;