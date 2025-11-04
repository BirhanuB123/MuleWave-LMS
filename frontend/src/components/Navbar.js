import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaBook, FaChalkboardTeacher, FaBars, FaTimes } from 'react-icons/fa';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand shine-effect" onClick={() => setMobileMenuOpen(false)}>
          <FaBook className="brand-icon" />
          <span>MuleWave LMS</span>
        </Link>
        <span className="navbar-tagline">Empowering Education with Technology</span>
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}> 
          <div className="navbar-links">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="shine-link">Home</Link>
            <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="shine-link">Courses</Link>
            {user && (
              <>
                <Link to="/my-courses" onClick={() => setMobileMenuOpen(false)} className="shine-link">My Learning</Link>
                {user.role === 'instructor' && (
                  <Link to="/instructor/dashboard" onClick={() => setMobileMenuOpen(false)} className="shine-link">
                    <FaChalkboardTeacher style={{ marginRight: '5px' }} />
                    Instructor
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="shine-link">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="navbar-actions">
            {user ? (
              <div className="user-menu">
                <Link to="/dashboard" className="user-profile shine-link" onClick={() => setMobileMenuOpen(false)}>
                  <FaUserCircle size={24} />
                  <span>{user.firstName}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-outline btn-sm shine-link">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="btn btn-outline btn-sm shine-link">Login</button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button className="btn btn-primary btn-sm shine-link">Sign Up</button>
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

