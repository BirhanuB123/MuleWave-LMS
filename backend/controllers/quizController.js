const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('express-async-handler');

// Create a quiz (Instructor only)
exports.createQuiz = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { title, description, questions, durationMinutes } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Only course instructor may create
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the instructor can create quizzes for this course');
  }

  const quiz = await Quiz.create({
    courseId,
    title,
    description,
    questions,
    durationMinutes,
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, data: quiz });
});

// List quizzes for a course
exports.listCourseQuizzes = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const quizzes = await Quiz.find({ courseId }).select('-questions.correctIndex').lean();
  res.json({ success: true, data: quizzes });
});

// Get single quiz (hide correct answers)
exports.getQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Hide correctIndex when sending to students
  const publicQuiz = JSON.parse(JSON.stringify(quiz));
  if (publicQuiz.questions && publicQuiz.questions.length) {
    publicQuiz.questions = publicQuiz.questions.map(q => ({
      _id: q._id,
      text: q.text,
      options: q.options,
      points: q.points
    }));
  }

  res.json({ success: true, data: publicQuiz });
});

// Submit quiz answers
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body; // [{ questionId, selectedIndex }]

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Check enrollment
  const enrollment = await Enrollment.findOne({ course: quiz.courseId, user: req.user._id, status: 'active' });
  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled to submit this quiz');
  }

  // Evaluate
  let score = 0;
  let maxScore = 0;
  const qMap = {};
  quiz.questions.forEach(q => {
    qMap[q._id.toString()] = q;
    maxScore += (q.points || 1);
  });

  const normalizedAnswers = answers || [];
  normalizedAnswers.forEach(ans => {
    const q = qMap[ans.questionId];
    if (!q) return;
    if (ans.selectedIndex === q.correctIndex) {
      score += (q.points || 1);
    }
  });

  const passed = score / maxScore >= 0.5; // default passing criteria 50%

  const result = await QuizResult.create({
    quiz: quiz._id,
    course: quiz.courseId,
    user: req.user._id,
    answers: normalizedAnswers.map(a => ({ questionId: a.questionId, selectedIndex: a.selectedIndex })),
    score,
    maxScore,
    passed
  });

  res.json({ success: true, data: { resultId: result._id, score, maxScore, passed } });
});

// Get user's result for a quiz
exports.getQuizResult = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const result = await QuizResult.findOne({ quiz: quizId, user: req.user._id }).lean();
  if (!result) {
    res.status(404);
    throw new Error('Result not found');
  }
  res.json({ success: true, data: result });
});
