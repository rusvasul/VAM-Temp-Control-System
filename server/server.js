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

// Models
require('./models/TemperatureHistory');
require('./models/Alarm');

// Routes
const basicRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const tankRoutes = require('./routes/tanks');
const systemStatusRoutes = require('./routes/systemStatus');
const alarmRoutes = require('./routes/alarms');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Make SSE instance available globally
app.set('sse', sse);
global.app = app;

// Enable CORS with specific configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
    app.get('/api/sse', sse.init);
    app.get('/api/events', sse.init);
    debug('SSE endpoints initialized');

    // Routes
    app.use('/api', basicRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/tanks', tankRoutes);
    app.use('/api/system-status', systemStatusRoutes);
    app.use('/api/alarms', alarmRoutes);
    debug('Routes mounted');

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err.stack); // Log full error stack trace
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
    app.set('alarmMonitor', alarmMonitor);  // Make it available to routes
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