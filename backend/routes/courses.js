const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');
/*
const {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getInstructorCourses
} = require('../controllers/courseController');
*/

router.route('/')
  .get(getCourses)
  .post(protect, authorize('instructor', 'admin'), createCourse);

router.get('/instructor/mycourses', protect, authorize('instructor', 'admin'), getInstructorCourses);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('instructor', 'admin'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

module.exports = router;

