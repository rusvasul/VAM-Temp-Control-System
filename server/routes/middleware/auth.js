const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const debug = require('debug')('app:auth');

const authenticateWithToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      debug('No authorization header found');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      debug('Invalid authorization format');
      return res.status(401).json({ error: 'Invalid authorization format' });
    }

    try {
      const decoded = jwt.verify(token, process.env.SESSION_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        debug('User not found for token');
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      debug('User authenticated:', user.email);
      next();
    } catch (jwtError) {
      debug('JWT verification failed:', jwtError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    debug('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const requireUser = (req, res, next) => {
  if (!req.user) {
    debug('User authentication required');
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    debug('Admin privileges required');
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = {
  authenticateWithToken,
  requireUser,
  requireAdmin,
};