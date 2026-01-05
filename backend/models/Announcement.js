const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  sendEmail: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    fileUrl: String,
    fileType: String
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
announcementSchema.index({ course: 1, createdAt: -1 });
announcementSchema.index({ course: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
