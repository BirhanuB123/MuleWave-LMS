const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createQuiz,
  listCourseQuizzes,
  getQuiz,
  submitQuiz,
  getQuizResult,
  updateQuiz,
  deleteQuiz,
  getDetailedQuizResults
} = require('../controllers/quizController');

// Create a quiz for a course (instructor)
router.post('/course/:courseId', protect, createQuiz);

// List quizzes for a course
router.get('/course/:courseId', protect, listCourseQuizzes);

// Get quiz (public to enrolled users)
router.get('/:quizId', protect, getQuiz);

// Submit quiz answers
router.post('/:quizId/submit', protect, submitQuiz);

// Get user's result
router.get('/:quizId/result', protect, getQuizResult);

// Update quiz (instructor)
router.put('/:quizId', protect, updateQuiz);

// Delete quiz (instructor)
router.delete('/:quizId', protect, deleteQuiz);

// Get detailed results for instructor
router.get('/:quizId/detailed-results', protect, getDetailedQuizResults);

module.exports = router;
