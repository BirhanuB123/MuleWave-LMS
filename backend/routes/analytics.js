const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  logActivity,
  getStudentDashboard,
  getStudentCourseAnalytics,
  getInstructorCourseAnalytics
} = require('../controllers/analyticsController');

// Analytics routes
router.post('/log', protect, logActivity);
router.get('/student/dashboard', protect, getStudentDashboard);
router.get('/student/course/:courseId', protect, getStudentCourseAnalytics);
router.get('/instructor/course/:courseId', protect, authorize('instructor', 'admin'), getInstructorCourseAnalytics);

module.exports = router;
