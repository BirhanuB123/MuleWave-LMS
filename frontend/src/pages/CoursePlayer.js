import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaPlay, FaLock, FaComments, FaQuestionCircle, FaClock, FaTrophy } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import '../styles/CoursePlayer.css';

const CoursePlayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchCourseAndEnrollment();
    fetchQuizzes();
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

  const fetchQuizzes = async () => {
    try {
      const response = await api.get(`/quizzes/course/${id}`);
      const quizzesData = response.data.data;
      setQuizzes(quizzesData);

      // Fetch results for each quiz
      const results = {};
      await Promise.all(
        quizzesData.map(async (quiz) => {
          try {
            const resultRes = await api.get(`/quizzes/${quiz._id}/result`);
            results[quiz._id] = resultRes.data.data;
          } catch (err) {
            // No result yet for this quiz
            results[quiz._id] = null;
          }
        })
      );
      setQuizResults(results);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
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

      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle-button ${isConnected ? 'connected' : 'disconnected'}`}
        onClick={() => setShowChat(!showChat)}
        title={showChat ? "Hide Chat" : `Show Chat ${isConnected ? '(Connected)' : '(Disconnected)'}`}
      >
        <FaComments />
        {!isConnected && <span className="connection-indicator offline"></span>}
        {isConnected && <span className="connection-indicator online"></span>}
      </button>

      {/* Chat Window */}
      {showChat && (
        <div className="chat-container">
          {socket && isConnected ? (
            <ChatWindow
              courseId={id}
              socket={socket}
              currentUser={user}
            />
          ) : (
            <div className="chat-disconnected">
              <p>Connecting to chat server...</p>
              <div className="spinner-small"></div>
            </div>
          )}
        </div>
      )}

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

        {/* Quizzes Section */}
        {quizzes.length > 0 && (
          <div className="quizzes-list">
            <h3><FaQuestionCircle /> Quizzes & Assessments</h3>
            {quizzes.map((quiz) => {
              const result = quizResults[quiz._id];
              return (
                <Link
                  key={quiz._id}
                  to={`/quiz/${quiz._id}`}
                  className="quiz-link-item"
                >
                  <div className="quiz-link-info">
                    <h4>{quiz.title}</h4>
                    <div className="quiz-meta-small">
                      <span><FaQuestionCircle /> {quiz.questions?.length || 0} questions</span>
                      {quiz.durationMinutes > 0 && (
                        <span><FaClock /> {quiz.durationMinutes} min</span>
                      )}
                    </div>
                  </div>
                  {result ? (
                    <div className={`quiz-status ${result.passed ? 'passed' : 'failed'}`}>
                      <FaTrophy />
                      <span>{result.score}/{result.maxScore}</span>
                    </div>
                  ) : (
                    <div className="quiz-status pending">
                      <span>Start</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;

