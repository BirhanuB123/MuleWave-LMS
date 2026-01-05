const Analytics = require('../models/Analytics');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const QuizResult = require('../models/QuizResult');
const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc    Log activity
// @route   POST /api/analytics/log
// @access  Private
exports.logActivity = async (req, res) => {
  try {
    const activity = await Analytics.create({
      student: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      activity
    });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student dashboard analytics
// @route   GET /api/analytics/student/dashboard
// @access  Private
exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get enrolled courses count
    const enrollments = await Enrollment.find({ student: studentId });
    const coursesCount = enrollments.length;

    // Get completed courses
    const completedCourses = enrollments.filter(e => e.progress === 100).length;

    // Get total assignments submitted
    const submissionsCount = await Submission.countDocuments({ student: studentId });

    // Get total quizzes taken
    const quizzesCount = await QuizResult.countDocuments({ student: studentId });

    // Get average quiz score
    const quizResults = await QuizResult.find({ student: studentId });
    const avgQuizScore = quizResults.length > 0
      ? quizResults.reduce((sum, q) => sum + ((q.points / q.quiz.maxPoints) * 100), 0) / quizResults.length
      : 0;

    // Get average assignment grade
    const gradedSubmissions = await Submission.find({
      student: studentId,
      status: 'graded',
      'grade.points': { $exists: true }
    }).populate('assignment', 'maxPoints');

    const avgAssignmentScore = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => {
          return sum + ((s.grade.points / s.assignment.maxPoints) * 100);
        }, 0) / gradedSubmissions.length
      : 0;

    // Get total time spent (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await Analytics.find({
      student: studentId,
      timestamp: { $gte: thirtyDaysAgo },
      'metadata.duration': { $exists: true }
    });

    const totalTimeSpent = activities.reduce((sum, a) => sum + (a.metadata.duration || 0), 0);
    const totalHours = Math.round(totalTimeSpent / 3600);

    // Get activity by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = await Analytics.aggregate([
      {
        $match: {
          student: req.user._id,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get most active courses
    const courseActivity = await Analytics.aggregate([
      {
        $match: {
          student: req.user._id,
          course: { $exists: true },
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const populatedCourseActivity = await Course.populate(courseActivity, {
      path: '_id',
      select: 'title thumbnail'
    });

    res.json({
      success: true,
      analytics: {
        overview: {
          coursesCount,
          completedCourses,
          submissionsCount,
          quizzesCount,
          avgQuizScore: Math.round(avgQuizScore),
          avgAssignmentScore: Math.round(avgAssignmentScore),
          totalHours
        },
        activityByDay: recentActivities,
        mostActiveCourses: populatedCourseActivity
      }
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get course analytics for student
// @route   GET /api/analytics/student/course/:courseId
// @access  Private
exports.getStudentCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Get enrollment data
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    // Get time spent on course
    const activities = await Analytics.find({
      student: studentId,
      course: courseId,
      'metadata.duration': { $exists: true }
    });

    const totalTimeSpent = activities.reduce((sum, a) => sum + (a.metadata.duration || 0), 0);

    // Get quiz performance
    const quizResults = await QuizResult.find({
      student: studentId,
      course: courseId
    }).populate('quiz', 'title maxPoints');

    // Get assignment performance
    const submissions = await Submission.find({
      student: studentId,
      course: courseId,
      status: 'graded'
    }).populate('assignment', 'title maxPoints');

    // Get activity breakdown
    const activityBreakdown = await Analytics.aggregate([
      {
        $match: {
          student: req.user._id,
          course: mongoose.Types.ObjectId(courseId)
        }
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        progress: enrollment.progress,
        totalTimeSpent: Math.round(totalTimeSpent / 3600), // hours
        quizResults: quizResults.map(q => ({
          title: q.quiz.title,
          score: Math.round((q.points / q.quiz.maxPoints) * 100),
          date: q.submittedAt
        })),
        assignments: submissions.map(s => ({
          title: s.assignment.title,
          score: s.grade.points ? Math.round((s.grade.points / s.assignment.maxPoints) * 100) : null,
          date: s.submittedAt
        })),
        activityBreakdown
      }
    });
  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get instructor course analytics
// @route   GET /api/analytics/instructor/course/:courseId
// @access  Private (Instructor/Admin)
exports.getInstructorCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify instructor owns course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get enrollments
    const enrollments = await Enrollment.find({ course: courseId });
    const studentIds = enrollments.map(e => e.student);

    // Get completion rate
    const completedCount = enrollments.filter(e => e.progress === 100).length;
    const completionRate = enrollments.length > 0
      ? Math.round((completedCount / enrollments.length) * 100)
      : 0;

    // Get average progress
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0;

    // Get quiz performance
    const quizResults = await QuizResult.find({ course: courseId });
    const avgQuizScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, q) => sum + ((q.points / q.quiz.maxPoints) * 100), 0) / quizResults.length)
      : 0;

    // Get assignment submission rate
    const assignments = await require('../models/Assignment').find({ course: courseId });
    const totalExpectedSubmissions = assignments.length * enrollments.length;
    const actualSubmissions = await Submission.countDocuments({ course: courseId });
    const submissionRate = totalExpectedSubmissions > 0
      ? Math.round((actualSubmissions / totalExpectedSubmissions) * 100)
      : 0;

    // Get student engagement (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const engagementData = await Analytics.aggregate([
      {
        $match: {
          course: mongoose.Types.ObjectId(courseId),
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get most active students
    const activeStudents = await Analytics.aggregate([
      {
        $match: {
          course: mongoose.Types.ObjectId(courseId),
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$student',
          activityCount: { $sum: 1 }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 }
    ]);

    const populatedStudents = await User.populate(activeStudents, {
      path: '_id',
      select: 'firstName lastName email'
    });

    res.json({
      success: true,
      analytics: {
        overview: {
          totalStudents: enrollments.length,
          completionRate,
          avgProgress,
          avgQuizScore,
          submissionRate
        },
        engagementData,
        activeStudents: populatedStudents
      }
    });
  } catch (error) {
    console.error('Get instructor analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
