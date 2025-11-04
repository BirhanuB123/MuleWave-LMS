const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalCourses, payments, courses] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Payment.find({ status: 'completed' }),
      Course.find().select('rating ratingCount')
    ]);

    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate average rating
    const totalRating = courses.reduce((sum, course) => sum + (course.rating * course.ratingCount), 0);
    const totalRatingCount = courses.reduce((sum, course) => sum + course.ratingCount, 0);
    const averageRating = totalRatingCount > 0 ? totalRating / totalRatingCount : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalRevenue,
        averageRating
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all courses (admin)
// @route   GET /api/admin/courses
// @access  Private (admin)
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'firstName lastName email');
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (admin)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Publish / Approve a course
// @route   PUT /api/admin/courses/:id/publish
// @access  Private (admin)
exports.publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    course.isPublished = true;
    await course.save();
    res.status(200).json({ success: true, data: course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a user (student or instructor) and cascade cleanup
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot delete the last admin user' 
        });
      }
    }

    // If instructor, delete their courses and related enrollments
    if (user.role === 'instructor') {
      const courses = await Course.find({ instructor: user._id });
      const courseIds = courses.map(c => c._id);
      await Enrollment.deleteMany({ course: { $in: courseIds } });
      await Course.deleteMany({ instructor: user._id });
    }

    // Remove enrollments where the user is a student
    await Enrollment.deleteMany({ student: user._id });

    // Finally remove the user
    await User.deleteOne({ _id: user._id });

    res.status(200).json({ success: true, message: 'User and related data deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent deactivating the last admin
    if (user.role === 'admin' && status === 'inactive') {
      const activeAdmins = await User.countDocuments({ 
        role: 'admin', 
        status: 'active' 
      });
      if (activeAdmins <= 1) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot deactivate the last active admin' 
        });
      }
    }

    user.status = status;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: user 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a course and related data
// @route   DELETE /api/admin/courses/:id
// @access  Private (admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Delete all enrollments for this course
    await Enrollment.deleteMany({ course: course._id });
    
    // Delete all reviews for this course
    await Review.deleteMany({ course: course._id });
    
    // Delete all payments for this course
    await Payment.deleteMany({ course: course._id });
    
    // Finally delete the course
    await Course.deleteOne({ _id: course._id });

    res.status(200).json({ 
      success: true, 
      message: 'Course and related data deleted successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
