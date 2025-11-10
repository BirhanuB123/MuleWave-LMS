# MuleWave LMS - Complete Directory Structure

```
MuleWave-LMS/
│
├── 📄 README.md                          # Main documentation
├── 📄 SETUP_GUIDE.md                     # Quick setup instructions
├── 📄 PROJECT_SUMMARY.md                 # Project completion summary
├── 📄 DIRECTORY_STRUCTURE.md             # This file
├── 📄 package.json                       # Root package.json with scripts
├── 📄 .gitignore                         # Git ignore rules
│
├── 📁 backend/                           # Backend Node.js/Express application
│   ├── 📁 config/
│   │   ├── 📄 db.js                      # MongoDB connection configuration
│   │   └── 📄 paypal.js                  # PayPal SDK configuration
│   │
│   ├── 📁 controllers/
│   │   ├── 📄 authController.js          # Authentication logic (register, login, profile)
│   │   ├── 📄 courseController.js        # Course CRUD operations
│   │   ├── 📄 enrollmentController.js    # Enrollment management
│   │   ├── 📄 paymentController.js       # PayPal payment processing
│   │   └── 📄 reviewController.js        # Course reviews and ratings
│   │
│   ├── 📁 middleware/
│   │   └── 📄 auth.js                    # JWT authentication & authorization middleware
│   │
│   ├── 📁 models/
│   │   ├── 📄 User.js                    # User schema (Student, Instructor, Admin)
│   │   ├── 📄 Course.js                  # Course schema with lectures
│   │   ├── 📄 Enrollment.js              # Enrollment schema with progress
│   │   ├── 📄 Payment.js                 # Payment transaction schema
│   │   └── 📄 Review.js                  # Course review schema
│   │
│   ├── 📁 routes/
│   │   ├── 📄 auth.js                    # Authentication routes
│   │   ├── 📄 courses.js                 # Course management routes
│   │   ├── 📄 enrollments.js             # Enrollment routes
│   │   ├── 📄 payments.js                # Payment processing routes
│   │   └── 📄 reviews.js                 # Review management routes
│   │
│   ├── 📄 server.js                      # Express server entry point
│   ├── 📄 package.json                   # Backend dependencies
│   ├── 📄 .env.example                   # Environment variables template
│   └── 📄 .gitignore                     # Backend gitignore
│
├── 📁 frontend/                          # Frontend React application
│   ├── 📁 public/
│   │   ├── 📄 index.html                 # HTML template
│   │   └── 📄 manifest.json              # PWA manifest
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📄 Navbar.js              # Navigation bar component
│   │   │   ├── 📄 Footer.js              # Footer component
│   │   │   ├── 📄 CourseCard.js          # Course card component
│   │   │   └── 📄 PrivateRoute.js        # Protected route wrapper
│   │   │
│   │   ├── 📁 context/
│   │   │   └── 📄 AuthContext.js         # Global authentication context
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── 📄 Home.js                # Landing page
│   │   │   ├── 📄 Login.js               # Login page
│   │   │   ├── 📄 Register.js            # Registration page
│   │   │   ├── 📄 Courses.js             # Course catalog with filters
│   │   │   ├── 📄 CourseDetail.js        # Single course details
│   │   │   ├── 📄 Dashboard.js           # Student dashboard
│   │   │   ├── 📄 MyCourses.js           # Enrolled courses list
│   │   │   ├── 📄 CoursePlayer.js        # Course video player
│   │   │   ├── 📄 AdminDashBoard.js      # Adminstration page
│   │   │   ├── 📄 InstructorDashboard.js # Instructor dashboard
│   │   │   ├── 📄 CreateCourse.js        # Create new course
│   │   │   ├── 📄 EditCourse.js          # Edit existing course
│   │   │   ├── 📄 PaymentSuccess.js      # Payment success page
│   │   │   └── 📄 PaymentCancel.js       # Payment cancel page
│   │   │
│   │   ├── 📁 styles/
│   │   │   ├── 📄 Navbar.css             # Navbar styles
│   │   │   ├── 📄 Footer.css             # Footer styles
│   │   │   ├── 📄 CourseCard.css         # Course card styles
│   │   │   ├── 📄 Home.css               # Home page styles
│   │   │   ├── 📄 Auth.css               # Login/Register styles
│   │   │   ├── 📄 Courses.css            # Courses page styles
│   │   │   ├── 📄 CourseDetail.css       # Course detail styles
│   │   │   ├── 📄 Dashboard.css          # Dashboard styles
│   │   │   ├── 📄 MyCourses.css          # My courses styles
│   │   │   ├── 📄 CoursePlayer.css       # Course player styles
│   │   │   ├── 📄 AdminDashBoard.css     # Adminstration dashboard styles
│   │   │   ├── 📄 InstructorDashboard.css # Instructor dashboard styles
│   │   │   ├── 📄 CourseForm.css         # Course form styles
│   │   │   └── 📄 Payment.css            # Payment pages styles
│   │   │
│   │   ├── 📁 utils/
│   │   │   └── 📄 api.js                 # Axios instance with interceptors
│   │   │
│   │   ├── 📄 App.js                     # Main app component with routes
│   │   ├── 📄 index.js                   # React entry point
│   │   └── 📄 index.css                  # Global styles
│   │
│   ├── 📄 package.json                   # Frontend dependencies
│   └── 📄 .gitignore                     # Frontend gitignore
│
└── 📁 node_modules/                      # Dependencies (not committed) <-- dependencies

```

