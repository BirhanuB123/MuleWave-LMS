const Syllabus = require('../models/Syllabus');
const Course = require('../models/Course');

// @desc    Create syllabus
// @route   POST /api/syllabus/course/:courseId
// @access  Private (Instructor/Admin)
exports.createSyllabus = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if syllabus already exists
    const existingSyllabus = await Syllabus.findOne({ course: courseId });
    if (existingSyllabus) {
      return res.status(400).json({ message: 'Syllabus already exists for this course. Use update instead.' });
    }

    const syllabus = await Syllabus.create({
      course: courseId,
      instructor: req.user.id,
      courseTitle: course.title,
      ...req.body
    });

    res.status(201).json({
      success: true,
      syllabus
    });
  } catch (error) {
    console.error('Create syllabus error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get syllabus for a course
// @route   GET /api/syllabus/course/:courseId
// @access  Private
exports.getCourseSyllabus = async (req, res) => {
  try {
    const { courseId } = req.params;

    const syllabus = await Syllabus.findOne({ course: courseId })
      .populate('course', 'title category level')
      .populate('instructor', 'firstName lastName email');

    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    res.json({
      success: true,
      syllabus
    });
  } catch (error) {
    console.error('Get syllabus error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update syllabus
// @route   PUT /api/syllabus/:id
// @access  Private (Instructor/Admin)
exports.updateSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);

    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    if (syllabus.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedSyllabus = await Syllabus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      syllabus: updatedSyllabus
    });
  } catch (error) {
    console.error('Update syllabus error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete syllabus
// @route   DELETE /api/syllabus/:id
// @access  Private (Instructor/Admin)
exports.deleteSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);

    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    if (syllabus.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Syllabus.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Syllabus deleted successfully'
    });
  } catch (error) {
    console.error('Delete syllabus error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Publish/unpublish syllabus
// @route   PUT /api/syllabus/:id/publish
// @access  Private (Instructor/Admin)
exports.togglePublish = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);

    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    if (syllabus.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    syllabus.isPublished = !syllabus.isPublished;
    await syllabus.save();

    res.json({
      success: true,
      syllabus
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
