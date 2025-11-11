const Chat = require('../models/Chat');
const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');

// Get chat messages for a specific course
exports.getCourseMessages = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Chat.find({ courseId })
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('sender', 'name email')
        .lean();

    res.json({
        success: true,
        data: messages.reverse() 
    });
});

// Send a new message (REST API backup for WebSocket)
exports.sendMessage = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { message } = req.body;
    const sender = req.user._id;

    // Verify course exists and user has access
    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if user is enrolled or is the instructor
    const isInstructor = course.instructor.toString() === sender.toString();
    if (!isInstructor) {
        const enrollment = await Enrollment.findOne({
            course: courseId,
            user: sender,
            status: 'active'
        });
        
        if (!enrollment) {
            res.status(403);
            throw new Error('You must be enrolled in this course to send messages');
        }
    }

    const chatMessage = await Chat.create({
        courseId,
        sender,
        message,
        isInstructor
    });

    const populatedMessage = await Chat.findById(chatMessage._id)
        .populate('sender', 'name email')
        .lean();

    res.status(201).json({
        success: true,
        data: populatedMessage
    });
});