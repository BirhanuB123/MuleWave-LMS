const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectDB = require('./config/db');
const http = require('http');
const setupSocketIO = require('./socketServer');
const morgan = require('morgan');
const logger = require('./config/logger');
const path = require('path');
const passport = require('./config/passport');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }
});

// Set up Socket.IO
setupSocketIO(io);

// Import security middleware
const { 
  limiter, 
  authLimiter, 
  paymentLimiter,
  securityHeaders, 
  sanitizeData, 
  preventPollution,
  customSecurity 
} = require('./middleware/security');

// Security middleware
app.use(securityHeaders);
app.use(sanitizeData);
app.use(preventPollution);
app.use(customSecurity);

// Apply general rate limiting to all routes
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Session configuration (for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Create a stream for Morgan to write to Winston
  const stream = {
    write: (message) => logger.info(message.trim())
  };
  app.use(morgan('combined', { stream }));
}

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const auth = require('./routes/auth');
const courses = require('./routes/courses');
const enrollments = require('./routes/enrollments');
const payments = require('./routes/payments');
const reviews = require('./routes/reviews');
const admin = require('./routes/admin');
const chat = require('./routes/chat');
const quiz = require('./routes/quiz');
const assignments = require('./routes/assignments');
const discussions = require('./routes/discussions');
const announcements = require('./routes/announcements');
const gradebook = require('./routes/gradebook');
const calendar = require('./routes/calendar');
const modules = require('./routes/modules');
const todos = require('./routes/todos');
const notifications = require('./routes/notifications');
const syllabus = require('./routes/syllabus');
const rubrics = require('./routes/rubrics');
const analytics = require('./routes/analytics');

// Mount routers with specific rate limiters
app.use('/api/auth', authLimiter, auth);
app.use('/api/payments', paymentLimiter, payments);
app.use('/api/courses', courses);
app.use('/api/enrollments', enrollments);
app.use('/api/reviews', reviews);
app.use('/api/admin', admin);
app.use('/api/chat', chat);
app.use('/api/quizzes', quiz);
app.use('/api/assignments', assignments);
app.use('/api/discussions', discussions);
app.use('/api/announcements', announcements);
app.use('/api/gradebook', gradebook);
app.use('/api/calendar', calendar);
app.use('/api/modules', modules);
app.use('/api/todos', todos);
app.use('/api/notifications', notifications);
app.use('/api/syllabus', syllabus);
app.use('/api/rubrics', rubrics);
app.use('/api/analytics', analytics);

// Health check route (with detailed info)
app.get('/api/health', (req, res) => {
  const healthCheck = {
    success: true,
    message: 'MuleWave-LMS API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };
  res.status(200).json(healthCheck);
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`👉 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log('WebSocket server is ready');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
