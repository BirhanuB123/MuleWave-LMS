import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AccessibilityMenu from './components/AccessibilityMenu';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import ModernDashboard from './pages/ModernDashboard';
import MyCourses from './pages/MyCourses';
import CoursePlayer from './pages/CoursePlayer';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCourses from './pages/AdminCourses';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import QuizPage from './pages/QuizPage';
import AuthCallback from './pages/AuthCallback';
import CalendarPage from './pages/CalendarPage';
import TodoPage from './pages/TodoPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<PrivateRoute><ModernDashboard /></PrivateRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
              <Route path="/todos" element={<PrivateRoute><TodoPage /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
              <Route path="/my-courses" element={<PrivateRoute><MyCourses /></PrivateRoute>} />
              <Route path="/course-player/:id" element={<PrivateRoute><CoursePlayer /></PrivateRoute>} />
              
              {/* Instructor Routes */}
              <Route path="/instructor/dashboard" element={<PrivateRoute roles={['instructor', 'admin']}><InstructorDashboard /></PrivateRoute>} />
              <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
              <Route path="/admin/courses" element={<PrivateRoute roles={['admin']}><AdminCourses /></PrivateRoute>} />
              <Route path="/instructor/create-course" element={<PrivateRoute roles={['instructor', 'admin']}><CreateCourse /></PrivateRoute>} />
              <Route path="/instructor/edit-course/:id" element={<PrivateRoute roles={['instructor', 'admin']}><EditCourse /></PrivateRoute>} />
              
              {/* Payment Routes */}
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              
              {/* Quiz Routes */}
              <Route path="/quiz/:quizId" element={<PrivateRoute><QuizPage /></PrivateRoute>} />
            </Routes>
          </main>
          <Footer />
          <AccessibilityMenu />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

