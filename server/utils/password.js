const bcrypt = require('bcryptjs');
const logger = require('./log');

/**
 * Generate a password hash using bcryptjs
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 */
const generatePasswordHash = async (password) => {
  try {
    logger.debug('Generating password hash:', {
      passwordLength: password?.length,
      passwordType: typeof password,
      passwordStart: password?.substring(0, 3) + '...'
    });

    if (!password) {
      logger.error('No password provided for hashing');
      throw new Error('Password is required');
    }

    const salt = await bcrypt.genSalt(10);
    logger.debug('Generated salt:', {
      saltLength: salt.length,
      saltStart: salt.substring(0, 10) + '...'
    });

    const hash = await bcrypt.hash(password, salt);
    logger.debug('Password hash generated:', {
      hashLength: hash.length,
      hashStart: hash.substring(0, 10) + '...',
      bcryptFormat: hash.startsWith('$2a$') ? 'valid' : 'invalid',
      bcryptRounds: bcrypt.getRounds(hash)
    });

    return hash;
  } catch (error) {
    logger.error('Error generating password hash:', {
      error: error.message,
      stack: error.stack,
      passwordLength: password?.length,
      passwordType: typeof password
    });
    throw error;
  }
};

/**
 * Validate a password against a hash
 * @param {string} password - The plain text password to validate
 * @param {string} hash - The hashed password to compare against
 * @returns {Promise<boolean>} Whether the password matches the hash
 */
const validatePassword = async (password, hash) => {
  try {
    logger.debug('Validating password:', {
      passwordLength: password?.length,
      passwordType: typeof password,
      hashLength: hash?.length,
      hashStart: hash?.substring(0, 10) + '...',
      bcryptFormat: hash?.startsWith('$2a$') ? 'valid' : 'invalid'
    });

    if (!password || !hash) {
      logger.warn('Missing password or hash for validation:', {
        hasPassword: !!password,
        hasHash: !!hash
      });
      return false;
    }

    const result = await bcrypt.compare(password, hash);
    logger.debug('Password validation result:', {
      result,
      hashStart: hash?.substring(0, 10) + '...',
      bcryptRounds: hash?.startsWith('$2a$') ? bcrypt.getRounds(hash) : 'invalid'
    });

    return result;
  } catch (error) {
    logger.error('Error validating password:', {
      error: error.message,
      stack: error.stack,
      passwordLength: password?.length,
      hashLength: hash?.length
    });
    throw error;
  }
};

module.exports = {
  generatePasswordHash,
  validatePassword
};
