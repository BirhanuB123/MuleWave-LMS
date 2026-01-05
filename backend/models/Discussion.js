const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Discussion title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Discussion content is required']
  },
  category: {
    type: String,
    enum: ['general', 'question', 'announcement', 'resource', 'other'],
    default: 'general'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isInstructorReply: {
      type: Boolean,
      default: false
    },
    isAccepted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
discussionSchema.index({ course: 1, createdAt: -1 });
discussionSchema.index({ course: 1, isPinned: -1, createdAt: -1 });
discussionSchema.index({ author: 1 });

module.exports = mongoose.model('Discussion', discussionSchema);
