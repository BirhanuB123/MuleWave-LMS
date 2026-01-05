import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaBook, FaChalkboardTeacher, FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <FaBook className="brand-icon" />
          <span>MuleWave LMS</span>
        </Link>

        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="navbar-links">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/courses" onClick={() => setMobileMenuOpen(false)}>Courses</Link>

            {user && (
              <>
                <Link to="/my-courses" onClick={() => setMobileMenuOpen(false)}>My Learning</Link>
                {user.role === 'instructor' && (
                  <Link to="/instructor/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <FaChalkboardTeacher style={{ marginRight: '5px' }} />
                    Instructor
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <FaChalkboardTeacher style={{ marginRight: '5px' }} />
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="navbar-actions">
            <button
              className="theme-toggle btn btn-outline btn-sm"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
              <span style={{ marginLeft: '0.25rem' }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            {user ? (
              <div className="user-menu">
                <Link to="/dashboard" className="user-profile" onClick={() => setMobileMenuOpen(false)}>
                  <FaUserCircle size={24} />
                  <span>{user.firstName}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="btn btn-outline btn-sm">Login</button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button className="btn btn-primary btn-sm">Sign Up</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

