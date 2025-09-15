const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxLength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  university: {
    type: String,
    required: [true, 'Please provide university name'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Please provide course name'],
    trim: true
  },
  semester: {
    type: Number,
    required: [true, 'Please provide semester'],
    min: 1,
    max: 12
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  avatar: {
    public_id: String,
    url: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  materialsShared: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Material'
  }],
  bookmarks: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Material'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
