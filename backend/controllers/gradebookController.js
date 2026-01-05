const Gradebook = require('../models/Gradebook');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const QuizResult = require('../models/QuizResult');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');

// @desc    Get student's gradebook for a course
// @route   GET /api/gradebook/course/:courseId
// @access  Private
exports.getStudentGradebook = async (req, res) => {
  try {
    const { courseId } = req.params;

    let gradebook = await Gradebook.findOne({ 
      course: courseId, 
      student: req.user.id 
    });

    // If gradebook doesn't exist, create it
    if (!gradebook) {
      gradebook = await Gradebook.create({
        course: courseId,
        student: req.user.id,
        grades: []
      });
    }

    // Fetch all quiz results and assignment grades
    const quizResults = await QuizResult.find({ 
      student: req.user.id,
      course: courseId 
    }).populate('quiz', 'title maxPoints');

    const submissions = await Submission.find({
      student: req.user.id,
      course: courseId,
      status: 'graded'
    }).populate('assignment', 'title maxPoints');

    // Update gradebook with latest data
    gradebook.grades = [];

    // Add quiz grades
    quizResults.forEach(result => {
      const percentage = result.quiz.maxPoints > 0 
        ? (result.points / result.quiz.maxPoints) * 100 
        : 0;
      
      gradebook.grades.push({
        item: 'quiz',
        itemId: result.quiz._id,
        itemTitle: result.quiz.title,
        points: result.points,
        maxPoints: result.quiz.maxPoints,
        percentage: Math.round(percentage * 100) / 100,
        gradedAt: result.submittedAt,
        weight: 1
      });
    });

    // Add assignment grades
    submissions.forEach(submission => {
      if (submission.grade && submission.grade.points !== null) {
        const percentage = submission.assignment.maxPoints > 0 
          ? (submission.grade.points / submission.assignment.maxPoints) * 100 
          : 0;
        
        gradebook.grades.push({
          item: 'assignment',
          itemId: submission.assignment._id,
          itemTitle: submission.assignment.title,
          points: submission.grade.points,
          maxPoints: submission.assignment.maxPoints,
          percentage: Math.round(percentage * 100) / 100,
          gradedAt: submission.grade.gradedAt,
          weight: 1
        });
      }
    });

    // Calculate overall grade
    gradebook.calculateOverallGrade();
    await gradebook.save();

    res.json({
      success: true,
      gradebook
    });
  } catch (error) {
    console.error('Get gradebook error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all gradebooks for a course (Instructor view)
// @route   GET /api/gradebook/course/:courseId/all
// @access  Private (Instructor/Admin)
exports.getCourseGradebooks = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get all enrolled students
    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'firstName lastName email');

    const gradebooks = [];

    for (const enrollment of enrollments) {
      let gradebook = await Gradebook.findOne({ 
        course: courseId, 
        student: enrollment.student._id 
      });

      // If gradebook doesn't exist, create it
      if (!gradebook) {
        gradebook = await Gradebook.create({
          course: courseId,
          student: enrollment.student._id,
          grades: []
        });
      }

      // Fetch quiz results and assignment grades for this student
      const quizResults = await QuizResult.find({ 
        student: enrollment.student._id,
        course: courseId 
      }).populate('quiz', 'title maxPoints');

      const submissions = await Submission.find({
        student: enrollment.student._id,
        course: courseId,
        status: 'graded'
      }).populate('assignment', 'title maxPoints');

      // Update gradebook
      gradebook.grades = [];

      quizResults.forEach(result => {
        const percentage = result.quiz.maxPoints > 0 
          ? (result.points / result.quiz.maxPoints) * 100 
          : 0;
        
        gradebook.grades.push({
          item: 'quiz',
          itemId: result.quiz._id,
          itemTitle: result.quiz.title,
          points: result.points,
          maxPoints: result.quiz.maxPoints,
          percentage: Math.round(percentage * 100) / 100,
          gradedAt: result.submittedAt,
          weight: 1
        });
      });

      submissions.forEach(submission => {
        if (submission.grade && submission.grade.points !== null) {
          const percentage = submission.assignment.maxPoints > 0 
            ? (submission.grade.points / submission.assignment.maxPoints) * 100 
            : 0;
          
          gradebook.grades.push({
            item: 'assignment',
            itemId: submission.assignment._id,
            itemTitle: submission.assignment.title,
            points: submission.grade.points,
            maxPoints: submission.assignment.maxPoints,
            percentage: Math.round(percentage * 100) / 100,
            gradedAt: submission.grade.gradedAt,
            weight: 1
          });
        }
      });

      gradebook.calculateOverallGrade();
      await gradebook.save();

      gradebooks.push({
        student: {
          _id: enrollment.student._id,
          firstName: enrollment.student.firstName,
          lastName: enrollment.student.lastName,
          email: enrollment.student.email
        },
        gradebook
      });
    }

    res.json({
      success: true,
      count: gradebooks.length,
      gradebooks
    });
  } catch (error) {
    console.error('Get course gradebooks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update grade weights
// @route   PUT /api/gradebook/:gradebookId/weights
// @access  Private (Instructor/Admin)
exports.updateGradeWeights = async (req, res) => {
  try {
    const { gradebookId } = req.params;
    const { weights } = req.body; // Array of { itemId, weight }

    const gradebook = await Gradebook.findById(gradebookId);
    if (!gradebook) {
      return res.status(404).json({ message: 'Gradebook not found' });
    }

    // Check if user is the instructor
    const course = await Course.findById(gradebook.course);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update weights
    weights.forEach(({ itemId, weight }) => {
      const gradeItem = gradebook.grades.find(
        g => g.itemId.toString() === itemId
      );
      if (gradeItem) {
        gradeItem.weight = weight;
      }
    });

    // Recalculate overall grade
    gradebook.calculateOverallGrade();
    await gradebook.save();

    res.json({
      success: true,
      gradebook
    });
  } catch (error) {
    console.error('Update grade weights error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Export gradebook as CSV
// @route   GET /api/gradebook/course/:courseId/export
// @access  Private (Instructor/Admin)
exports.exportGradebook = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get all gradebooks for the course
    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'firstName lastName email');

    const csvData = [];
    const headers = ['Student Name', 'Email', 'Total Points', 'Max Points', 'Percentage', 'Letter Grade'];

    csvData.push(headers.join(','));

    for (const enrollment of enrollments) {
      const gradebook = await Gradebook.findOne({ 
        course: courseId, 
        student: enrollment.student._id 
      });

      if (gradebook) {
        const row = [
          `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          enrollment.student.email,
          gradebook.overallGrade.totalPoints,
          gradebook.overallGrade.totalMaxPoints,
          gradebook.overallGrade.percentage,
          gradebook.overallGrade.letterGrade
        ];
        csvData.push(row.join(','));
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=gradebook-${courseId}.csv`);
    res.send(csvData.join('\n'));
  } catch (error) {
    console.error('Export gradebook error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
