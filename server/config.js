require('dotenv').config();
const crypto = require('crypto');

// Generate a secure random secret if not provided in environment
const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

const config = {
  port: process.env.PORT || 3001,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vam_tank_control'
  },
  jwt: {
    secret: process.env.JWT_SECRET || generateSecret(),
    expiration: process.env.JWT_EXPIRATION || '24h'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || '"VAM Tank Control" <no-reply@vamtankcontrol.com>'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV === 'development'
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

module.exports = config; 