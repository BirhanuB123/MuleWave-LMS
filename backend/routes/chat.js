const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCourseMessages, sendMessage } = require('../controllers/chatController');

// Get chat messages for a course
router.get('/:courseId/messages', protect, getCourseMessages);

// Send a new message (REST API backup)
router.post('/:courseId/messages', protect, sendMessage);

module.exports = router;