import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaStar, FaUsers, FaClock, FaGlobe, FaCheckCircle, FaPlayCircle } from 'react-icons/fa';
import '../styles/CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    fetchReviews();
    checkEnrollment();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/${id}`);
      setReviews(response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkEnrollment = async () => {
    if (!user) return;
    try {
      const response = await api.get('/enrollments');
      const enrolled = response.data.data.some(enrollment => enrollment.course._id === id);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (course.price === 0) {
      // Free course - direct enrollment
      setEnrolling(true);
      try {
        await api.post(`/enrollments/${id}`);
        toast.success('Successfully enrolled in course!');
        setIsEnrolled(true);
        navigate('/my-courses');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Enrollment failed');
      } finally {
        setEnrolling(false);
      }
    } else {
      // Paid course - redirect to payment
      setEnrolling(true);
      try {
        const response = await api.post('/payments/create', { courseId: id });
        window.location.href = response.data.data.approvalUrl;
      } catch (error) {
        toast.error('Payment initialization failed');
        setEnrolling(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h2>Course not found</h2>
        <Link to="/courses">
          <button className="btn btn-primary">Browse Courses</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      {/* Hero Section */}
      <div className="course-hero">
        <div className="container">
          <div className="course-hero-content">
            <div className="course-info">
              <span className="course-category">{course.category}</span>
              <h1>{course.title}</h1>
              <p className="course-short-desc">{course.shortDescription}</p>
              
              <div className="course-meta">
                <div className="meta-item">
                  <FaStar className="star-icon" />
                  <span>{course.rating > 0 ? course.rating.toFixed(1) : 'New'}</span>
                  <span className="meta-secondary">({course.totalReviews} reviews)</span>
                </div>
                <div className="meta-item">
                  <FaUsers />
                  <span>{course.enrollmentCount} students</span>
                </div>
                {course.duration && (
                  <div className="meta-item">
                    <FaClock />
                    <span>{course.duration}</span>
                  </div>
                )}
                <div className="meta-item">
                  <FaGlobe />
                  <span>{course.language}</span>
                </div>
              </div>

              <div className="course-instructor-info">
                <img 
                  src={course.instructor?.avatar || 'https://via.placeholder.com/50'} 
                  alt={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                />
                <div>
                  <p className="instructor-label">Created by</p>
                  <p className="instructor-name">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                </div>
              </div>
            </div>

            <div className="course-card-sticky">
              <div className="course-thumbnail">
                <img 
                  src={course.thumbnail || 'https://via.placeholder.com/400x225?text=Course+Preview'} 
                  alt={course.title}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x225?text=Course+Preview'; }}
                />
                <div className="play-overlay">
                  <FaPlayCircle />
                </div>
              </div>
              
              <div className="price-section">
                {course.price === 0 ? (
                  <h2 className="price free">FREE</h2>
                ) : (
                  <h2 className="price">${course.price}</h2>
                )}
              </div>

              {isEnrolled ? (
                <Link to={`/course-player/${course._id}`}>
                  <button className="btn btn-primary btn-block">
                    Go to Course
                  </button>
                </Link>
              ) : (
                <button 
                  className="btn btn-primary btn-block" 
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Processing...' : course.price === 0 ? 'Enroll Now' : 'Buy Now'}
                </button>
              )}

              <p className="enrollment-note">
                {course.price === 0 ? 'Free enrollment' : '30-day money-back guarantee'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container course-content">
        {/* What you'll learn */}
        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
          <section className="content-section">
            <h2>What you'll learn</h2>
            <div className="learning-outcomes">
              {course.learningOutcomes.map((outcome, index) => (
                <div key={index} className="outcome-item">
                  <FaCheckCircle />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Course Description */}
        <section className="content-section">
          <h2>Description</h2>
          <p className="course-description">{course.description}</p>
        </section>

        {/* Requirements */}
        {course.requirements && course.requirements.length > 0 && (
          <section className="content-section">
            <h2>Requirements</h2>
            <ul className="requirements-list">
              {course.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Course Curriculum */}
        {course.lectures && course.lectures.length > 0 && (
          <section className="content-section">
            <h2>Course Curriculum</h2>
            <p className="curriculum-info">{course.lectures.length} lectures</p>
            <div className="curriculum-list">
              {course.lectures.map((lecture, index) => (
                <div key={lecture._id || index} className="lecture-item">
                  <div className="lecture-number">{index + 1}</div>
                  <div className="lecture-info">
                    <h4>{lecture.title}</h4>
                    {lecture.description && <p>{lecture.description}</p>}
                  </div>
                  {lecture.duration && (
                    <div className="lecture-duration">
                      <FaClock /> {lecture.duration}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Instructor */}
        <section className="content-section instructor-section">
          <h2>About the Instructor</h2>
          <div className="instructor-card">
            <img 
              src={course.instructor?.avatar || 'https://via.placeholder.com/100'} 
              alt={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
            />
            <div className="instructor-details">
              <h3>{course.instructor?.firstName} {course.instructor?.lastName}</h3>
              <p>{course.instructor?.bio || 'Experienced instructor passionate about teaching.'}</p>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="content-section">
          <h2>Student Reviews</h2>
          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.slice(0, 5).map(review => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <img 
                      src={review.user?.avatar || 'https://via.placeholder.com/40'} 
                      alt={`${review.user?.firstName} ${review.user?.lastName}`}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                    />
                    <div>
                      <h4>{review.user?.firstName} {review.user?.lastName}</h4>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < review.rating ? 'star-filled' : 'star-empty'} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review this course!</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default CourseDetail;

