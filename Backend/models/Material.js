const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide material title'],
    trim: true,
    maxLength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide material description'],
    trim: true,
    maxLength: [500, 'Description cannot be more than 500 characters']
  },
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: [true, 'Please specify the subject']
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  materialType: {
    type: String,
    required: [true, 'Please specify material type'],
    enum: ['notes', 'assignment', 'question-paper', 'presentation', 'book', 'other']
  },
  file: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  likes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  downloads: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  reports: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      required: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for likes count
materialSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for downloads count
materialSchema.virtual('downloadsCount').get(function() {
  return this.downloads.length;
});

// Create indexes for better performance
materialSchema.index({ subject: 1 });
materialSchema.index({ uploadedBy: 1 });
materialSchema.index({ materialType: 1 });
materialSchema.index({ tags: 1 });
materialSchema.index({ createdAt: -1 });
materialSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware to increment materialsCount in Subject
materialSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Subject = mongoose.model('Subject');
    await Subject.findByIdAndUpdate(this.subject, { $inc: { materialsCount: 1 } });
  }
  next();
});

// Pre-remove middleware to decrement materialsCount in Subject
materialSchema.pre('remove', async function(next) {
  const Subject = mongoose.model('Subject');
  await Subject.findByIdAndUpdate(this.subject, { $inc: { materialsCount: -1 } });
  next();
});

module.exports = mongoose.model('Material', materialSchema);
