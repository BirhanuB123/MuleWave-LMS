const express = require('express');
const router = express.Router();
const {
  getCourseReviews,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.route('/:courseId')
  .get(getCourseReviews)
  .post(protect, addReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;

