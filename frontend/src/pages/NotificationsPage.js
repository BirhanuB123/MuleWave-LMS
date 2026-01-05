import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredNotifications(notifications);
    } else if (filterType === 'unread') {
      setFilteredNotifications(notifications.filter(n => !n.isRead));
    } else if (filterType === 'read') {
      setFilteredNotifications(notifications.filter(n => n.isRead));
    } else {
      setFilteredNotifications(notifications.filter(n => n.type === filterType));
    }
  }, [filterType, notifications]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
      setFilteredNotifications(res.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    return <FaBell />;
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="notifications-page loading">
        <div className="spinner-large"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-left">
          <FaBell className="header-icon" />
          <div>
            <h1>Notifications</h1>
            <p className="subtitle">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            <FaCheck /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="notifications-filters">
        <button
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filterType === 'unread' ? 'active' : ''}`}
          onClick={() => setFilterType('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-btn ${filterType === 'read' ? 'active' : ''}`}
          onClick={() => setFilterType('read')}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-content">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <FaBell />
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div
                  className="notification-icon"
                  style={{ backgroundColor: notification.color || '#6366f1' }}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header-row">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-time">{formatTimeAgo(notification.createdAt)}</span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  {notification.link && (
                    <Link to={notification.link} className="notification-link">
                      View Details →
                    </Link>
                  )}
                  <div className="notification-meta">
                    <span className="notification-type">{notification.type.replace(/_/g, ' ')}</span>
                    {notification.priority !== 'normal' && (
                      <span className={`notification-priority ${notification.priority}`}>
                        {notification.priority}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="delete-notification-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  title="Delete notification"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
