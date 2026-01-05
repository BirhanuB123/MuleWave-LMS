const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
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
    required: [true, 'Assignment title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required']
  },
  instructions: {
    type: String,
    default: ''
  },
  maxPoints: {
    type: Number,
    required: true,
    default: 100,
    min: 0
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  lateSubmissionDeadline: {
    type: Date
  },
  attachments: [{
    filename: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
assignmentSchema.index({ course: 1, createdAt: -1 });
assignmentSchema.index({ instructor: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
