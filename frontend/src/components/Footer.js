import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaBook } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <FaBook className="footer-brand-icon" />
              <h3>MuleWave LMS</h3>
            </div>
            <p>Empowering learners worldwide with quality education and innovative learning experiences.</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/courses">Browse Courses</Link></li>
              <li><Link to="/register">Become a Student</Link></li>
              <li><Link to="/register">Teach on MuleWave</Link></li>
              <li><Link to="/">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/courses?category=Technology">Technology</Link></li>
              <li><Link to="/courses?category=Business">Business</Link></li>
              <li><Link to="/courses?category=Design">Design</Link></li>
              <li><Link to="/courses?category=Marketing">Marketing</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/">Help Center</Link></li>
              <li><Link to="/">Terms of Service</Link></li>
              <li><Link to="/">Privacy Policy</Link></li>
              <li><Link to="/">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MuleWave LMS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

