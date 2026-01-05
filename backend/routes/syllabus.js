const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSyllabus,
  getCourseSyllabus,
  updateSyllabus,
  deleteSyllabus,
  togglePublish
} = require('../controllers/syllabusController');

// Syllabus routes
router.post('/course/:courseId', protect, authorize('instructor', 'admin'), createSyllabus);
router.get('/course/:courseId', protect, getCourseSyllabus);
router.put('/:id', protect, authorize('instructor', 'admin'), updateSyllabus);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteSyllabus);
router.put('/:id/publish', protect, authorize('instructor', 'admin'), togglePublish);

module.exports = router;
