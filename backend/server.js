const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const http = require('http');
const setupSocketIO = require('./socketServer');

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

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Route files
const auth = require('./routes/auth');
const courses = require('./routes/courses');
const enrollments = require('./routes/enrollments');
const payments = require('./routes/payments');
const reviews = require('./routes/reviews');
const admin = require('./routes/admin');
const chat = require('./routes/chat');
const quiz = require('./routes/quiz');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/courses', courses);
app.use('/api/enrollments', enrollments);
app.use('/api/payments', payments);
app.use('/api/reviews', reviews);
app.use('/api/admin', admin);
app.use('/api/chat', chat);
app.use('/api/quizzes', quiz);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MuleWave-LMS API is running'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`👉 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log('WebSocket server is ready');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

