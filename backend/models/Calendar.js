const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  eventType: {
    type: String,
    enum: ['assignment', 'quiz', 'announcement', 'class', 'personal', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    default: ''
  },
  linkedItem: {
    itemType: {
      type: String,
      enum: ['assignment', 'quiz', 'announcement', 'discussion', null],
      default: null
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    minutesBefore: {
      type: Number,
      default: 60 // 1 hour before
    }
  },
  color: {
    type: String,
    default: '#6366f1' // Default indigo color
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrence: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', null],
      default: null
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: {
      type: Date
    }
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
calendarEventSchema.index({ user: 1, startDate: 1 });
calendarEventSchema.index({ course: 1, startDate: 1 });
calendarEventSchema.index({ user: 1, eventType: 1 });
calendarEventSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
