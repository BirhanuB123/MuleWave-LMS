import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaChalkboardTeacher, FaGlobe, FaCertificate, FaArrowRight } from 'react-icons/fa';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import '../styles/Home.css';

const Home = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await api.get('/courses?sort=popular');
      setFeaturedCourses(response.data.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Learn Without Limits
            </h1>
            <p className="hero-subtitle">
              Discover thousands of courses from expert instructors. Enhance your skills, advance your career, and achieve your goals with MuleWave LMS.
            </p>
            <div className="hero-actions">
              <Link to="/courses">
                <button className="btn btn-primary btn-lg">
                  Explore Courses <FaArrowRight />
                </button>
              </Link>
              <Link to="/register">
                <button className="btn btn-outline btn-lg">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose MuleWave?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaGraduationCap />
              </div>
              <h3>Expert Instructors</h3>
              <p>Learn from industry professionals with years of real-world experience.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaGlobe />
              </div>
              <h3>Learn Anywhere</h3>
              <p>Access courses anytime, anywhere on any device with internet connection.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaChalkboardTeacher />
              </div>
              <h3>Interactive Learning</h3>
              <p>Engage with interactive content, quizzes, and hands-on projects.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaCertificate />
              </div>
              <h3>Earn Certificates</h3>
              <p>Receive certificates upon completion to showcase your achievements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="featured-courses">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Courses</h2>
            <Link to="/courses" className="view-all-link">
              View All <FaArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="courses-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-tile" />
              ))}
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="courses-grid">
              {featuredCourses.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="no-courses">
              <p>No courses available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Learning?</h2>
            <p>Join thousands of students already learning on MuleWave LMS</p>
            <Link to="/register">
              <button className="btn btn-primary btn-lg">
                Sign Up Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Students Enrolled</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Expert Instructors</p>
            </div>
            <div className="stat-item">
              <h3>1,000+</h3>
              <p>Quality Courses</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Countries Reached</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

