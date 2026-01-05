import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaClock, FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaTrophy, FaChartLine } from 'react-icons/fa';
import '../styles/Quiz.css';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [detailedResults, setDetailedResults] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/quizzes/${quizId}`);
      const quizData = res.data.data;
      setQuiz(quizData);

      // Check if user already has a result
      try {
        const resultRes = await api.get(`/quizzes/${quizId}/result`);
        setResult(resultRes.data.data);
        setShowResults(true);
        loadDetailedResults(resultRes.data.data);
      } catch (err) {
        // No result yet, start timer if applicable
        if (quizData.durationMinutes > 0) {
          setTimeLeft(quizData.durationMinutes * 60);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load quiz');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedResults = (resultData) => {
    if (!quiz) return;

    const detailed = quiz.questions.map((question, index) => {
      const userAnswer = resultData.answers.find(a => a.questionId.toString() === question._id.toString());
      const selectedIndex = userAnswer ? userAnswer.selectedIndex : -1;
      const isCorrect = selectedIndex === question.correctIndex;

      return {
        question: question.text,
        options: question.options,
        selectedIndex,
        correctIndex: question.correctIndex,
        isCorrect,
        points: question.points
      };
    });

    setDetailedResults(detailed);
  };

  const handleAutoSubmit = async () => {
    toast.warning('Time is up! Submitting your answers...');
    await handleSubmit(null, true);
  };

  const handleSelect = (questionId, index) => {
    setAnswers(prev => ({ ...prev, [questionId]: index }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e, isAutoSubmit = false) => {
    if (e) e.preventDefault();
    
    if (!isAutoSubmit) {
      const answeredCount = Object.keys(answers).length;
      const totalQuestions = quiz.questions.length;

      if (answeredCount < totalQuestions) {
        const confirmSubmit = window.confirm(
          `You have answered ${answeredCount} out of ${totalQuestions} questions. Do you want to submit anyway?`
        );
        if (!confirmSubmit) return;
      }
    }

    setSubmitting(true);

    const payload = {
      answers: quiz.questions.map(q => ({
        questionId: q._id,
        selectedIndex: answers[q._id] ?? -1
      }))
    };

    try {
      const res = await api.post(`/quizzes/${quizId}/submit`, payload);
      const resultData = res.data.data;
      setResult(resultData);
      setShowResults(true);
      loadDetailedResults(resultData);
      toast.success('Quiz submitted successfully!');
      
      // Fetch the full result to get the answers
      const fullResult = await api.get(`/quizzes/${quizId}/result`);
      setResult(fullResult.data.data);
      loadDetailedResults(fullResult.data.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(key => answers[key] !== undefined).length;
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="quiz-spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-page container">
        <div className="quiz-empty">
          <FaQuestionCircle />
          <h4>Quiz not found</h4>
          <Link to="/" className="btn primary">Go Home</Link>
        </div>
      </div>
    );
  }

  // Show results view
  if (showResults && result) {
    const percentage = (result.score / result.maxScore) * 100;
    const correctCount = detailedResults?.filter(r => r.isCorrect).length || 0;

    return (
      <div className="quiz-page container">
        <div className="quiz-result">
          <div className={`result-icon ${result.passed ? 'pass' : 'fail'}`}>
            {result.passed ? <FaTrophy /> : <FaTimesCircle />}
          </div>
          
          <h3>{result.passed ? 'Congratulations! 🎉' : 'Keep Learning!'}</h3>
          
          <div className="score-display">
            {result.score} / {result.maxScore}
          </div>
          
          <div className="result-message">
            {result.passed 
              ? 'You passed this assessment!' 
              : 'You can retake this quiz to improve your score.'}
          </div>

          <div className="result-stats">
            <div className="stat-item">
              <div className="stat-value">{percentage.toFixed(0)}%</div>
              <div className="stat-label">Score</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{correctCount}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{quiz.questions.length - correctCount}</div>
              <div className="stat-label">Incorrect</div>
            </div>
          </div>

          {/* Detailed Results */}
          {detailedResults && (
            <div className="detailed-results">
              <h4><FaChartLine /> Detailed Results</h4>
              {detailedResults.map((item, index) => (
                <div key={index} className={`result-question ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="result-question-header">
                    <h5>Question {index + 1}: {item.question}</h5>
                    <span className={`result-badge ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                      {item.isCorrect ? <><FaCheckCircle /> Correct</> : <><FaTimesCircle /> Incorrect</>}
                    </span>
                  </div>
                  
                  <div className="answer-comparison">
                    {item.selectedIndex !== -1 && (
                      <div className="answer-item your-answer">
                        Your answer: {item.options[item.selectedIndex]}
                      </div>
                    )}
                    {!item.isCorrect && (
                      <div className="answer-item correct-answer">
                        Correct answer: {item.options[item.correctIndex]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="quiz-actions">
            <Link to={`/course-player/${quiz.courseId}`} className="btn primary">
              Back to Course
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setShowResults(false);
                setAnswers({});
                setDetailedResults(null);
                if (quiz.durationMinutes > 0) {
                  setTimeLeft(quiz.durationMinutes * 60);
                }
              }}
              className="btn secondary"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz taking view
  return (
    <div className="quiz-page container">
      <div className="quiz-header">
        <h2>{quiz.title}</h2>
        {quiz.description && <p>{quiz.description}</p>}
        
        <div className="quiz-meta">
          <div className="quiz-meta-item">
            <FaQuestionCircle />
            <span>{quiz.questions.length} Questions</span>
          </div>
          {quiz.durationMinutes > 0 && timeLeft !== null && (
            <div className="quiz-meta-item">
              <FaClock />
              <span>Time Limit: {quiz.durationMinutes} minutes</span>
            </div>
          )}
        </div>

        {timeLeft !== null && quiz.durationMinutes > 0 && (
          <div className={`quiz-timer ${timeLeft < 60 ? 'warning' : ''}`}>
            <FaClock />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress">
        <div 
          className="quiz-progress-bar" 
          style={{ width: `${(getAnsweredCount() / quiz.questions.length) * 100}%` }}
        ></div>
      </div>
      <div className="progress-text">
        {getAnsweredCount()} of {quiz.questions.length} questions answered
      </div>

      <form onSubmit={handleSubmit} className="quiz-form">
        {quiz.questions.map((q, idx) => (
          <div key={q._id} className="quiz-question">
            <h4>
              {idx + 1}. {q.text}
              <span className="question-points">{q.points} {q.points === 1 ? 'point' : 'points'}</span>
            </h4>
            <div className="options">
              {q.options.map((opt, i) => (
                <label 
                  key={i} 
                  className={`option ${answers[q._id] === i ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`q_${q._id}`}
                    checked={answers[q._id] === i}
                    onChange={() => handleSelect(q._id, i)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="quiz-actions">
          <button 
            type="submit" 
            className="btn primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
          <Link 
            to={`/course-player/${quiz.courseId}`} 
            className="btn secondary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default QuizPage;
