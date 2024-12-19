// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');
const logger = require('./utils/log');
const { authenticateToken, requireUser } = require('./middleware/auth');

// Initialize express app
const app = express();

// Enable CORS with specific configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB with retry logic
const connectWithRetry = async (retries = 5, interval = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      logger.info(`Connecting to MongoDB (attempt ${i + 1}/${retries}):`, {
        uri: config.mongodb.uri,
        dbName: mongoose.connection.name || 'Not connected',
        host: mongoose.connection.host || 'Not connected',
        collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections) : []
      });
      
      await mongoose.connect(config.mongodb.uri);
      
      // Log connection details after successful connection
      logger.info('Database connected successfully', {
        dbName: mongoose.connection.name,
        host: mongoose.connection.host,
        collections: Object.keys(mongoose.connection.collections),
        models: Object.keys(mongoose.models)
      });
      
      // Initialize email service after database connection
      const { verifyEmailConfig } = require('./services/email');
      await verifyEmailConfig();
      
      return true;
    } catch (err) {
      logger.error('Database connection error:', {
        attempt: i + 1,
        error: err.message,
        code: err.code,
        name: err.name,
        uri: config.mongodb.uri
      });
      
      if (i < retries - 1) {
        logger.info(`Retrying in ${interval/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }
  return false;
};

// SSE setup with authentication
const sseClients = new Set();

app.get('/api/sse', authenticateToken, (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    response: res
  };
  sseClients.add(newClient);

  req.on('close', () => {
    logger.info(`Client ${clientId} connection closed`);
    sseClients.delete(newClient);
  });

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);
});

// Broadcast function for SSE
const broadcast = (data) => {
  sseClients.forEach(client => {
    client.response.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

// Public routes
app.use('/api/auth', require('./routes/auth'));

// Protected routes
app.use('/api/settings', authenticateToken, require('./routes/settings'));
app.use('/api/tanks', authenticateToken, require('./routes/tanks'));
app.use('/api/brew-styles', authenticateToken, require('./routes/brewStyleRoutes'));
app.use('/api/cleaning-schedules', authenticateToken, require('./routes/cleaningSchedules'));
app.use('/api/production-schedules', authenticateToken, require('./routes/productionSchedules'));
app.use('/api/system-status', authenticateToken, require('./routes/systemStatus'));
app.use('/api/users', authenticateToken, require('./routes/users'));
app.use('/api/alarms', authenticateToken, require('./routes/alarms'));

// Add static file serving for recipe documents
app.use('/uploads/recipes', express.static(path.join(__dirname, 'uploads/recipes')));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    name: err.name,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found:', {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server with database connection
const startServer = async () => {
  try {
    const connected = await connectWithRetry();
    if (!connected) {
      logger.error('Failed to connect to database after multiple retries');
      process.exit(1);
    }

    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();