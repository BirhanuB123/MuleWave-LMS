const Review = require('../models/Review');
const Course = require('../models/Course');

// @desc    Get reviews for a course
// @route   GET /api/reviews/:courseId
// @access  Public
exports.getCourseReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add review for a course
// @route   POST /api/reviews/:courseId
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const courseId = req.params.courseId;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Create review
    const review = await Review.create({
      course: courseId,
      user: req.user.id,
      rating,
      comment
    });

    // Update course rating
    const reviews = await Review.find({ course: courseId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await Course.findByIdAndUpdate(courseId, {
      rating: avgRating.toFixed(1),
      totalReviews: reviews.length
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user is review owner
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Recalculate course rating
    const reviews = await Review.find({ course: review.course });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await Course.findByIdAndUpdate(review.course, {
      rating: avgRating.toFixed(1)
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user is review owner
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const courseId = review.course;
    await review.deleteOne();

    // Recalculate course rating
    const reviews = await Review.find({ course: courseId });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      await Course.findByIdAndUpdate(courseId, {
        rating: avgRating.toFixed(1),
        totalReviews: reviews.length
      });
    } else {
      await Course.findByIdAndUpdate(courseId, {
        rating: 0,
        totalReviews: 0
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

