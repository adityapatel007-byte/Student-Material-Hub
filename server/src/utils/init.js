const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const User = require('../models/User');

const defaultSubjects = [
  { name: 'Mathematics', description: 'Math-related materials and resources' },
  { name: 'Computer Science', description: 'Programming, algorithms, and CS concepts' },
  { name: 'Physics', description: 'Physics concepts and lab materials' },
  { name: 'Chemistry', description: 'Chemistry notes and experiments' },
  { name: 'English', description: 'Literature, grammar, and writing resources' },
  { name: 'History', description: 'Historical documents and study materials' },
  { name: 'Biology', description: 'Biology concepts and research materials' },
];

async function initializeDatabase() {
  try {
    // Check if subjects already exist
    const existingSubjects = await Subject.countDocuments();
    if (existingSubjects > 0) {
      console.log('Subjects already initialized');
      return;
    }

    // Find any admin user to assign as creator, or create a system user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found, skipping subject initialization');
      return;
    }

    // Create default subjects
    for (const subjectData of defaultSubjects) {
      await Subject.create({
        ...subjectData,
        createdBy: adminUser._id
      });
    }

    console.log('Default subjects initialized successfully');
  } catch (error) {
    console.error('Error initializing subjects:', error.message);
  }
}

module.exports = { initializeDatabase };