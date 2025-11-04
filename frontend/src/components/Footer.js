import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaBook } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer shine-effect">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand shine-effect">
              <FaBook className="footer-brand-icon" />
              <h3>MuleWave LMS</h3>
            </div>
            <p className="footer-tagline">Empowering learners worldwide with quality education and innovative learning experiences.</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="shine-link">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="shine-link">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="shine-link">
                <FaLinkedin />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="shine-link">
                <FaInstagram />
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/courses" className="shine-link">Browse Courses</Link></li>
              <li><Link to="/register" className="shine-link">Become a Student</Link></li>
              <li><Link to="/register" className="shine-link">Teach on MuleWave</Link></li>
              <li><Link to="/" className="shine-link">About Us</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/courses?category=Technology" className="shine-link">Technology</Link></li>
              <li><Link to="/courses?category=Business" className="shine-link">Business</Link></li>
              <li><Link to="/courses?category=Design" className="shine-link">Design</Link></li>
              <li><Link to="/courses?category=Marketing" className="shine-link">Marketing</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/" className="shine-link">Help Center</Link></li>
              <li><Link to="/" className="shine-link">Terms of Service</Link></li>
              <li><Link to="/" className="shine-link">Privacy Policy</Link></li>
              <li><Link to="/" className="shine-link">Contact Us</Link></li>
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