## 📦 Key Directories Explained

### `/backend`
The server-side application built with Node.js and Express. Handles all API requests, database operations, and business logic.

### `/backend/config`
Configuration files for external services (MongoDB, PayPal).

### `/backend/controllers`
Business logic for handling requests. Each controller manages a specific domain (auth, courses, etc.).

### `/backend/middleware`
Custom middleware for authentication, authorization, and request processing.

### `/backend/models`
Mongoose schemas that define the structure of MongoDB documents.

### `/backend/routes`
Express route definitions that map URLs to controller functions.

### `/frontend`
The client-side React application that users interact with.

### `/frontend/src/components`
Reusable React components used across multiple pages.

### `/frontend/src/context`
React Context providers for global state management.

### `/frontend/src/pages`
Full page components that represent different routes in the application.

### `/frontend/src/styles`
CSS modules for styling components and pages.

### `/frontend/src/utils`
Utility functions and helpers (like the Axios API instance).

## 🚀 How to Navigate the Project

### Starting Point for Development:
1. **Backend:** Start with `backend/server.js`
2. **Frontend:** Start with `frontend/src/App.js`
3. **API Routes:** Check `backend/routes/` for available endpoints
4. **Pages:** Check `frontend/src/pages/` for all views
5. **Database Models:** Check `backend/models/` for data structure

### Common Development Tasks:

**Adding a New Feature:**
1. Create model in `/backend/models`
2. Create controller in `/backend/controllers`
3. Create routes in `/backend/routes`
4. Create frontend page in `/frontend/src/pages`
5. Add routing in `App.js`

**Modifying Styles:**
1. Find component in `/frontend/src/components` or `/frontend/src/pages`
2. Locate corresponding CSS in `/frontend/src/styles`
3. Edit styles using CSS variables defined in `index.css`

**Adding API Endpoints:**
1. Add function in appropriate controller
2. Add route definition in corresponding route file
3. Update API calls in frontend components

## 💾 Database Collections

When the application runs, MongoDB automatically creates these collections:

```
mulewave-lms (database)
├── users           # User accounts
├── courses         # Course information
├── enrollments     # Student enrollments
├── payments        # Payment records
└── reviews         # Course reviews
```

## 🔐 Environment Variables Required

```
Backend (.env):
├── PORT                 # Server port (5000)
├── NODE_ENV             # Environment (development/production)
├── MONGODB_URI          # MongoDB connection string
├── JWT_SECRET           # Secret for JWT tokens
├── PAYPAL_MODE          # PayPal mode (sandbox/live)
├── PAYPAL_CLIENT_ID     # PayPal client ID
├── PAYPAL_CLIENT_SECRET # PayPal secret
└── FRONTEND_URL         # Frontend URL for CORS
```

## 📝 Notes

- All styling uses CSS custom properties (CSS variables) for easy theming
- The project follows a modular architecture for easy maintenance
- Each component/page has its own dedicated CSS file
- API routes follow RESTful conventions
- All routes are properly organized by resource type

---

**This structure represents a complete, production-ready Learning Management System!** 🎉

