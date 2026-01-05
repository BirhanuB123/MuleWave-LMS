const TodoItem = require('../models/TodoItem');
const Course = require('../models/Course');

// @desc    Get all todos for user
// @route   GET /api/todos
// @access  Private
exports.getUserTodos = async (req, res) => {
  try {
    const { status, course, priority } = req.query;
    
    const query = { student: req.user.id };
    
    if (status === 'completed') {
      query.isCompleted = true;
    } else if (status === 'active') {
      query.isCompleted = false;
    }
    
    if (course) {
      query.course = course;
    }
    
    if (priority) {
      query.priority = priority;
    }

    const todos = await TodoItem.find(query)
      .populate('course', 'title')
      .sort({ isCompleted: 1, dueDate: 1, priority: -1 });

    res.json({
      success: true,
      count: todos.length,
      todos
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create todo
// @route   POST /api/todos
// @access  Private
exports.createTodo = async (req, res) => {
  try {
    const todo = await TodoItem.create({
      student: req.user.id,
      ...req.body
    });

    const populatedTodo = await TodoItem.findById(todo._id)
      .populate('course', 'title');

    res.status(201).json({
      success: true,
      todo: populatedTodo
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Private
exports.updateTodo = async (req, res) => {
  try {
    const todo = await TodoItem.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (todo.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTodo = await TodoItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'title');

    res.json({
      success: true,
      todo: updatedTodo
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await TodoItem.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (todo.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await TodoItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle todo completion
// @route   PUT /api/todos/:id/toggle
// @access  Private
exports.toggleTodo = async (req, res) => {
  try {
    const todo = await TodoItem.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (todo.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    todo.isCompleted = !todo.isCompleted;
    todo.completedAt = todo.isCompleted ? Date.now() : null;
    await todo.save();

    res.json({
      success: true,
      todo
    });
  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get upcoming todos (next 7 days)
// @route   GET /api/todos/upcoming
// @access  Private
exports.getUpcomingTodos = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const todos = await TodoItem.find({
      student: req.user.id,
      isCompleted: false,
      dueDate: {
        $gte: today,
        $lte: nextWeek
      }
    })
      .populate('course', 'title')
      .sort({ dueDate: 1, priority: -1 });

    res.json({
      success: true,
      count: todos.length,
      todos
    });
  } catch (error) {
    console.error('Get upcoming todos error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get overdue todos
// @route   GET /api/todos/overdue
// @access  Private
exports.getOverdueTodos = async (req, res) => {
  try {
    const today = new Date();

    const todos = await TodoItem.find({
      student: req.user.id,
      isCompleted: false,
      dueDate: {
        $lt: today
      }
    })
      .populate('course', 'title')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: todos.length,
      todos
    });
  } catch (error) {
    console.error('Get overdue todos error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
