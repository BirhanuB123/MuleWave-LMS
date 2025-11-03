const express = require('express');
const router = express.Router();
const {
  enrollCourse,
  getMyEnrollments,
  getEnrollment,
  updateProgress
} = require('../controllers/enrollmentController');
const { generateCertificate } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getMyEnrollments);

router.route('/:courseId')
  .post(protect, enrollCourse);

router.route('/:id')
  .get(protect, getEnrollment);

router.route('/:id/progress')
  .put(protect, updateProgress);

router.route('/:id/certificate')
  .get(protect, generateCertificate);

module.exports = router;

