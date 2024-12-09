const mongoose = require('mongoose');
const { Tank } = require('../models/init');
require('dotenv').config();

const seedTanks = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, { family: 4 });
    console.log('Connected to database');

    // Clear existing tanks
    await Tank.deleteMany({});

    // Create sample tanks
    const tanks = [
      { name: 'Tank 1', temperature: 68, status: 'Active', mode: 'Cooling', valveStatus: 'Open' },
      { name: 'Tank 2', temperature: 72, status: 'Active', mode: 'Heating', valveStatus: 'Closed' },
      // Add more tanks as needed
    ];

    await Tank.insertMany(tanks);
    console.log('Tanks seeded successfully');
  } catch (error) {
    console.error('Error seeding tanks:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedTanks();