import React, { useState, useEffect, useMemo } from 'react';
import { FaUsers, FaGraduationCap, FaMoneyBillWave, FaStar, FaEye, FaCheck, FaTrash, FaBan } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Formatting helpers
  const currency = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    []
  );

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data || {
        totalUsers: 0,
        totalCourses: 0,
        totalRevenue: 0,
        averageRating: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, usersRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/users')
      ]);
      setCourses(coursesRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      setLoading(true);
      await api.put(`/admin/courses/${id}/publish`);
      toast.success('Course published successfully');
      await fetchData();
      await fetchStats(); // Refresh stats after publishing
      setShowConfirmModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Failed to publish course';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      if (!id) {
        toast.error('Invalid user ID');
        return;
      }

      setLoading(true);
      
      // First verify if the user exists
      const userResponse = await api.get(`/admin/users/${id}`).catch(e => null);
      if (!userResponse || !userResponse.data) {
        toast.error('User not found');
        setShowConfirmModal(false);
        setSelectedItem(null);
        return;
      }

      // Proceed with deletion
      const deleteResponse = await api.delete(`/admin/users/${id}`);
      
      if (deleteResponse.data.success) {
        toast.success(deleteResponse.data.message || 'User deleted successfully');
        await Promise.all([fetchData(), fetchStats()]); // Refresh data and stats
      } else {
        throw new Error(deleteResponse.data.message || 'Failed to delete user');
      }

      setShowConfirmModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Delete user error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete user';
      toast.error(errorMsg);
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        // Handle special cases like trying to delete last admin
        setShowConfirmModal(false);
      } else if (err.response?.status === 404) {
        // Handle user not found
        toast.error('User not found or already deleted');
        await fetchData(); // Refresh the list
        setShowConfirmModal(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/admin/courses/${id}`);
      toast.success('Course deleted successfully');
      await fetchData();
      await fetchStats(); // Refresh stats after deletion
      setShowConfirmModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Failed to delete course';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      await api.put(`/admin/users/${id}/status`, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      await fetchData();
      await fetchStats(); // Refresh stats after status change
      setShowConfirmModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Failed to update user status';
      toast.error(errorMsg);
      if (err.response?.status === 400) {
        // Handle special cases like trying to deactivate last admin
        setShowConfirmModal(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (item, action) => {
    setSelectedItem(item);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const filteredItems = useMemo(() => {
    const items = activeTab === 'courses' ? courses : users;
    return items.filter((item) => {
      const name = item.title || `${item.firstName} ${item.lastName}`;
      const matchesSearch = name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (activeTab === 'courses'
          ? statusFilter === 'approved'
            ? item.isPublished
            : !item.isPublished
          : (item.status || 'active') === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, courses, users, searchTerm, statusFilter]);

  if (loading)
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-subtitle" />
            </div>
          </div>

          <div className="stats-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat-card skeleton-card">
                <div className="skeleton-circle" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              </div>
            ))}
          </div>

          <div className="content-section">
            <div className="skeleton-table">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-row" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  const renderStats = () => (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--primary)' }}>
          <FaUsers />
        </div>
        <div className="stat-content">
          <h3>{stats.totalUsers || users.length}</h3>
          <p>Total Users</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--success)' }}>
          <FaGraduationCap />
        </div>
        <div className="stat-content">
          <h3>{stats.totalCourses || courses.length}</h3>
          <p>Total Courses</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--warning)' }}>
          <FaMoneyBillWave />
        </div>
        <div className="stat-content">
          <h3>{currency.format(stats.totalRevenue || 0)}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--info)' }}>
          <FaStar />
        </div>
        <div className="stat-content">
          <h3>{(stats.averageRating || 0).toFixed(1)}</h3>
          <p>Average Rating</p>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="content-section">
      <div className="section-header">
        <h2>Course Management</h2>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search courses..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search courses"
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Instructor</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((course) => (
              <tr key={course._id}>
                <td>
                  <div className="item-info">
                    <img src={course.thumbnail || '/course-placeholder.jpg'} alt={course.title} />
                    <div className="details">
                      <h4>{course.title}</h4>
                      <span>{course.category}</span>
                    </div>
                  </div>
                </td>
                <td>{course.instructor?.firstName} {course.instructor?.lastName}</td>
                <td>
                  <span className={`status-badge ${course.isPublished ? 'approved' : 'pending'}`}>
                    {course.isPublished ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td>{currency.format(course.price || 0)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-view"
                      onClick={() => navigate(`/courses/${course._id}`)}
                      title="View Course"
                      aria-label="View Course"
                    >
                      <FaEye />
                    </button>
                    {!course.isPublished && (
                      <button
                        className="btn-icon btn-approve"
                        onClick={() => confirmAction(course, 'publish')}
                        title="Approve Course"
                        aria-label="Approve Course"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => confirmAction(course, 'deleteCourse')}
                      title="Delete Course"
                      aria-label="Delete Course"
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
    </div>
  );

  const renderUsers = () => (
    <div className="content-section">
      <div className="section-header">
        <h2>User Management</h2>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search users..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search users"
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="item-info">
                    <img src={user.avatar || '/default-avatar.png'} alt={`${user.firstName} ${user.lastName}`} />
                    <div className="details">
                      <h4>{user.firstName} {user.lastName}</h4>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>{user.role}</td>
                <td>
                  <span className={`status-badge ${user.status || 'active'}`}>
                    {user.status || 'active'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-view"
                      onClick={() => navigate(`/users/${user._id}`)}
                      title="View User"
                      aria-label="View User"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-icon btn-approve"
                      onClick={() => confirmAction(user, user.status === 'active' ? 'deactivate' : 'activate')}
                      title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                      aria-label={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                    >
                      {user.status === 'active' ? <FaBan /> : <FaCheck />}
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => confirmAction(user, 'deleteUser')}
                      title="Delete User"
                      aria-label="Delete User"
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
    </div>
  );

  const renderConfirmModal = () => (
    showConfirmModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>
              {actionType === 'deleteUser'
                ? 'Confirm Delete User'
                : actionType === 'deleteCourse'
                ? 'Confirm Delete Course'
                : actionType === 'publish'
                ? 'Confirm Course Approval'
                : actionType === 'activate'
                ? 'Confirm User Activation'
                : 'Confirm User Deactivation'}
            </h3>
            <p>
              {actionType === 'deleteUser'
                ? 'Are you sure you want to delete this user? This action cannot be undone.'
                : actionType === 'deleteCourse'
                ? 'Are you sure you want to delete this course? This action cannot be undone.'
                : actionType === 'publish'
                ? 'Are you sure you want to approve and publish this course?'
                : `Are you sure you want to ${actionType} this user?`}
            </p>
          </div>
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (actionType === 'deleteUser') {
                  handleDeleteUser(selectedItem._id);
                } else if (actionType === 'deleteCourse') {
                  handleDeleteCourse(selectedItem._id);
                } else if (actionType === 'publish') {
                  handlePublish(selectedItem._id);
                } else if (actionType === 'activate' || actionType === 'deactivate') {
                  handleUserStatus(selectedItem._id, actionType === 'activate' ? 'active' : 'inactive');
                }
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage courses, users, and monitor platform statistics</p>
          </div>
        </div>

        {renderStats()}

        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('courses');
              setSearchTerm('');
              setStatusFilter('all');
            }}
          >
            <FaGraduationCap style={{ marginRight: 8 }} /> Courses
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('users');
              setSearchTerm('');
              setStatusFilter('all');
            }}
          >
            <FaUsers style={{ marginRight: 8 }} /> Users
          </button>
        </div>

        {activeTab === 'courses' ? renderCourses() : renderUsers()}
        {renderConfirmModal()}
      </div>
    </div>
  );
};

export default AdminDashboard;
