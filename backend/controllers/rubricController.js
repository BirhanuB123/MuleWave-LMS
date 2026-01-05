const Rubric = require('../models/Rubric');
const Course = require('../models/Course');

// @desc    Create rubric
// @route   POST /api/rubrics/course/:courseId
// @access  Private (Instructor/Admin)
exports.createRubric = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const rubric = await Rubric.create({
      course: courseId,
      instructor: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      rubric
    });
  } catch (error) {
    console.error('Create rubric error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all rubrics for a course
// @route   GET /api/rubrics/course/:courseId
// @access  Private
exports.getCourseRubrics = async (req, res) => {
  try {
    const { courseId } = req.params;

    const rubrics = await Rubric.find({ 
      course: courseId,
      isPublished: true 
    })
      .populate('instructor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rubrics.length,
      rubrics
    });
  } catch (error) {
    console.error('Get rubrics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single rubric
// @route   GET /api/rubrics/:id
// @access  Private
exports.getRubric = async (req, res) => {
  try {
    const rubric = await Rubric.findById(req.params.id)
      .populate('course', 'title')
      .populate('instructor', 'firstName lastName')
      .populate('linkedAssignments', 'title');

    if (!rubric) {
      return res.status(404).json({ message: 'Rubric not found' });
    }

    res.json({
      success: true,
      rubric
    });
  } catch (error) {
    console.error('Get rubric error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update rubric
// @route   PUT /api/rubrics/:id
// @access  Private (Instructor/Admin)
exports.updateRubric = async (req, res) => {
  try {
    const rubric = await Rubric.findById(req.params.id);

    if (!rubric) {
      return res.status(404).json({ message: 'Rubric not found' });
    }

    if (rubric.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedRubric = await Rubric.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      rubric: updatedRubric
    });
  } catch (error) {
    console.error('Update rubric error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete rubric
// @route   DELETE /api/rubrics/:id
// @access  Private (Instructor/Admin)
exports.deleteRubric = async (req, res) => {
  try {
    const rubric = await Rubric.findById(req.params.id);

    if (!rubric) {
      return res.status(404).json({ message: 'Rubric not found' });
    }

    if (rubric.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Rubric.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Rubric deleted successfully'
    });
  } catch (error) {
    console.error('Delete rubric error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get rubric templates
// @route   GET /api/rubrics/templates
// @access  Private (Instructor/Admin)
exports.getRubricTemplates = async (req, res) => {
  try {
    const templates = await Rubric.find({ isTemplate: true })
      .populate('instructor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error) {
    console.error('Get rubric templates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Link rubric to assignment
// @route   PUT /api/rubrics/:id/link/:assignmentId
// @access  Private (Instructor/Admin)
exports.linkToAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    
    const rubric = await Rubric.findById(id);

    if (!rubric) {
      return res.status(404).json({ message: 'Rubric not found' });
    }

    if (rubric.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!rubric.linkedAssignments.includes(assignmentId)) {
      rubric.linkedAssignments.push(assignmentId);
      await rubric.save();
    }

    res.json({
      success: true,
      rubric
    });
  } catch (error) {
    console.error('Link rubric error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
