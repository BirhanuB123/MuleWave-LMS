import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FaPlay, FaClock, FaCheckCircle } from 'react-icons/fa';
import '../styles/MyCourses.css';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, in-progress, completed

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/enrollments');
      setEnrollments(response.data.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (filter === 'in-progress') return enrollment.progress > 0 && enrollment.progress < 100;
    if (filter === 'completed') return enrollment.progress === 100;
    return true;
  });

  return (
    <div className="my-courses-page">
      <div className="my-courses-header">
        <div className="container">
          <h1>My Courses</h1>
          <p>Continue your learning journey</p>
        </div>
      </div>

      <div className="container">
        <div className="filters-bar">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Courses ({enrollments.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            In Progress ({enrollments.filter(e => e.progress > 0 && e.progress < 100).length})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({enrollments.filter(e => e.progress === 100).length})
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : filteredEnrollments.length > 0 ? (
          <div className="my-courses-grid">
            {filteredEnrollments.map(enrollment => (
              <div key={enrollment._id} className="my-course-card">
                <div className="course-image">
                  <img 
                    src={enrollment.course.thumbnail || 'https://via.placeholder.com/400x200?text=Course'} 
                    alt={enrollment.course.title}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Course'; }}
                  />
                  {enrollment.progress === 100 && (
                    <div className="completion-badge">
                      <FaCheckCircle /> Completed
                    </div>
                  )}
                </div>

                <div className="course-content">
                  <h3>{enrollment.course.title}</h3>
                  <p className="instructor">
                    {enrollment.course.instructor?.firstName} {enrollment.course.instructor?.lastName}
                  </p>

                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Progress</span>
                      <span className="progress-percent">{enrollment.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {enrollment.progress === 100 && enrollment.certificateIssued && (
                    <div className="certificate-info">
                      <FaCheckCircle /> Certificate earned
                    </div>
                  )}

                  <Link to={`/course-player/${enrollment.course._id}`}>
                    <button className="btn btn-primary btn-block">
                      <FaPlay /> {enrollment.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                    </button>
                  </Link>

                  {enrollment.course.duration && (
                    <div className="course-duration">
                      <FaClock /> {enrollment.course.duration}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No courses found</h3>
            <p>
              {filter === 'all' 
                ? 'You haven\'t enrolled in any courses yet'
                : `You don't have any ${filter.replace('-', ' ')} courses`
              }
            </p>
            <Link to="/courses">
              <button className="btn btn-primary">Browse Courses</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;

