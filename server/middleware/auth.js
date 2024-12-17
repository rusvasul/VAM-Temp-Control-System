const jwt = require('jsonwebtoken');
const config = require('../config');
const debug = require('debug')('app:middleware:auth');

const generateAccessToken = (user) => {
  return jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiration });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenExpiration });
};

const authenticateWithToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  debug('Auth header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    debug('No Bearer token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  debug('Token extracted:', token ? 'present' : 'missing');

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    debug('Token verified successfully');
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      debug('Token expired, attempting to refresh');
      const refreshToken = req.header('x-refresh-token');
      
      if (!refreshToken) {
        debug('No refresh token provided');
        return res.status(401).json({ message: 'Token expired and no refresh token provided' });
      }

      try {
        const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);
        const newAccessToken = generateAccessToken({ userId: decoded.userId, isAdmin: decoded.isAdmin });
        
        // Send the new access token in the response
        res.setHeader('x-new-token', newAccessToken);
        req.user = decoded;
        debug('Token refreshed successfully');
        next();
      } catch (refreshErr) {
        debug('Refresh token verification failed:', refreshErr);
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
    } else {
      debug('Token verification failed:', err);
      res.status(401).json({ message: 'Token is not valid' });
    }
  }
};

const requireUser = (req, res, next) => {
  if (!req.user) {
    debug('No user in request');
    return res.status(401).json({ message: 'User not authenticated' });
  }
  debug('User authenticated');
  next();
};

module.exports = {
  authenticateWithToken,
  requireUser,
  generateAccessToken,
  generateRefreshToken
}; 