import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/InstructorDashboard.css';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      const response = await api.get('/courses/instructor/mycourses');
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Course deleted successfully');
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const totalEnrollments = courses.reduce((acc, course) => acc + (course.enrollmentCount || 0), 0);
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const avgRating = courses.length > 0
    ? (courses.reduce((acc, c) => acc + c.rating, 0) / courses.length).toFixed(1)
    : 0;

  return (
    <div className="instructor-dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Instructor Dashboard</h1>
            <p>Manage your courses and track performance</p>
          </div>
          <Link to="/instructor/create-course">
            <button className="btn btn-primary">
              <FaPlus /> Create New Course
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--primary)' }}>
              <FaEye />
            </div>
            <div className="stat-content">
              <h3>{courses.length}</h3>
              <p>Total Courses</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success)' }}>
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{totalEnrollments}</h3>
              <p>Total Students</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--warning)' }}>
              <FaEye />
            </div>
            <div className="stat-content">
              <h3>{publishedCourses}</h3>
              <p>Published</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--info)' }}>
              ⭐
            </div>
            <div className="stat-content">
              <h3>{avgRating}</h3>
              <p>Avg. Rating</p>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="courses-section">
          <h2>My Courses</h2>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : courses.length > 0 ? (
            <div className="courses-table">
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Students</th>
                    <th>Rating</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course._id}>
                      <td>
                        <div className="course-info">
                          <img 
                            src={course.thumbnail || 'https://via.placeholder.com/80x50?text=Course'} 
                            alt={course.title}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80x50?text=Course'; }}
                          />
                          <div>
                            <h4>{course.title}</h4>
                            <span className="category">{course.category}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${course.isPublished ? 'published' : 'draft'}`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>{course.enrollmentCount || 0}</td>
                      <td>
                        <div className="rating">
                          ⭐ {course.rating > 0 ? course.rating.toFixed(1) : 'N/A'}
                        </div>
                      </td>
                      <td>${course.price}</td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/courses/${course._id}`} title="View">
                            <button className="btn-icon btn-view">
                              <FaEye />
                            </button>
                          </Link>
                          <Link to={`/instructor/edit-course/${course._id}`} title="Edit">
                            <button className="btn-icon btn-edit">
                              <FaEdit />
                            </button>
                          </Link>
                          <button 
                            className="btn-icon btn-delete" 
                            onClick={() => handleDeleteCourse(course._id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <FaEye size={64} />
              <h3>No courses yet</h3>
              <p>Start creating your first course and share your knowledge with students</p>
              <Link to="/instructor/create-course">
                <button className="btn btn-primary">
                  <FaPlus /> Create Your First Course
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;

