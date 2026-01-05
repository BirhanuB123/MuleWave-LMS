const Module = require('../models/Module');
const Course = require('../models/Course');

// @desc    Create module
// @route   POST /api/modules/course/:courseId
// @access  Private (Instructor/Admin)
exports.createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const module = await Module.create({
      course: courseId,
      ...req.body
    });

    res.status(201).json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all modules for a course
// @route   GET /api/modules/course/:courseId
// @access  Private
exports.getCourseModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const modules = await Module.find({ 
      course: courseId,
      isPublished: true 
    })
      .sort({ order: 1 })
      .populate('prerequisite', 'title');

    res.json({
      success: true,
      count: modules.length,
      modules
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single module
// @route   GET /api/modules/:id
// @access  Private
exports.getModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('course', 'title')
      .populate('prerequisite', 'title');

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Private (Instructor/Admin)
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate('course');

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      module: updatedModule
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private (Instructor/Admin)
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate('course');

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Module.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add item to module
// @route   POST /api/modules/:id/items
// @access  Private (Instructor/Admin)
exports.addModuleItem = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate('course');

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    module.items.push(req.body);
    await module.save();

    res.status(201).json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Add module item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update module item
// @route   PUT /api/modules/:moduleId/items/:itemId
// @access  Private (Instructor/Admin)
exports.updateModuleItem = async (req, res) => {
  try {
    const { moduleId, itemId } = req.params;
    const module = await Module.findById(moduleId).populate('course');

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const item = module.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    Object.assign(item, req.body);
    await module.save();

    res.json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Update module item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete module item
// @route   DELETE /api/modules/:moduleId/items/:itemId
// @access  Private (Instructor/Admin)
exports.deleteModuleItem = async (req, res) => {
  try {
    const { moduleId, itemId } = req.params;
    const module = await Module.findById(moduleId).populate('course');

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    module.items = module.items.filter(item => item._id.toString() !== itemId);
    await module.save();

    res.json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Delete module item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reorder modules
// @route   PUT /api/modules/course/:courseId/reorder
// @access  Private (Instructor/Admin)
exports.reorderModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleOrders } = req.body; // Array of { moduleId, order }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update order for each module
    for (const { moduleId, order } of moduleOrders) {
      await Module.findByIdAndUpdate(moduleId, { order });
    }

    const modules = await Module.find({ course: courseId }).sort({ order: 1 });

    res.json({
      success: true,
      modules
    });
  } catch (error) {
    console.error('Reorder modules error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
