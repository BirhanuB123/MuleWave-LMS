const jwt = require('jsonwebtoken');
const Chat = require('./models/Chat');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const setupSocketIO = (io) => {
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);

        // Join a course chat room
        socket.on('join_course', async (courseId) => {
            try {
                const course = await Course.findById(courseId);
                if (!course) {
                    socket.emit('error', { message: 'Course not found' });
                    return;
                }

                // Verify user is enrolled or is instructor
                const isInstructor = course.instructor.toString() === socket.userId.toString();
                if (!isInstructor) {
                    const enrollment = await Enrollment.findOne({
                        course: courseId,
                        user: socket.userId,
                        status: 'active'
                    });

                    if (!enrollment) {
                        socket.emit('error', { message: 'Not enrolled in this course' });
                        return;
                    }
                }

                socket.join(`course_${courseId}`);
                socket.emit('joined_course', { courseId });
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Handle new message
        socket.on('send_message', async ({ courseId, message }) => {
            try {
                const course = await Course.findById(courseId);
                if (!course) {
                    socket.emit('error', { message: 'Course not found' });
                    return;
                }

                const isInstructor = course.instructor.toString() === socket.userId.toString();

                // Save message to database
                const chatMessage = await Chat.create({
                    courseId,
                    sender: socket.userId,
                    message,
                    isInstructor
                });

                const populatedMessage = await Chat.findById(chatMessage._id)
                    .populate('sender', 'name email')
                    .lean();

                // Broadcast message to all users in the course room
                io.to(`course_${courseId}`).emit('new_message', populatedMessage);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Leave course chat room
        socket.on('leave_course', (courseId) => {
            socket.leave(`course_${courseId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });
};

module.exports = setupSocketIO;