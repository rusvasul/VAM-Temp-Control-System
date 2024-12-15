// Load environment variables first
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const debug = require('debug')('app:server');
const connectDB = require('./config/database');
const SSE = require('express-sse');
const sse = new SSE();
const AlarmMonitor = require('./services/alarmMonitor');
const { authenticateWithToken, requireUser, requireAdmin } = require('./routes/middleware/auth');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken');

// Models
require('./models/TemperatureHistory');
require('./models/Alarm');
require('./models/Settings');
require('./models/CleaningSchedule');
const SystemStatus = require('./models/SystemStatus');

// Routes
const basicRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const tankRoutes = require('./routes/tanks');
const systemStatusRoutes = require('./routes/systemStatus');
const alarmRoutes = require('./routes/alarms');
const settingsRoutes = require('./routes/settings');
const brewStyleRoutes = require('./routes/brewStyles');
const cleaningScheduleRoutes = require('./routes/cleaningSchedules');
const productionScheduleRoutes = require('./routes/productionSchedules');

// Initialize express app
const app = express();
const port = process.env.PORT || 3001;

// Make SSE instance available globally
app.set('sse', sse);
global.app = app;

// Enable CORS with specific configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection
const initializeServer = async () => {
  try {
    await connectDB();
    debug('Database connection established');

    // Session configuration
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: process.env.DATABASE_URL,
          ttl: 24 * 60 * 60
        }),
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000
        }
      })
    );

    // SSE endpoints
    app.get('/api/sse', async (req, res) => {
      debug('SSE connection request received');
      
      // Get token from Authorization header or query parameter
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.split(' ')[1] : req.query.token;

      if (!token) {
        debug('No token provided for SSE connection');
        return res.status(401).json({ error: 'Authentication required' });
      }

      try {
        const decoded = jwt.verify(token, process.env.SESSION_SECRET);
        debug('Token verified successfully:', decoded);

        // Verify user exists
        const user = await mongoose.model('User').findById(decoded.userId);
        if (!user) {
          debug('User not found for token');
          return res.status(401).json({ error: 'User not found' });
        }

        // Set up SSE connection with CORS headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': req.headers.origin || '*',
          'Access-Control-Allow-Credentials': 'true'
        });

        // Send initial heartbeat
        res.write('event: connected\ndata: connected\n\n');

        const sendSystemStatus = async () => {
          try {
            const systemStatus = await SystemStatus.findOne();
            if (systemStatus) {
              const data = JSON.stringify(systemStatus);
              debug('Sending system status update:', data);
              res.write(`data: ${data}\n\n`);
            }
          } catch (error) {
            debug('Error sending system status:', error);
            // Don't end the connection on error, just log it
          }
        };

        // Send initial status
        await sendSystemStatus();

        // Send updates every 5 seconds
        const intervalId = setInterval(sendSystemStatus, 5000);

        // Clean up on client disconnect
        req.on('close', () => {
          debug('SSE connection closed');
          clearInterval(intervalId);
        });

      } catch (error) {
        debug('Token verification failed:', error);
        return res.status(401).json({ error: 'Invalid token' });
      }
    });

    debug('SSE endpoints initialized');

    // Public routes
    app.use('/', basicRoutes);
    app.use('/api/auth', authRoutes);

    // Apply authentication middleware for protected routes
    app.use('/api', (req, res, next) => {
      // Skip authentication for production schedules
      if (req.path.startsWith('/production-schedules')) {
        return next();
      }
      authenticateWithToken(req, res, next);
    });

    // Protected routes requiring authentication
    debug('Mounting protected routes');
    app.use('/api/tanks', requireUser, tankRoutes);
    app.use('/api/system-status', requireUser, systemStatusRoutes);
    app.use('/api/alarms', requireUser, alarmRoutes);
    app.use('/api/settings', requireUser, settingsRoutes);
    app.use('/api/brew-styles', requireUser, brewStyleRoutes);
    app.use('/api/cleaning-schedules', cleaningScheduleRoutes);
    app.use('/api/production-schedules', productionScheduleRoutes);
    debug('Protected routes mounted');
    debug('Brew styles routes registered');
    debug('Cleaning schedules routes mounted');

    // Log all registered routes with authentication info
    debug('Registered routes:');
    app._router.stack.forEach(middleware => {
      if (middleware.route) {
        debug(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
        debug('Auth required: Yes');
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach(handler => {
          if (handler.route) {
            debug(`${Object.keys(handler.route.methods)} ${handler.route.path}`);
            debug('Auth required: Yes');
          }
        });
      }
    });

    // Log authentication middleware setup
    debug('Authentication middleware configured');
    debug('Request authentication flow: authenticateWithToken -> requireUser -> route handler');

    // Admin-only routes
    app.use('/api/admin', requireUser, requireAdmin);

    debug('Routes mounted with role-based access control');

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err.stack);
      debug('Error occurred:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });

    // 404 handler
    app.use((req, res) => {
      debug('Route not found:', req.originalUrl);
      debug('Available routes:', app._router.stack.filter(r => r.route).map(r => r.route.path));
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
      });
    });

    // Start server
    const server = app.listen(port, () => {
      debug(`Server running at http://localhost:${port}`);
      console.log(`Server is listening on port ${port}`);
    });

    // Start the alarm monitor
    const alarmMonitor = new AlarmMonitor();
    app.set('alarmMonitor', alarmMonitor);
    alarmMonitor.start();
    debug('Alarm monitor started');

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
      debug('SIGTERM received. Shutting down gracefully...');
      alarmMonitor.stop();
      server.close(() => {
        debug('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      debug('SIGINT received. Shutting down gracefully...');
      alarmMonitor.stop();
      server.close(() => {
        debug('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to initialize server:', error.stack);
    debug('Server initialization failed:', error);
    process.exit(1);
  }
};

initializeServer();