const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    default: ''
  },
  term: {
    type: String,
    default: ''
  },
  creditHours: {
    type: Number,
    default: 0
  },
  courseDescription: {
    type: String,
    required: true
  },
  learningObjectives: [{
    type: String
  }],
  requiredMaterials: [{
    title: String,
    author: String,
    isbn: String,
    type: {
      type: String,
      enum: ['textbook', 'software', 'other']
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  gradingPolicy: {
    scale: [{
      grade: String,
      minPercentage: Number,
      maxPercentage: Number
    }],
    components: [{
      name: String,
      weight: Number, // Percentage
      description: String
    }]
  },
  courseSchedule: [{
    week: Number,
    startDate: Date,
    endDate: Date,
    topics: [String],
    readings: [String],
    assignments: [String]
  }],
  policies: {
    attendance: {
      type: String,
      default: ''
    },
    lateWork: {
      type: String,
      default: ''
    },
    makeupWork: {
      type: String,
      default: ''
    },
    academicIntegrity: {
      type: String,
      default: ''
    },
    disabilities: {
      type: String,
      default: ''
    },
    communication: {
      type: String,
      default: ''
    }
  },
  officeHours: [{
    day: String,
    startTime: String,
    endTime: String,
    location: String,
    mode: {
      type: String,
      enum: ['in-person', 'online', 'hybrid']
    }
  }],
  contactInfo: {
    email: String,
    phone: String,
    officeLocation: String
  },
  importantDates: [{
    date: Date,
    description: String,
    type: {
      type: String,
      enum: ['exam', 'holiday', 'deadline', 'other']
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index
syllabusSchema.index({ course: 1 });

module.exports = mongoose.model('Syllabus', syllabusSchema);
