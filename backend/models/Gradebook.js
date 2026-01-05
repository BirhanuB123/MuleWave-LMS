const mongoose = require('mongoose');

const gradebookSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  grades: [{
    item: {
      type: String, // 'quiz', 'assignment'
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    itemTitle: String,
    points: {
      type: Number,
      default: 0
    },
    maxPoints: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      default: 0
    },
    gradedAt: Date,
    weight: {
      type: Number,
      default: 1
    }
  }],
  overallGrade: {
    totalPoints: {
      type: Number,
      default: 0
    },
    totalMaxPoints: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    letterGrade: {
      type: String,
      default: 'N/A'
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Unique constraint: one gradebook per student per course
gradebookSchema.index({ course: 1, student: 1 }, { unique: true });

// Method to calculate overall grade
gradebookSchema.methods.calculateOverallGrade = function() {
  if (this.grades.length === 0) {
    this.overallGrade = {
      totalPoints: 0,
      totalMaxPoints: 0,
      percentage: 0,
      letterGrade: 'N/A'
    };
    return;
  }

  let totalPoints = 0;
  let totalMaxPoints = 0;

  this.grades.forEach(grade => {
    totalPoints += grade.points * grade.weight;
    totalMaxPoints += grade.maxPoints * grade.weight;
  });

  const percentage = totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0;
  
  // Calculate letter grade
  let letterGrade = 'F';
  if (percentage >= 93) letterGrade = 'A';
  else if (percentage >= 90) letterGrade = 'A-';
  else if (percentage >= 87) letterGrade = 'B+';
  else if (percentage >= 83) letterGrade = 'B';
  else if (percentage >= 80) letterGrade = 'B-';
  else if (percentage >= 77) letterGrade = 'C+';
  else if (percentage >= 73) letterGrade = 'C';
  else if (percentage >= 70) letterGrade = 'C-';
  else if (percentage >= 67) letterGrade = 'D+';
  else if (percentage >= 63) letterGrade = 'D';
  else if (percentage >= 60) letterGrade = 'D-';

  this.overallGrade = {
    totalPoints,
    totalMaxPoints,
    percentage: Math.round(percentage * 100) / 100,
    letterGrade
  };

  this.lastUpdated = Date.now();
};

module.exports = mongoose.model('Gradebook', gradebookSchema);
