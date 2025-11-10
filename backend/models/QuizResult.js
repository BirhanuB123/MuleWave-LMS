const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedIndex: { type: Number, required: true }
});

const quizResultSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  passed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);
