require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/vam-tank-control',
  jwtSecret: process.env.JWT_SECRET || 'your-default-jwt-secret-key',
  jwtExpiration: '7d',
  refreshTokenExpiration: '30d',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-key'
}; 