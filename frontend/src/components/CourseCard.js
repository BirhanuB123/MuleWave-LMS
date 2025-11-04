import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaUsers, FaClock } from 'react-icons/fa';
import '../styles/CourseCard.css';

const CourseCard = ({ course }) => {
  const currency = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }), []);
  return (
    <div className="course-card">
      <div className="course-image">
        <img 
          src={course.thumbnail || 'https://via.placeholder.com/400x200?text=Course+Image'} 
          alt={course.title}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Course+Image'; }}
        />
        <span className={`course-level ${course.level.toLowerCase()}`}>
          {course.level}
        </span>
      </div>

      <div className="course-content">
        <span className="course-category">{course.category}</span>
        <h3 className="course-title">
          <Link to={`/courses/${course._id}`}>{course.title}</Link>
        </h3>
        <p className="course-description">{course.shortDescription}</p>

        <div className="course-instructor">
          <img 
            src={course.instructor?.avatar || 'https://via.placeholder.com/40'} 
            alt={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
          />
          <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
        </div>

        <div className="course-meta">
          <div className="course-rating">
            <FaStar className="star-icon" />
            <span>{course.rating > 0 ? course.rating.toFixed(1) : 'New'}</span>
            <span className="review-count">({course.totalReviews})</span>
          </div>
          <div className="course-students">
            <FaUsers />
            <span>{course.enrollmentCount || 0}</span>
          </div>
          {course.duration && (
            <div className="course-duration">
              <FaClock />
              <span>{course.duration}</span>
            </div>
          )}
        </div>

        <div className="course-footer">
          <div className="course-price">
          {course.price === 0 ? (
            <span className="free-badge">FREE</span>
          ) : (
            <span className="price">{currency.format(course.price || 0)}</span>
          )}
          </div>
          <Link to={`/courses/${course._id}`}>
            <button className="btn btn-primary btn-sm">View Course</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

