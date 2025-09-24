const mongoose = require('mongoose');
require('dotenv').config();

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smhub';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

module.exports = { connectToDatabase };


