import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaClock, FaQuestionCircle } from 'react-icons/fa';
import '../styles/Quiz.css';

const QuizManagement = ({ courseId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    durationMinutes: 0,
    questions: [
      {
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        points: 1
      }
    ]
  });

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quizzes/course/${courseId}`);
      setQuizzes(response.data.data);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuizForm({
      title: '',
      description: '',
      durationMinutes: 0,
      questions: [
        {
          text: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          points: 1
        }
      ]
    });
    setEditingQuiz(null);
  };

  const handleQuizFormChange = (field, value) => {
    setQuizForm({ ...quizForm, [field]: value });
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[questionIndex][field] = value;
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        {
          text: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          points: 1
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    if (quizForm.questions.length <= 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    const updatedQuestions = quizForm.questions.filter((_, i) => i !== index);
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[questionIndex].options.push('');
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizForm.questions];
    if (updatedQuestions[questionIndex].options.length <= 2) {
      toast.error('Question must have at least 2 options');
      return;
    }
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    // Adjust correctIndex if needed
    if (updatedQuestions[questionIndex].correctIndex >= updatedQuestions[questionIndex].options.length) {
      updatedQuestions[questionIndex].correctIndex = updatedQuestions[questionIndex].options.length - 1;
    }
    setQuizForm({ ...quizForm, questions: updatedQuestions });
  };

  const validateQuizForm = () => {
    if (!quizForm.title.trim()) {
      toast.error('Quiz title is required');
      return false;
    }

    if (quizForm.questions.length === 0) {
      toast.error('Quiz must have at least one question');
      return false;
    }

    for (let i = 0; i < quizForm.questions.length; i++) {
      const q = quizForm.questions[i];
      if (!q.text.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }
      const filledOptions = q.options.filter(opt => opt.trim() !== '');
      if (filledOptions.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 options`);
        return false;
      }
    }

    return true;
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    
    if (!validateQuizForm()) return;

    try {
      // Clean up questions
      const cleanedQuestions = quizForm.questions.map(q => ({
        text: q.text,
        options: q.options.filter(opt => opt.trim() !== ''),
        correctIndex: q.correctIndex,
        points: parseInt(q.points) || 1
      }));

      const payload = {
        title: quizForm.title,
        description: quizForm.description,
        durationMinutes: parseInt(quizForm.durationMinutes) || 0,
        questions: cleanedQuestions
      };

      if (editingQuiz) {
        await api.put(`/quizzes/${editingQuiz._id}`, payload);
        toast.success('Quiz updated successfully');
      } else {
        await api.post(`/quizzes/course/${courseId}`, payload);
        toast.success('Quiz created successfully');
      }

      fetchQuizzes();
      setShowCreator(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save quiz');
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || '',
      durationMinutes: quiz.durationMinutes || 0,
      questions: quiz.questions.map(q => ({
        text: q.text,
        options: [...q.options],
        correctIndex: q.correctIndex,
        points: q.points || 1
      }))
    });
    setShowCreator(true);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/quizzes/${quizId}`);
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete quiz');
    }
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="quiz-spinner"></div>
        <p>Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="quiz-management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>
          <FaQuestionCircle /> Quiz Management
        </h3>
        <button
          className="add-question-btn"
          onClick={() => {
            setShowCreator(!showCreator);
            if (showCreator) resetForm();
          }}
        >
          <FaPlus /> {showCreator ? 'Cancel' : 'Create New Quiz'}
        </button>
      </div>

      {showCreator && (
        <div className="quiz-creator">
          <h4>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h4>
          <form onSubmit={handleCreateQuiz}>
            <div className="quiz-form-group">
              <label>Quiz Title *</label>
              <input
                type="text"
                value={quizForm.title}
                onChange={(e) => handleQuizFormChange('title', e.target.value)}
                placeholder="e.g., Module 1 Assessment"
                required
              />
            </div>

            <div className="quiz-form-group">
              <label>Description</label>
              <textarea
                value={quizForm.description}
                onChange={(e) => handleQuizFormChange('description', e.target.value)}
                placeholder="Brief description of this quiz..."
              />
            </div>

            <div className="quiz-form-group">
              <label>Time Limit (minutes) - 0 for no limit</label>
              <input
                type="number"
                min="0"
                value={quizForm.durationMinutes}
                onChange={(e) => handleQuizFormChange('durationMinutes', e.target.value)}
              />
            </div>

            <div className="quiz-form-group">
              <label style={{ marginBottom: '15px', display: 'block' }}>Questions *</label>
              {quizForm.questions.map((question, qIndex) => (
                <div key={qIndex} className="question-editor">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5>Question {qIndex + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      style={{
                        background: '#f56565',
                        color: 'white',
                        border: 'none',
                        padding: '5px 15px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>

                  <div className="quiz-form-group">
                    <label>Question Text *</label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                      placeholder="Enter your question..."
                      required
                    />
                  </div>

                  <div className="quiz-form-group">
                    <label>Points</label>
                    <input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => handleQuestionChange(qIndex, 'points', e.target.value)}
                    />
                  </div>

                  <div className="quiz-form-group">
                    <label>Answer Options *</label>
                    <div className="option-inputs">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="option-input">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctIndex === oIndex}
                            onChange={() => handleQuestionChange(qIndex, 'correctIndex', oIndex)}
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            required={oIndex < 2}
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="add-option-btn"
                      onClick={() => addOption(qIndex)}
                    >
                      <FaPlus /> Add Option
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="add-question-btn"
                onClick={addQuestion}
                style={{ marginTop: '15px' }}
              >
                <FaPlus /> Add Question
              </button>
            </div>

            <div className="quiz-actions">
              <button type="submit" className="btn primary">
                {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setShowCreator(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="quiz-list">
        {quizzes.length === 0 ? (
          <div className="quiz-empty">
            <FaQuestionCircle />
            <h4>No Quizzes Yet</h4>
            <p>Create your first quiz to assess student learning</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-item">
              <div className="quiz-item-info">
                <h4>{quiz.title}</h4>
                <div className="quiz-item-meta">
                  <span><FaQuestionCircle /> {quiz.questions?.length || 0} questions</span>
                  {quiz.durationMinutes > 0 && (
                    <span><FaClock /> {quiz.durationMinutes} minutes</span>
                  )}
                </div>
              </div>
              <div className="quiz-item-actions">
                <button
                  className="view"
                  onClick={() => window.open(`/quiz/${quiz._id}`, '_blank')}
                  title="Preview quiz"
                >
                  <FaEye /> Preview
                </button>
                <button
                  className="edit"
                  onClick={() => handleEditQuiz(quiz)}
                  title="Edit quiz"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="delete"
                  onClick={() => handleDeleteQuiz(quiz._id)}
                  title="Delete quiz"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizManagement;

