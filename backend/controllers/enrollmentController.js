const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private
exports.enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      payment: req.body.paymentId
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(studentId, {
      $push: { enrolledCourses: courseId }
    });

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user enrollments
// @route   GET /api/enrollments
// @access  Private
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('course', 'title thumbnail description instructor duration')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
// @access  Private
exports.getEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course')
      .populate('student', 'firstName lastName email');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Make sure user is the enrolled student
    if (enrollment.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this enrollment'
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update course progress
// @route   PUT /api/enrollments/:id/progress
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { completedLectures, progress } = req.body;

    let enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Make sure user is the enrolled student
    if (enrollment.student.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this enrollment'
      });
    }

    enrollment.completedLectures = completedLectures || enrollment.completedLectures;
    enrollment.progress = progress || enrollment.progress;

    // Check if course is completed
    if (enrollment.progress === 100 && !enrollment.completionDate) {
      enrollment.completionDate = Date.now();
      enrollment.certificateIssued = true;
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

