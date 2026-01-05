const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserCalendar,
  createEvent,
  updateEvent,
  deleteEvent,
  completeEvent,
  getUpcomingEvents
} = require('../controllers/calendarController');

// Calendar routes
router.get('/', protect, getUserCalendar);
router.post('/', protect, createEvent);
router.get('/upcoming', protect, getUpcomingEvents);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.put('/:id/complete', protect, completeEvent);

module.exports = router;
