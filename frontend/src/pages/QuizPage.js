import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Quiz.css';

const QuizPage = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${quizId}`);
        setQuiz(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleSelect = (questionId, index) => {
    setAnswers(prev => ({ ...prev, [questionId]: index }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quiz) return;

    const payload = {
      answers: quiz.questions.map(q => ({ questionId: q._id, selectedIndex: answers[q._id] ?? -1 }))
    };

    try {
      const res = await api.post(`/quizzes/${quizId}/submit`, payload);
      setResult(res.data.data);
    } catch (err) {
      console.error(err);
      alert('Failed to submit quiz');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="quiz-page container">
      <h2>{quiz.title}</h2>
      <p>{quiz.description}</p>
      {result ? (
        <div className="quiz-result">
          <h3>Result</h3>
          <p>Score: {result.score} / {result.maxScore}</p>
          <p>{result.passed ? 'Passed 🎉' : 'Not passed'}</p>
          <Link to={`/courses/${quiz.courseId}`}>Back to Course</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="quiz-form">
          {quiz.questions.map((q, idx) => (
            <div key={q._id} className="quiz-question">
              <h4>{idx + 1}. {q.text}</h4>
              <div className="options">
                {q.options.map((opt, i) => (
                  <label key={i} className={`option ${answers[q._id] === i ? 'selected' : ''}`}>
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
            <button type="submit" className="btn primary">Submit Quiz</button>
            <Link to={`/courses/${quiz.courseId}`} className="btn">Cancel</Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default QuizPage;
