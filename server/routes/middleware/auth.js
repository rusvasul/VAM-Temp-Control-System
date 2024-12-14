const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const authenticateWithToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next();
  }
};

const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = {
  authenticateWithToken,
  requireUser,
  requireAdmin,
};