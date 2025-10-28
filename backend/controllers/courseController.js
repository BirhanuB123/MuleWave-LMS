const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const { category, level, search, sort } = req.query;
    
    let query = { isPublished: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by level
    if (level) {
      query.level = level;
    }

    // Search in title and description
    if (search) {
      query.$text = { $search: search };
    }

    let courses = Course.find(query).populate('instructor', 'firstName lastName avatar');

    // Sort
    if (sort === 'popular') {
      courses = courses.sort({ enrollmentCount: -1 });
    } else if (sort === 'rating') {
      courses = courses.sort({ rating: -1 });
    } else if (sort === 'newest') {
      courses = courses.sort({ createdAt: -1 });
    } else if (sort === 'price-low') {
      courses = courses.sort({ price: 1 });
    } else if (sort === 'price-high') {
      courses = courses.sort({ price: -1 });
    }

    const result = await courses;

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName avatar bio');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
exports.createCourse = async (req, res) => {
  try {
    req.body.instructor = req.user.id;

    const course = await Course.create(req.body);

    // Add course to instructor's created courses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { createdCourses: course._id }
    });

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Make sure user is course owner or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Make sure user is course owner or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    await course.deleteOne();

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

// @desc    Get instructor courses
// @route   GET /api/courses/instructor/mycourses
// @access  Private (Instructor)
exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

