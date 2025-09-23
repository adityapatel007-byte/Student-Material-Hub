const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    minLength: [8, 'Password must be at least 8 characters'],
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
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'pending'
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  materialsShared: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Material'
  }],
  bookmarks: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Material'
  }],
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    materialUpdates: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ university: 1, course: 1, semester: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  
  return resetToken;
};

// Handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1
      },
      $set: {
        loginAttempts: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    },
    $set: {
      lastLogin: Date.now()
    }
  });
};

// Verify email
userSchema.methods.verifyEmail = function() {
  this.isVerified = true;
  this.accountStatus = 'active';
  this.emailVerificationToken = undefined;
  this.emailVerificationExpire = undefined;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
