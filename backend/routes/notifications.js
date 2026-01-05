const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  cleanupOldNotifications
} = require('../controllers/notificationController');

// Notification routes
router.get('/', protect, getUserNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/cleanup', protect, authorize('admin'), cleanupOldNotifications);

module.exports = router;
