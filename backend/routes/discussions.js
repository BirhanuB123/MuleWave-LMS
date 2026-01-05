const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createDiscussion,
  getCourseDiscussions,
  getDiscussion,
  addReply,
  updateDiscussion,
  deleteDiscussion,
  toggleLike,
  acceptReply
} = require('../controllers/discussionController');

// Discussion routes
router.post('/course/:courseId', protect, createDiscussion);
router.get('/course/:courseId', protect, getCourseDiscussions);
router.get('/:id', protect, getDiscussion);
router.put('/:id', protect, updateDiscussion);
router.delete('/:id', protect, deleteDiscussion);

// Reply routes
router.post('/:id/reply', protect, addReply);
router.put('/:id/reply/:replyId/accept', protect, acceptReply);

// Like routes
router.post('/:id/like', protect, toggleLike);

module.exports = router;
