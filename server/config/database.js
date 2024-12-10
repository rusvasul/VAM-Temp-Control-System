const mongoose = require('mongoose');
const debug = require('debug')('app:database');

const connectDB = async (retries = 5) => {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    debug(`Attempting to connect to database: ${DATABASE_URL}`);
    await mongoose.connect(DATABASE_URL, {
      family: 4,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 2000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      maxPoolSize: 10
    });
    debug('Database connected successfully');

    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      debug(`MongoDB connection error: ${err}`);
      if (err.name === 'MongoNetworkError') {
        debug('Attempting to reconnect to MongoDB...');
        mongoose.connect(DATABASE_URL).catch(err => {
          debug(`Failed to reconnect: ${err}`);
        });
      }
    });

    mongoose.connection.on('disconnected', () => {
      debug('MongoDB disconnected. Attempting to reconnect...');
      mongoose.connect(DATABASE_URL).catch(err => {
        debug(`Failed to reconnect after disconnect: ${err}`);
      });
    });

  } catch (err) {
    if (retries > 0) {
      debug(`Database connection failed. Retrying... (${retries} attempts left)`);
      debug(`Connection error: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }
    throw err;
  }
};

module.exports = connectDB; 