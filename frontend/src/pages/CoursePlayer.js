import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaPlay, FaLock } from 'react-icons/fa';
import '../styles/CoursePlayer.css';

const CoursePlayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseAndEnrollment();
  }, [id]);

  const fetchCourseAndEnrollment = async () => {
    try {
      const [courseRes, enrollmentRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get('/enrollments')
      ]);

      const courseData = courseRes.data.data;
      const enrollmentData = enrollmentRes.data.data.find(e => e.course._id === id);

      if (!enrollmentData) {
        toast.error('You are not enrolled in this course');
        return;
      }

      setCourse(courseData);
      setEnrollment(enrollmentData);
      
      // Set first lecture as current
      if (courseData.lectures && courseData.lectures.length > 0) {
        setCurrentLecture(courseData.lectures[0]);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const isLectureCompleted = (lectureId) => {
    return enrollment?.completedLectures?.some(id => id.toString() === lectureId.toString());
  };

  const handleLectureComplete = async (lecture) => {
    if (isLectureCompleted(lecture._id)) return;

    const completedLectures = [...(enrollment.completedLectures || []), lecture._id];
    const progress = Math.round((completedLectures.length / course.lectures.length) * 100);

    try {
      await api.put(`/enrollments/${enrollment._id}/progress`, {
        completedLectures,
        progress
      });

      setEnrollment({
        ...enrollment,
        completedLectures,
        progress
      });

      toast.success('Lecture marked as complete!');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h2>Course not accessible</h2>
      </div>
    );
  }

  return (
    <div className="course-player">
      {/* Video Player Section */}
      <div className="player-section">
        <div className="video-container">
          {currentLecture?.videoUrl ? (
            <iframe
              src={currentLecture.videoUrl}
              title={currentLecture.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="no-video">
              <FaPlay size={64} />
              <p>No video available for this lecture</p>
            </div>
          )}
        </div>

        <div className="lecture-info">
          <h1>{currentLecture?.title}</h1>
          <p>{currentLecture?.description}</p>

          <div className="lecture-actions">
            <button 
              className={`btn ${isLectureCompleted(currentLecture?._id) ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => handleLectureComplete(currentLecture)}
              disabled={isLectureCompleted(currentLecture?._id)}
            >
              {isLectureCompleted(currentLecture?._id) ? (
                <><FaCheckCircle /> Completed</>
              ) : (
                <>Mark as Complete</>
              )}
            </button>
          </div>

          {currentLecture?.resources && currentLecture.resources.length > 0 && (
            <div className="lecture-resources">
              <h3>Resources</h3>
              <ul>
                {currentLecture.resources.map((resource, index) => (
                  <li key={index}>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Curriculum Sidebar */}
      <div className="curriculum-sidebar">
        <div className="course-progress-widget">
          <h3>Course Progress</h3>
          <div className="progress-circle">
            <div className="progress-text">{enrollment.progress}%</div>
          </div>
          <p>{enrollment.completedLectures?.length || 0} of {course.lectures.length} lectures completed</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${enrollment.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="lectures-list">
          <h3>Course Content</h3>
          {course.lectures.map((lecture, index) => (
            <div
              key={lecture._id}
              className={`lecture-item ${currentLecture?._id === lecture._id ? 'active' : ''}`}
              onClick={() => setCurrentLecture(lecture)}
            >
              <div className="lecture-number">{index + 1}</div>
              <div className="lecture-details">
                <h4>{lecture.title}</h4>
                {lecture.duration && <span className="lecture-duration">{lecture.duration}</span>}
              </div>
              {isLectureCompleted(lecture._id) ? (
                <FaCheckCircle className="complete-icon" />
              ) : (
                <FaLock className="lock-icon" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;

