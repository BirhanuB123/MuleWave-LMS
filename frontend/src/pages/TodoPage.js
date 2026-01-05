import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTasks, FaPlus, FaFilter, FaTrash, FaCheck } from 'react-icons/fa';
import '../styles/TodoPage.css';

const TodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    type: 'personal',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    filterTodos();
  }, [filterStatus, filterPriority, todos]);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/todos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(res.data.todos || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const filterTodos = () => {
    let filtered = todos;

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(t => !t.isCompleted);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(t => t.isCompleted);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    setFilteredTodos(filtered);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/todos', newTodo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Todo added successfully!');
      setShowAddModal(false);
      setNewTodo({
        title: '',
        description: '',
        type: 'personal',
        priority: 'medium',
        dueDate: ''
      });
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to add todo');
    }
  };

  const handleToggleTodo = async (todoId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/todos/${todoId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast.error('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/todos/${todoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Todo deleted successfully!');
        fetchTodos();
      } catch (error) {
        console.error('Error deleting todo:', error);
        toast.error('Failed to delete todo');
      }
    }
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="todo-page loading">
        <div className="spinner-large"></div>
        <p>Loading todos...</p>
      </div>
    );
  }

  return (
    <div className="todo-page">
      <div className="todo-header">
        <div className="header-left">
          <FaTasks className="header-icon" />
          <div>
            <h1>My To-Do List</h1>
            <p className="subtitle">Stay organized and productive</p>
          </div>
        </div>
        <button className="add-todo-btn" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add Todo
        </button>
      </div>

      {/* Filters */}
      <div className="todo-filters">
        <div className="filter-group">
          <FaFilter /> Status:
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          Priority:
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="todo-stats">
        <div className="stat-item">
          <span className="stat-number">{todos.filter(t => !t.isCompleted).length}</span>
          <span className="stat-label">Active Tasks</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{todos.filter(t => t.isCompleted).length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{todos.filter(t => !t.isCompleted && isOverdue(t.dueDate)).length}</span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>

      {/* Todo List */}
      <div className="todo-content">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <FaTasks />
            <h3>No todos found</h3>
            <p>Add a new todo to get started!</p>
          </div>
        ) : (
          <div className="todo-list">
            {filteredTodos.map(todo => (
              <div
                key={todo._id}
                className={`todo-item ${todo.isCompleted ? 'completed' : ''} ${isOverdue(todo.dueDate) && !todo.isCompleted ? 'overdue' : ''}`}
              >
                <div className="todo-checkbox">
                  <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={() => handleToggleTodo(todo._id)}
                  />
                  {todo.isCompleted && <FaCheck className="check-icon" />}
                </div>
                <div className="todo-details">
                  <h3 className="todo-title">{todo.title}</h3>
                  {todo.description && <p className="todo-description">{todo.description}</p>}
                  <div className="todo-meta">
                    <span className={`todo-priority ${todo.priority}`}>
                      {todo.priority}
                    </span>
                    <span className="todo-type">{todo.type}</span>
                    {todo.dueDate && (
                      <span className={`todo-due ${isOverdue(todo.dueDate) && !todo.isCompleted ? 'overdue' : ''}`}>
                        Due: {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="delete-todo-btn"
                  onClick={() => handleDeleteTodo(todo._id)}
                  title="Delete todo"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Todo Modal */}
      {showAddModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}></div>
          <div className="modal-container">
            <div className="modal-header">
              <h2>Add New Todo</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddTodo} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  required
                  placeholder="What do you need to do?"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  placeholder="Add more details..."
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newTodo.type}
                    onChange={(e) => setNewTodo({ ...newTodo, type: e.target.value })}
                  >
                    <option value="personal">Personal</option>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="discussion">Discussion</option>
                    <option value="reading">Reading</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="datetime-local"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Todo
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default TodoPage;
