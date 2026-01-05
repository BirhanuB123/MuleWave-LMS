import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBell, FaCalendarAlt, FaTasks, FaChartLine, FaBook, FaClock } from 'react-icons/fa';
import '../styles/ModernDashboard.css';

const ModernDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [todos, setTodos] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch all dashboard data in parallel
      const [coursesRes, analyticsRes, todosRes, eventsRes, notificationsRes] = await Promise.all([
        axios.get('/api/enrollments', config),
        axios.get('/api/analytics/student/dashboard', config),
        axios.get('/api/todos?status=active', config),
        axios.get('/api/calendar/upcoming', config),
        axios.get('/api/notifications?limit=5', config)
      ]);

      setCourses(coursesRes.data.enrollments || []);
      setAnalytics(analyticsRes.data.analytics);
      setTodos(todosRes.data.todos || []);
      setUpcomingEvents(eventsRes.data.events || []);
      setNotifications(notificationsRes.data.notifications || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="modern-dashboard loading">
        <div className="spinner-large"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.firstName}!</h1>
          <p className="subtitle">Here's what's happening with your courses today</p>
        </div>
        <div className="quick-actions">
          <Link to="/calendar" className="action-btn">
            <FaCalendarAlt /> Calendar
          </Link>
          <Link to="/todos" className="action-btn">
            <FaTasks /> To-Do
          </Link>
          <Link to="/notifications" className="action-btn">
            <FaBell />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="badge">{notifications.filter(n => !n.isRead).length}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="analytics-cards">
          <div className="stat-card blue">
            <div className="stat-icon">
              <FaBook />
            </div>
            <div className="stat-content">
              <h3>{analytics.overview.coursesCount}</h3>
              <p>Active Courses</p>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3>{analytics.overview.avgQuizScore}%</h3>
              <p>Avg Quiz Score</p>
            </div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon">
              <FaTasks />
            </div>
            <div className="stat-content">
              <h3>{analytics.overview.submissionsCount}</h3>
              <p>Assignments Submitted</p>
            </div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>{analytics.overview.totalHours}h</h3>
              <p>Time Spent</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column - Courses */}
        <div className="dashboard-section courses-section">
          <div className="section-header">
            <h2>My Courses</h2>
            <Link to="/courses" className="view-all">View All</Link>
          </div>
          <div className="course-cards-grid">
            {courses.slice(0, 6).map((enrollment) => (
              <div key={enrollment._id} className="course-card-modern">
                <div className="course-card-image">
                  <img
                    src={enrollment.course.thumbnail || '/assets/default-course.jpg'}
                    alt={enrollment.course.title}
                  />
                  <div className="progress-overlay">
                    <div className="progress-circle">
                      <svg viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e0e0e0"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="3"
                          strokeDasharray={`${enrollment.progress}, 100`}
                        />
                      </svg>
                      <span className="progress-text">{enrollment.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="course-card-content">
                  <h3>{enrollment.course.title}</h3>
                  <p className="course-instructor">{enrollment.course.instructor?.firstName} {enrollment.course.instructor?.lastName}</p>
                  <div className="course-meta">
                    <span className="course-level">{enrollment.course.level}</span>
                    <span className="course-category">{enrollment.course.category}</span>
                  </div>
                  <Link to={`/courses/${enrollment.course._id}/play`} className="continue-btn">
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - To-Do & Upcoming */}
        <div className="dashboard-sidebar">
          {/* To-Do List */}
          <div className="dashboard-widget">
            <div className="widget-header">
              <h3><FaTasks /> To-Do List</h3>
              <Link to="/todos" className="widget-link">View All</Link>
            </div>
            <div className="widget-content">
              {todos.length === 0 ? (
                <p className="empty-state">No pending tasks! 🎉</p>
              ) : (
                <ul className="todo-list">
                  {todos.slice(0, 5).map((todo) => (
                    <li key={todo._id} className="todo-item">
                      <div className="todo-checkbox">
                        <input type="checkbox" checked={todo.isCompleted} readOnly />
                      </div>
                      <div className="todo-content">
                        <p className="todo-title">{todo.title}</p>
                        {todo.dueDate && (
                          <span className="todo-date">
                            Due: {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <span className={`priority-badge ${todo.priority}`}>
                        {todo.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="dashboard-widget">
            <div className="widget-header">
              <h3><FaCalendarAlt /> Upcoming</h3>
              <Link to="/calendar" className="widget-link">View Calendar</Link>
            </div>
            <div className="widget-content">
              {upcomingEvents.length === 0 ? (
                <p className="empty-state">No upcoming events</p>
              ) : (
                <ul className="event-list">
                  {upcomingEvents.map((event) => (
                    <li key={event._id} className="event-item">
                      <div className="event-date">
                        <span className="event-day">{new Date(event.startDate).getDate()}</span>
                        <span className="event-month">
                          {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="event-details">
                        <p className="event-title">{event.title}</p>
                        <span className="event-type">{event.eventType}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="dashboard-widget">
            <div className="widget-header">
              <h3><FaBell /> Notifications</h3>
              <Link to="/notifications" className="widget-link">View All</Link>
            </div>
            <div className="widget-content">
              {notifications.length === 0 ? (
                <p className="empty-state">No notifications</p>
              ) : (
                <ul className="notification-list">
                  {notifications.map((notification) => (
                    <li key={notification._id} className={`notification-item ${!notification.isRead ? 'unread' : ''}`}>
                      <div className="notification-icon" style={{ backgroundColor: notification.color }}>
                        <FaBell />
                      </div>
                      <div className="notification-content">
                        <p className="notification-title">{notification.title}</p>
                        <span className="notification-time">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;
