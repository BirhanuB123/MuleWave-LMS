const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
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
  content: {
    type: String,
    required: [true, 'Submission content is required']
  },
  attachments: [{
    filename: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isLate: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned'],
    default: 'submitted'
  },
  grade: {
    points: {
      type: Number,
      min: 0,
      default: null
    },
    feedback: {
      type: String,
      default: ''
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: {
      type: Date
    }
  },
  resubmission: {
    isResubmission: {
      type: Boolean,
      default: false
    },
    previousSubmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    },
    resubmissionCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Unique constraint: one active submission per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
