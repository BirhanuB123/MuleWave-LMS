const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createAssignment,
  getCourseAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getStudentSubmission,
  getAssignmentSubmissions,
  gradeSubmission
} = require('../controllers/assignmentController');

// Assignment routes
router.post('/course/:courseId', protect, authorize('instructor', 'admin'), createAssignment);
router.get('/course/:courseId', protect, getCourseAssignments);
router.get('/:id', protect, getAssignment);
router.put('/:id', protect, authorize('instructor', 'admin'), updateAssignment);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteAssignment);

// Submission routes
router.post('/:id/submit', protect, submitAssignment);
router.get('/:id/submission', protect, getStudentSubmission);
router.get('/:id/submissions', protect, authorize('instructor', 'admin'), getAssignmentSubmissions);
router.put('/submissions/:submissionId/grade', protect, authorize('instructor', 'admin'), gradeSubmission);

module.exports = router;
