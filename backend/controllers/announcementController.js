const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Create a new announcement
// @route   POST /api/announcements/course/:courseId
// @access  Private (Instructor/Admin)
exports.createAnnouncement = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, priority, isPinned, sendEmail, attachments } = req.body;

    // Check if course exists and user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create announcements for this course' });
    }

    const announcement = await Announcement.create({
      course: courseId,
      instructor: req.user.id,
      title,
      content,
      priority: priority || 'medium',
      isPinned: isPinned || false,
      sendEmail: sendEmail || false,
      attachments: attachments || [],
      publishedAt: Date.now()
    });

    // TODO: If sendEmail is true, send email notifications to all enrolled students
    // This will be implemented when email service is added

    res.status(201).json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all announcements for a course
// @route   GET /api/announcements/course/:courseId
// @access  Private
exports.getCourseAnnouncements = async (req, res) => {
  try {
    const { courseId } = req.params;

    const announcements = await Announcement.find({ 
      course: courseId,
      isPublished: true 
    })
    .populate('instructor', 'firstName lastName email')
    .sort({ isPinned: -1, createdAt: -1 });

    // Mark announcements as read for this user
    const unreadAnnouncements = announcements.filter(
      announcement => !announcement.readBy.some(
        read => read.user.toString() === req.user.id
      )
    );

    // Add this user to readBy for unread announcements
    for (const announcement of unreadAnnouncements) {
      announcement.readBy.push({
        user: req.user.id,
        readAt: Date.now()
      });
      await announcement.save();
    }

    res.json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('instructor', 'firstName lastName email');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Mark as read for this user
    const alreadyRead = announcement.readBy.some(
      read => read.user.toString() === req.user.id
    );

    if (!alreadyRead) {
      announcement.readBy.push({
        user: req.user.id,
        readAt: Date.now()
      });
      await announcement.save();
    }

    res.json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Instructor/Admin)
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check authorization
    if (announcement.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      announcement: updatedAnnouncement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Instructor/Admin)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check authorization
    if (announcement.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get unread announcements count
// @route   GET /api/announcements/course/:courseId/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const { courseId } = req.params;

    const announcements = await Announcement.find({ 
      course: courseId,
      isPublished: true 
    });

    const unreadCount = announcements.filter(
      announcement => !announcement.readBy.some(
        read => read.user.toString() === req.user.id
      )
    ).length;

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark announcement as read
// @route   POST /api/announcements/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const alreadyRead = announcement.readBy.some(
      read => read.user.toString() === req.user.id
    );

    if (!alreadyRead) {
      announcement.readBy.push({
        user: req.user.id,
        readAt: Date.now()
      });
      await announcement.save();
    }

    res.json({
      success: true,
      message: 'Announcement marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
