const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  activityType: {
    type: String,
    enum: [
      'course_view',
      'lecture_view',
      'assignment_view',
      'assignment_submit',
      'quiz_start',
      'quiz_complete',
      'discussion_view',
      'discussion_post',
      'resource_download',
      'video_watch',
      'login',
      'page_view'
    ],
    required: true
  },
  metadata: {
    duration: Number, // Time spent in seconds
    score: Number,
    itemId: mongoose.Schema.Types.ObjectId,
    itemType: String,
    progress: Number, // Percentage
    device: String,
    browser: String,
    ipAddress: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
analyticsSchema.index({ student: 1, timestamp: -1 });
analyticsSchema.index({ course: 1, activityType: 1 });
analyticsSchema.index({ student: 1, course: 1, activityType: 1 });
analyticsSchema.index({ timestamp: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
