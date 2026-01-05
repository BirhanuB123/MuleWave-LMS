const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  items: [{
    type: {
      type: String,
      enum: ['lecture', 'assignment', 'quiz', 'discussion', 'announcement', 'file', 'link'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId
    },
    content: {
      type: String,
      default: ''
    },
    url: {
      type: String
    },
    order: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    prerequisite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    },
    points: {
      type: Number,
      default: 0
    },
    dueDate: {
      type: Date
    }
  }],
  unlockDate: {
    type: Date
  },
  lockDate: {
    type: Date
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  prerequisite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  requireSequentialProgress: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
moduleSchema.index({ course: 1, order: 1 });
moduleSchema.index({ course: 1, isPublished: 1 });

module.exports = mongoose.model('Module', moduleSchema);
