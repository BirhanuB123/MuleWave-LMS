const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

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

// @desc    Generate completion certificate PDF for an enrollment
// @route   GET /api/enrollments/:id/certificate
// @access  Private (student or admin)
exports.generateCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course')
      .populate('student', 'firstName lastName email');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Make sure user is the enrolled student or admin
    if (enrollment.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to access this enrollment' });
    }

    if (enrollment.progress < 100) {
      return res.status(400).json({ success: false, message: 'Course not yet completed' });
    }

    // Generate PDF certificate
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });

    // Stream to response
    res.setHeader('Content-Type', 'application/pdf');
    const filename = `certificate-${enrollment._id}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.fontSize(36).fillColor('#0b8f8d').text('Certificate of Completion', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(22).fillColor('#111827').text(`This is to certify that`, { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(30).fillColor('#000').text(`${enrollment.student.firstName} ${enrollment.student.lastName}`, { align: 'center', underline: true });
    doc.moveDown(0.5);

    doc.fontSize(20).fillColor('#111827').text(`has successfully completed the course`, { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(26).fillColor('#000').text(`${enrollment.course.title}`, { align: 'center', underline: true });
    doc.moveDown(1);

    const completedOn = enrollment.completionDate ? new Date(enrollment.completionDate) : new Date();
    doc.fontSize(16).fillColor('#111827').text(`Date of completion: ${completedOn.toDateString()}`, { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(14).fillColor('#6b7280').text('MuleWave LMS — Empowering learners worldwide', { align: 'center' });

    doc.end();
    doc.pipe(res);

    // mark certificateIssued true if not already
    if (!enrollment.certificateIssued) {
      enrollment.certificateIssued = true;
      await enrollment.save();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

