const jwt = require('jsonwebtoken');
const Chat = require('./models/Chat');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const User = require('./models/User');

// Store online users per course
const onlineUsers = new Map(); // courseId -> Set of {userId, socketId, userName}

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
            
            // Fetch user details
            const user = await User.findById(decoded.id).select('firstName lastName email role');
            if (!user) {
                return next(new Error('User not found'));
            }
            
            socket.user = user;
            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.user.firstName} ${socket.user.lastName} (${socket.userId})`);

        // Join a course chat room
        socket.on('join_course', async (courseId) => {
            try {
                const course = await Course.findById(courseId).populate('instructor', 'firstName lastName');
                if (!course) {
                    socket.emit('error', { message: 'Course not found' });
                    return;
                }

                // Verify user is enrolled or is instructor
                const isInstructor = course.instructor._id.toString() === socket.userId.toString();
                if (!isInstructor) {
                    const enrollment = await Enrollment.findOne({
                        course: courseId,
                        student: socket.userId
                    });

                    if (!enrollment) {
                        socket.emit('error', { message: 'Not enrolled in this course' });
                        return;
                    }
                }

                // Join the room
                socket.join(`course_${courseId}`);
                socket.currentCourse = courseId;

                // Add user to online users
                if (!onlineUsers.has(courseId)) {
                    onlineUsers.set(courseId, new Set());
                }
                
                const courseUsers = onlineUsers.get(courseId);
                courseUsers.add(JSON.stringify({
                    userId: socket.userId,
                    socketId: socket.id,
                    userName: `${socket.user.firstName} ${socket.user.lastName}`,
                    role: socket.user.role,
                    isInstructor
                }));

                // Get online users count
                const onlineUsersArray = Array.from(courseUsers).map(u => JSON.parse(u));
                
                // Notify all users in the room about updated online users
                io.to(`course_${courseId}`).emit('online_users', onlineUsersArray);
                
                // Send confirmation to the joining user
                socket.emit('joined_course', { 
                    courseId,
                    message: `Joined ${course.title} chat`,
                    onlineUsers: onlineUsersArray
                });

                // Broadcast user joined message
                socket.to(`course_${courseId}`).emit('user_joined', {
                    userName: `${socket.user.firstName} ${socket.user.lastName}`,
                    timestamp: new Date()
                });

                console.log(`📚 User ${socket.user.firstName} joined course ${courseId}`);
            } catch (error) {
                console.error('Error joining course:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Handle new message
        socket.on('send_message', async ({ courseId, message }) => {
            try {
                if (!message || !message.trim()) {
                    socket.emit('error', { message: 'Message cannot be empty' });
                    return;
                }

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
                    message: message.trim(),
                    isInstructor
                });

                const populatedMessage = await Chat.findById(chatMessage._id)
                    .populate('sender', 'firstName lastName email role')
                    .lean();

                // Broadcast message to all users in the course room
                io.to(`course_${courseId}`).emit('new_message', populatedMessage);
                
                console.log(`💬 Message sent in course ${courseId} by ${socket.user.firstName}`);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Handle typing indicator
        socket.on('typing', ({ courseId, isTyping }) => {
            socket.to(`course_${courseId}`).emit('user_typing', {
                userId: socket.userId,
                userName: `${socket.user.firstName} ${socket.user.lastName}`,
                isTyping
            });
        });

        // Leave course chat room
        socket.on('leave_course', (courseId) => {
            handleUserLeaveCourse(socket, courseId, io);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.user.firstName} ${socket.user.lastName}`);
            
            // Remove from online users
            if (socket.currentCourse) {
                handleUserLeaveCourse(socket, socket.currentCourse, io);
            }
        });
    });

    // Helper function to handle user leaving course
    function handleUserLeaveCourse(socket, courseId, io) {
        if (onlineUsers.has(courseId)) {
            const courseUsers = onlineUsers.get(courseId);
            
            // Remove user from online users
            for (let userStr of courseUsers) {
                const user = JSON.parse(userStr);
                if (user.socketId === socket.id) {
                    courseUsers.delete(userStr);
                    break;
                }
            }

            // Update online users for remaining users
            const onlineUsersArray = Array.from(courseUsers).map(u => JSON.parse(u));
            io.to(`course_${courseId}`).emit('online_users', onlineUsersArray);

            // Broadcast user left message
            io.to(`course_${courseId}`).emit('user_left', {
                userName: `${socket.user.firstName} ${socket.user.lastName}`,
                timestamp: new Date()
            });

            // Clean up if no users left
            if (courseUsers.size === 0) {
                onlineUsers.delete(courseId);
            }
        }
        
        socket.leave(`course_${courseId}`);
        console.log(`🚪 User ${socket.user.firstName} left course ${courseId}`);
    }
};

module.exports = setupSocketIO;