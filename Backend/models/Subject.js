const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide subject name'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Please provide subject code'],
    trim: true,
    uppercase: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot be more than 500 characters']
  },
  department: {
    type: String,
    required: [true, 'Please provide department'],
    trim: true
  },
  semester: {
    type: Number,
    required: [true, 'Please provide semester'],
    min: 1,
    max: 12
  },
  credits: {
    type: Number,
    min: 1,
    max: 10
  },
  materialsCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index for faster searches
subjectSchema.index({ name: 'text', code: 'text', department: 'text' });
subjectSchema.index({ department: 1, semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
