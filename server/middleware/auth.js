const jwt = require('jsonwebtoken');
const config = require('../config');
const UserService = require('../services/user');
const logger = require('../utils/log');

const generateAccessToken = (user) => {
  return jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiration });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenExpiration });
};

const authenticateToken = async (req, res, next) => {
  try {
    logger.debug('Auth middleware: Checking for token');
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn('Auth middleware: No authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      logger.warn('Auth middleware: Invalid token format');
      return res.status(401).json({ error: 'Invalid token format' });
    }

    logger.debug('Auth middleware: Verifying token');
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await UserService.get(decoded.userId);

    if (!user || user.status !== 'active') {
      logger.warn('Auth middleware: User not found or inactive');
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      status: user.status
    };
    
    logger.debug(`Auth middleware: User authenticated: ${user.email}`);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Auth middleware: Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      logger.warn('Auth middleware: Token expired');
      return res.status(401).json({ error: 'Token expired' });
    }
    logger.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    logger.warn('Admin access denied');
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateAccessToken,
  generateRefreshToken
}; 