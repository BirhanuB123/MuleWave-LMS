import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUsers, FaBook, FaDollarSign, FaChartBar } from 'react-icons/fa';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Admin Panel</h1>
            <p>Welcome back, {user?.firstName}. Manage the platform from here.</p>
          </div>
          <Link to="/courses">
            <button className="btn btn-primary">View Courses</button>
          </Link>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>Users</h3>
              <p>Manage users and roles</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <FaBook />
            </div>
            <div className="stat-content">
              <h3>Courses</h3>
              <p>Review and moderate courses</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <h3>Payments</h3>
              <p>View transactions and payouts</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <FaChartBar />
            </div>
            <div className="stat-content">
              <h3>Analytics</h3>
              <p>Site metrics and reports</p>
            </div>
          </div>
        </div>

        <section className="dashboard-section">
          <h2>Admin Actions</h2>
            <div className="quick-actions">
              <Link to="/admin/users" className="action-card">
                <FaUsers size={32} />
                <h3>Manage Users</h3>
                <p>Promote, deactivate, or reset passwords</p>
              </Link>

              <Link to="/admin/courses" className="action-card">
                <FaBook size={32} />
                <h3>Manage Courses</h3>
                <p>Approve, edit, or remove courses</p>
              </Link>
            </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
