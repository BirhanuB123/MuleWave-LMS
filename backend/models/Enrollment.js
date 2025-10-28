const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLectures: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only enroll once in a course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

