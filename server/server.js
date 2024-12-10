// Load environment variables first
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const debug = require('debug')('app:server');
const connectDB = require('./config/database');

// Routes
const basicRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const tankRoutes = require('./routes/tanks');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

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

    // Routes
    app.use('/api', basicRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/tanks', tankRoutes);
    debug('Routes mounted');

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Start server
    app.listen(port, () => {
      debug(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

initializeServer();