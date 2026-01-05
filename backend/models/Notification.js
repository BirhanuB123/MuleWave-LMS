const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  type: {
    type: String,
    enum: [
      'enrollment',
      'assignment_posted',
      'assignment_graded',
      'quiz_available',
      'quiz_graded',
      'announcement',
      'discussion_reply',
      'message',
      'course_update',
      'payment_success',
      'certificate_earned',
      'reminder',
      'other'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ''
  },
  linkedItem: {
    itemType: {
      type: String,
      enum: ['course', 'assignment', 'quiz', 'discussion', 'announcement', null],
      default: null
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  icon: {
    type: String,
    default: 'bell'
  },
  color: {
    type: String,
    default: '#6366f1'
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: 1 }); // For cleanup of old notifications

module.exports = mongoose.model('Notification', notificationSchema);
