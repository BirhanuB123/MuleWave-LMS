const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createAnnouncement,
  getCourseAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getUnreadCount,
  markAsRead
} = require('../controllers/announcementController');

// Announcement routes
router.post('/course/:courseId', protect, authorize('instructor', 'admin'), createAnnouncement);
router.get('/course/:courseId', protect, getCourseAnnouncements);
router.get('/course/:courseId/unread-count', protect, getUnreadCount);
router.get('/:id', protect, getAnnouncement);
router.put('/:id', protect, authorize('instructor', 'admin'), updateAnnouncement);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteAnnouncement);
router.post('/:id/read', protect, markAsRead);

module.exports = router;
