const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  getUpcomingTodos,
  getOverdueTodos
} = require('../controllers/todoController');

// Todo routes
router.get('/', protect, getUserTodos);
router.post('/', protect, createTodo);
router.get('/upcoming', protect, getUpcomingTodos);
router.get('/overdue', protect, getOverdueTodos);
router.put('/:id', protect, updateTodo);
router.delete('/:id', protect, deleteTodo);
router.put('/:id/toggle', protect, toggleTodo);

module.exports = router;
