# MuleWave LMS - Learning Management System

A comprehensive, modern Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring PayPal payment integration.

## 🌟 Features

### For Students
- **Browse Courses**: Explore a vast catalog of courses across multiple categories
- **Advanced Filtering**: Search and filter courses by category, level, rating, and price
- **Secure Enrollment**: Enroll in free courses or purchase paid courses via PayPal
- **Course Player**: Access course content with video lectures and resources
- **Progress Tracking**: Monitor your learning progress and earn certificates
- **Reviews & Ratings**: Leave reviews and ratings for completed courses
- **Personal Dashboard**: View all enrolled courses and learning statistics

### For Instructors
- **Course Creation**: Create and manage courses with comprehensive content
- **Rich Course Editor**: Add lectures, videos, resources, and learning outcomes
- **Analytics Dashboard**: Track student enrollment and course performance
- **Revenue Management**: Receive payments through integrated PayPal system
- **Course Publishing**: Control when courses go live

### For Admins
- **User Management**: Manage students, instructors, and course content
- **Role-based Access**: Secure access control for different user types
- **System Overview**: Monitor platform statistics and performance

## 🚀 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **PayPal REST SDK** - Payment processing

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **React Icons** - Icon library

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **PayPal Developer Account** (for payment integration)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/BirhanuB123/mulewave-lms.git
cd mulewave-lms
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/mulewave-lms

# JWT Secret (Change this to a secure random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# PayPal Configuration
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### Setting up PayPal

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Sign in with your PayPal account
3. Navigate to **Dashboard** → **My Apps & Credentials**
4. Create a new app in **Sandbox** mode
5. Copy the **Client ID** and **Secret** to your `.env` file

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

No additional configuration needed for frontend (it proxies to backend).

### 4. Database Setup

MongoDB should be running on your system. If using default local installation:

```bash
# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB service (Mac/Linux)
sudo systemctl start mongod
```

The application will automatically create the database and collections on first run.

## 🎯 Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

#### Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Start Backend

```bash
cd backend
npm start
```

## 📁 Project Structure

```
MuleWave-LMS/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Database connection
│   │   └── paypal.js             # PayPal configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── courseController.js   # Course management
│   │   ├── enrollmentController.js
│   │   ├── paymentController.js  # PayPal integration
│   │   └── reviewController.js
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   ├── Payment.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── enrollments.js
│   │   ├── payments.js
│   │   └── reviews.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── CourseCard.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Courses.js
│   │   │   ├── CourseDetail.js
│   │   │   ├── Dashboard.js
│   │   │   ├── MyCourses.js
│   │   │   ├── CoursePlayer.js
│   │   │   ├── InstructorDashboard.js
│   │   │   ├── CreateCourse.js
│   │   │   ├── EditCourse.js
│   │   │   ├── PaymentSuccess.js
│   │   │   └── PaymentCancel.js
│   │   ├── styles/
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## 🔐 Default User Roles

The system supports three user roles:

1. **Student** - Can browse and enroll in courses
2. **Instructor** - Can create and manage courses
3. **Admin** - Full system access

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updateprofile` - Update user profile

### Courses
- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Instructor/Admin)
- `PUT /api/courses/:id` - Update course (Instructor/Admin)
- `DELETE /api/courses/:id` - Delete course (Instructor/Admin)
- `GET /api/courses/instructor/mycourses` - Get instructor's courses

### Enrollments
- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments/:courseId` - Enroll in course
- `GET /api/enrollments/:id` - Get single enrollment
- `PUT /api/enrollments/:id/progress` - Update progress

### Payments
- `POST /api/payments/create` - Create PayPal payment
- `POST /api/payments/execute` - Execute PayPal payment
- `GET /api/payments` - Get user payments

### Reviews
- `GET /api/reviews/:courseId` - Get course reviews
- `POST /api/reviews/:courseId` - Add review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## 🎨 Key Features Implementation

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected routes

### Payment Integration
- PayPal sandbox for testing
- Secure payment processing
- Payment history tracking
- Free course enrollment

### Course Management
- Rich course creation interface
- Video lecture support
- Progress tracking
- Certificate generation upon completion

### User Experience
- Responsive design for all devices
- Modern, intuitive UI
- Real-time notifications
- Smooth animations and transitions

## 🔧 Configuration Options

### Database
MongoDB connection string can be modified in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/mulewave-lms
```

For MongoDB Atlas (cloud):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mulewave-lms
```

### JWT Token Expiration
Modify in `backend/controllers/authController.js`:
```javascript
expiresIn: '30d' // Change as needed
```

### CORS Configuration
Modify in `backend/server.js`:
```javascript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
})
```

## 🚨 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list             # Mac

# Restart MongoDB
sudo systemctl restart mongod  # Linux
brew services restart mongodb-community  # Mac
```

### Port Already in Use
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows
```

### PayPal Sandbox Issues
- Ensure you're using sandbox credentials
- Check PayPal Developer Dashboard for test accounts
- Verify `PAYPAL_MODE=sandbox` in `.env`

## 📝 Testing

### Test User Accounts
Create test accounts through the registration page or:

```javascript
// Student account
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "student@example.com",
  "password": "password123",
  "role": "student"
}

// Instructor account
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "instructor@example.com",
  "password": "password123",
  "role": "instructor"
}
```

### PayPal Sandbox Testing
Use PayPal-generated sandbox test accounts from your Developer Dashboard.

## 🌐 Deployment

### Backend Deployment (Heroku Example)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create mulewave-lms-api

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set PAYPAL_CLIENT_ID=your_client_id
# ... set all required env variables

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Update `FRONTEND_URL` in backend `.env`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by platforms like [Anthology/Blackboard](https://www.anthology.com/)
- Built with modern web technologies
- Designed for scalability and user experience

## 📧 Support

For support, email support@mulewave.com or open an issue in the repository.

## 🔮 Future Enhancements

- [ ] Real-time chat between students and instructors
- [ ] Video conferencing integration
- [ ] Quiz and assessment system
- [ ] Certificate customization
- [ ] Mobile app (React Native)
- [ ] AI-powered course recommendations
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Discussion forums
- [ ] Live streaming classes

---

**Made with ❤️ by the MuleWave Team**

