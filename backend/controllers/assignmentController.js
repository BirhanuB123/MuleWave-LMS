const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');

// @desc    Create a new assignment
// @route   POST /api/assignments/course/:courseId
// @access  Private (Instructor/Admin)
exports.createAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, instructions, maxPoints, dueDate, allowLateSubmission, lateSubmissionDeadline, attachments } = req.body;

    // Check if course exists and user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create assignments for this course' });
    }

    const assignment = await Assignment.create({
      course: courseId,
      instructor: req.user.id,
      title,
      description,
      instructions,
      maxPoints,
      dueDate,
      allowLateSubmission,
      lateSubmissionDeadline,
      attachments: attachments || []
    });

    res.status(201).json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
exports.getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    const assignments = await Assignment.find({ 
      course: courseId,
      isPublished: true 
    })
    .populate('instructor', 'firstName lastName email')
    .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('instructor', 'firstName lastName email')
      .populate('course', 'title');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Instructor/Admin)
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check authorization
    if (assignment.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Instructor/Admin)
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check authorization
    if (assignment.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    // Delete all submissions for this assignment
    await Submission.deleteMany({ assignment: req.params.id });

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Assignment and all submissions deleted'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if submission is late
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;

    // Check if late submissions are allowed
    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({ message: 'Late submissions are not allowed for this assignment' });
    }

    // Check if late submission deadline has passed
    if (isLate && assignment.lateSubmissionDeadline) {
      const lateDeadline = new Date(assignment.lateSubmissionDeadline);
      if (now > lateDeadline) {
        return res.status(400).json({ message: 'Late submission deadline has passed' });
      }
    }

    // Check for existing submission
    const existingSubmission = await Submission.findOne({
      assignment: id,
      student: req.user.id
    });

    let submission;
    if (existingSubmission) {
      // Update existing submission (resubmission)
      submission = await Submission.findByIdAndUpdate(
        existingSubmission._id,
        {
          content,
          attachments: attachments || [],
          submittedAt: Date.now(),
          isLate,
          status: 'submitted',
          'resubmission.isResubmission': true,
          'resubmission.previousSubmission': existingSubmission._id,
          $inc: { 'resubmission.resubmissionCount': 1 }
        },
        { new: true }
      );
    } else {
      // Create new submission
      submission = await Submission.create({
        assignment: id,
        student: req.user.id,
        course: assignment.course,
        content,
        attachments: attachments || [],
        isLate
      });
    }

    res.status(201).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student's submission for an assignment
// @route   GET /api/assignments/:id/submission
// @access  Private
exports.getStudentSubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user.id
    })
    .populate('assignment', 'title maxPoints dueDate')
    .populate('grade.gradedBy', 'firstName lastName');

    res.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all submissions for an assignment (Instructor)
// @route   GET /api/assignments/:id/submissions
// @access  Private (Instructor/Admin)
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check authorization
    if (assignment.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'firstName lastName email')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Grade a submission
// @route   PUT /api/assignments/submissions/:submissionId/grade
// @access  Private (Instructor/Admin)
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { points, feedback } = req.body;

    const submission = await Submission.findById(submissionId).populate('assignment');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const assignment = await Assignment.findById(submission.assignment);
    
    // Check authorization
    if (assignment.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to grade this submission' });
    }

    // Validate points
    if (points < 0 || points > assignment.maxPoints) {
      return res.status(400).json({ 
        message: `Points must be between 0 and ${assignment.maxPoints}` 
      });
    }

    submission.grade = {
      points,
      feedback,
      gradedBy: req.user.id,
      gradedAt: Date.now()
    };
    submission.status = 'graded';

    await submission.save();

    res.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
