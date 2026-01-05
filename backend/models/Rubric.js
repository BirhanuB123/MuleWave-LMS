const mongoose = require('mongoose');

const rubricSchema = new mongoose.Schema({
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
    required: [true, 'Rubric title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  criteria: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    points: {
      type: Number,
      required: true,
      min: 0
    },
    levels: [{
      name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        default: ''
      },
      points: {
        type: Number,
        required: true,
        min: 0
      }
    }]
  }],
  totalPoints: {
    type: Number,
    required: true,
    default: 0
  },
  linkedAssignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],
  isTemplate: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate total points before saving
rubricSchema.pre('save', function(next) {
  let total = 0;
  this.criteria.forEach(criterion => {
    total += criterion.points;
  });
  this.totalPoints = total;
  next();
});

// Index
rubricSchema.index({ course: 1, instructor: 1 });
rubricSchema.index({ isTemplate: 1 });

module.exports = mongoose.model('Rubric', rubricSchema);
