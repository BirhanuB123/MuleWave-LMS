import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { FaBook, FaCertificate, FaChartLine, FaUserCircle, FaUsers } from 'react-icons/fa';
import RatingModal from '../components/RatingModal';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

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

  const downloadCertificate = async (enrollmentId) => {
    try {
      const response = await api.get(`/enrollments/${enrollmentId}/certificate`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${enrollmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to download certificate');
    }
  };

  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
  const averageProgress = enrollments.length > 0
    ? (enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length).toFixed(1)
    : 0;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.firstName}!</h1>
            <p>Track your learning progress and continue your journey</p>
          </div>
          <Link to="/courses">
            <button className="btn btn-primary">Browse Courses</button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <FaBook />
            </div>
            <div className="stat-content">
              <h3>{enrollments.length}</h3>
              <p>Enrolled Courses</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <FaCertificate />
            </div>
            <div className="stat-content">
              <h3>{completedCourses}</h3>
              <p>Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3>{inProgressCourses}</h3>
              <p>In Progress</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <FaUserCircle />
            </div>
            <div className="stat-content">
              <h3>{averageProgress}%</h3>
              <p>Avg. Progress</p>
            </div>
          </div>
        </div>

        {/* Continue Learning */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Continue Learning</h2>
            <Link to="/my-courses">View All</Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="courses-list">
              {enrollments.slice(0, 3).map(enrollment => (
                <div key={enrollment._id} className="course-progress-card">
                  <div className="course-thumbnail">
                    <img 
                      src={enrollment.course.thumbnail || 'https://via.placeholder.com/300x150?text=Course'} 
                      alt={enrollment.course.title}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300x150?text=Course'; }}
                    />
                  </div>
                  <div className="course-progress-content">
                    <h3>{enrollment.course.title}</h3>
                    <p>{enrollment.course.instructor?.firstName} {enrollment.course.instructor?.lastName}</p>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-info">
                      <span>{enrollment.progress}% Complete</span>
                            <Link to={`/course-player/${enrollment.course._id}`}>
                              <button className="btn btn-sm btn-primary">Continue</button>
                            </Link>
                            {enrollment.progress === 100 && (
                                <>
                                  <button className="btn btn-sm btn-outline" onClick={() => downloadCertificate(enrollment._id)} style={{marginLeft: '8px'}}>
                                    Download Certificate
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => { setSelectedCourseId(enrollment.course._id); setRatingModalOpen(true); }}
                                    style={{ marginLeft: '8px' }}
                                  >
                                    Rate
                                  </button>
                                </>
                            )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaBook size={64} />
              <h3>No courses yet</h3>
              <p>Start your learning journey by enrolling in a course</p>
              <Link to="/courses">
                <button className="btn btn-primary">Explore Courses</button>
              </Link>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        {user?.role === 'instructor' && (
          <section className="dashboard-section">
            <h2>Instructor Actions</h2>
            <div className="quick-actions">
              <Link to="/instructor/dashboard" className="action-card">
                <FaChartLine size={32} />
                <h3>Instructor Dashboard</h3>
                <p>Manage your courses and students</p>
              </Link>
              <Link to="/instructor/create-course" className="action-card">
                <FaBook size={32} />
                <h3>Create New Course</h3>
                <p>Share your knowledge with students</p>
              </Link>
            </div>
          </section>
        )}

        {user?.role === 'admin' && (
          <section className="dashboard-section">
            <h2>Admin Actions</h2>
            <div className="quick-actions">
              <Link to="/admin/dashboard" className="action-card">
                <FaUsers size={32} />
                <h3>Admin Panel</h3>
                <p>Manage users, courses and payments</p>
              </Link>
            </div>
          </section>
        )}
        <RatingModal
          open={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          courseId={selectedCourseId}
          onSuccess={() => {
            // optional: refresh enrollments or other state
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;

