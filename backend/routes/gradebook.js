const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStudentGradebook,
  getCourseGradebooks,
  updateGradeWeights,
  exportGradebook
} = require('../controllers/gradebookController');

// Gradebook routes
router.get('/course/:courseId', protect, getStudentGradebook);
router.get('/course/:courseId/all', protect, authorize('instructor', 'admin'), getCourseGradebooks);
router.put('/:gradebookId/weights', protect, authorize('instructor', 'admin'), updateGradeWeights);
router.get('/course/:courseId/export', protect, authorize('instructor', 'admin'), exportGradebook);

module.exports = router;
