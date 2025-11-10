const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  // index of the correct option in `options` array
  correctIndex: { type: Number, required: true },
  points: { type: Number, default: 1 }
});

const quizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String },
  questions: [questionSchema],
  durationMinutes: { type: Number, default: 0 }, // optional time limit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
