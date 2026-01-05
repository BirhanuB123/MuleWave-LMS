const Discussion = require('../models/Discussion');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Create a new discussion
// @route   POST /api/discussions/course/:courseId
// @access  Private
exports.createDiscussion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, category } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled or is the instructor
    const isInstructor = course.instructor.toString() === req.user.id;
    const isEnrolled = await Enrollment.findOne({ 
      course: courseId, 
      student: req.user.id 
    });

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'You must be enrolled in this course to create discussions' });
    }

    const discussion = await Discussion.create({
      course: courseId,
      author: req.user.id,
      title,
      content,
      category: category || 'general'
    });

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      discussion: populatedDiscussion
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all discussions for a course
// @route   GET /api/discussions/course/:courseId
// @access  Private
exports.getCourseDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { category, resolved } = req.query;

    const query = { course: courseId };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (resolved !== undefined) {
      query.isResolved = resolved === 'true';
    }

    const discussions = await Discussion.find(query)
      .populate('author', 'firstName lastName email role')
      .populate('replies.author', 'firstName lastName email role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      count: discussions.length,
      discussions
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single discussion
// @route   GET /api/discussions/:id
// @access  Private
exports.getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'firstName lastName email role')
      .populate('replies.author', 'firstName lastName email role');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Increment views
    discussion.views += 1;
    await discussion.save();

    res.json({
      success: true,
      discussion
    });
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add reply to discussion
// @route   POST /api/discussions/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is instructor
    const course = await Course.findById(discussion.course);
    const isInstructor = course.instructor.toString() === req.user.id;

    const reply = {
      author: req.user.id,
      content,
      isInstructorReply: isInstructor,
      createdAt: Date.now()
    };

    discussion.replies.push(reply);
    await discussion.save();

    const updatedDiscussion = await Discussion.findById(req.params.id)
      .populate('author', 'firstName lastName email role')
      .populate('replies.author', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      discussion: updatedDiscussion
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update discussion
// @route   PUT /api/discussions/:id
// @access  Private
exports.updateDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the author or instructor
    const course = await Course.findById(discussion.course);
    const isAuthor = discussion.author.toString() === req.user.id;
    const isInstructor = course.instructor.toString() === req.user.id;

    if (!isAuthor && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this discussion' });
    }

    const { title, content, category, isResolved, isPinned } = req.body;

    if (title) discussion.title = title;
    if (content) discussion.content = content;
    if (category) discussion.category = category;
    if (isResolved !== undefined) discussion.isResolved = isResolved;
    if (isPinned !== undefined && (isInstructor || req.user.role === 'admin')) {
      discussion.isPinned = isPinned;
    }

    await discussion.save();

    const updatedDiscussion = await Discussion.findById(req.params.id)
      .populate('author', 'firstName lastName email role')
      .populate('replies.author', 'firstName lastName email role');

    res.json({
      success: true,
      discussion: updatedDiscussion
    });
  } catch (error) {
    console.error('Update discussion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete discussion
// @route   DELETE /api/discussions/:id
// @access  Private
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the author or instructor
    const course = await Course.findById(discussion.course);
    const isAuthor = discussion.author.toString() === req.user.id;
    const isInstructor = course.instructor.toString() === req.user.id;

    if (!isAuthor && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this discussion' });
    }

    await Discussion.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Like/Unlike discussion
// @route   POST /api/discussions/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const likeIndex = discussion.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike
      discussion.likes.splice(likeIndex, 1);
    } else {
      // Like
      discussion.likes.push(req.user.id);
    }

    await discussion.save();

    res.json({
      success: true,
      likesCount: discussion.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark reply as accepted answer
// @route   PUT /api/discussions/:id/reply/:replyId/accept
// @access  Private (Instructor/Author)
exports.acceptReply = async (req, res) => {
  try {
    const { id, replyId } = req.params;
    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is the author or instructor
    const course = await Course.findById(discussion.course);
    const isAuthor = discussion.author.toString() === req.user.id;
    const isInstructor = course.instructor.toString() === req.user.id;

    if (!isAuthor && !isInstructor) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const reply = discussion.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Remove accepted status from all other replies
    discussion.replies.forEach(r => {
      r.isAccepted = false;
    });

    // Mark this reply as accepted
    reply.isAccepted = true;
    discussion.isResolved = true;

    await discussion.save();

    const updatedDiscussion = await Discussion.findById(id)
      .populate('author', 'firstName lastName email role')
      .populate('replies.author', 'firstName lastName email role');

    res.json({
      success: true,
      discussion: updatedDiscussion
    });
  } catch (error) {
    console.error('Accept reply error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
