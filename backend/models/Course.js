const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Please add a short description'],
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Technology', 'Business', 'Design', 'Marketing', 'Health', 'Language', 'Science', 'Arts', 'Other']
  },
  level: {
    type: String,
    required: [true, 'Please add a level'],
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: ''
  },
  lectures: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    videoUrl: String,
    duration: String,
    resources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['pdf', 'doc', 'video', 'link', 'other']
      }
    }],
    order: Number
  }],
  requirements: [String],
  learningOutcomes: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'English'
  }
}, {
  timestamps: true
});

// Create index for search
courseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);

