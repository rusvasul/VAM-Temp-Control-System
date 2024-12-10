const mongoose = require('mongoose');
const Tank = require('../models/Tank');
require('dotenv').config();

const seedTanks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    await Tank.deleteMany({});
    console.log('Cleared existing tanks');

    const tanks = [
      { id: 1, name: 'Tank 1', temperature: 68, status: 'Active', mode: 'Cooling', valveStatus: 'Open' },
      { id: 2, name: 'Tank 2', temperature: 70, status: 'Active', mode: 'Heating', valveStatus: 'Closed' },
      // Add more tanks as needed
    ];

    await Tank.insertMany(tanks);
    console.log('Tanks seeded successfully');
  } catch (error) {
    console.error('Error seeding tanks:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedTanks();