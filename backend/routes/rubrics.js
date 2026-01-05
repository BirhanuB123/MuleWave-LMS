const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createRubric,
  getCourseRubrics,
  getRubric,
  updateRubric,
  deleteRubric,
  getRubricTemplates,
  linkToAssignment
} = require('../controllers/rubricController');

// Rubric routes
router.post('/course/:courseId', protect, authorize('instructor', 'admin'), createRubric);
router.get('/course/:courseId', protect, getCourseRubrics);
router.get('/templates', protect, authorize('instructor', 'admin'), getRubricTemplates);
router.get('/:id', protect, getRubric);
router.put('/:id', protect, authorize('instructor', 'admin'), updateRubric);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteRubric);
router.put('/:id/link/:assignmentId', protect, authorize('instructor', 'admin'), linkToAssignment);

module.exports = router;
