import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import QuizManagement from '../components/QuizManagement';
import '../styles/CourseForm.css';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Health', 'Language', 'Science', 'Arts', 'Other'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      const course = response.data.data;
      
      setFormData({
        title: course.title || '',
        shortDescription: course.shortDescription || '',
        description: course.description || '',
        category: course.category || 'Technology',
        level: course.level || 'Beginner',
        price: course.price || 0,
        duration: course.duration || '',
        language: course.language || 'English',
        thumbnail: course.thumbnail || '',
        requirements: course.requirements?.length > 0 ? course.requirements : [''],
        learningOutcomes: course.learningOutcomes?.length > 0 ? course.learningOutcomes : [''],
        lectures: course.lectures?.length > 0 ? course.lectures : [{ title: '', description: '', videoUrl: '', duration: '' }],
        isPublished: course.isPublished || false
      });
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/instructor/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleLectureChange = (index, field, value) => {
    const newLectures = [...formData.lectures];
    newLectures[index][field] = value;
    setFormData({ ...formData, lectures: newLectures });
  };

  const addLecture = () => {
    setFormData({
      ...formData,
      lectures: [...formData.lectures, { title: '', description: '', videoUrl: '', duration: '' }]
    });
  };

  const removeLecture = (index) => {
    const newLectures = formData.lectures.filter((_, i) => i !== index);
    setFormData({ ...formData, lectures: newLectures });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        learningOutcomes: formData.learningOutcomes.filter(l => l.trim() !== ''),
        lectures: formData.lectures.filter(l => l.title.trim() !== '').map((l, idx) => ({
          ...l,
          order: idx
        }))
      };

      await api.put(`/courses/${id}`, cleanedData);
      toast.success('Course updated successfully!');
      navigate('/instructor/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="course-form-page">
      <div className="container">
        <div className="form-header">
          <h1>Edit Course</h1>
          <p>Update your course information</p>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          {/* Basic Information - Same structure as CreateCourse */}
          <section className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label>Course Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Short Description *</label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                maxLength="200"
                required
              />
            </div>

            <div className="form-group">
              <label>Full Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Level *</label>
                <select name="level" value={formData.level} onChange={handleChange} required>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (USD) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 10 hours"
                />
              </div>

              <div className="form-group">
                <label>Language</label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Thumbnail URL</label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                Publish this course
              </label>
            </div>
          </section>

          {/* Learning Outcomes */}
          <section className="form-section">
            <h2>What Students Will Learn</h2>
            {formData.learningOutcomes.map((outcome, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => handleArrayChange('learningOutcomes', index, e.target.value)}
                />
                {formData.learningOutcomes.length > 1 && (
                  <button type="button" onClick={() => removeArrayItem('learningOutcomes', index)} className="btn-remove">
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('learningOutcomes')} className="btn btn-outline btn-sm">
              + Add Outcome
            </button>
          </section>

          {/* Requirements */}
          <section className="form-section">
            <h2>Requirements</h2>
            {formData.requirements.map((req, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                />
                {formData.requirements.length > 1 && (
                  <button type="button" onClick={() => removeArrayItem('requirements', index)} className="btn-remove">
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('requirements')} className="btn btn-outline btn-sm">
              + Add Requirement
            </button>
          </section>

          {/* Lectures */}
          <section className="form-section">
            <h2>Course Content</h2>
            {formData.lectures.map((lecture, index) => (
              <div key={index} className="lecture-item">
                <h4>Lecture {index + 1}</h4>
                <div className="form-group">
                  <label>Lecture Title *</label>
                  <input
                    type="text"
                    value={lecture.title}
                    onChange={(e) => handleLectureChange(index, 'title', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={lecture.description}
                    onChange={(e) => handleLectureChange(index, 'description', e.target.value)}
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Video URL</label>
                    <input
                      type="url"
                      value={lecture.videoUrl}
                      onChange={(e) => handleLectureChange(index, 'videoUrl', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={lecture.duration}
                      onChange={(e) => handleLectureChange(index, 'duration', e.target.value)}
                      placeholder="e.g., 15 min"
                    />
                  </div>
                </div>
                {formData.lectures.length > 1 && (
                  <button type="button" onClick={() => removeLecture(index)} className="btn btn-outline btn-sm">
                    Remove Lecture
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addLecture} className="btn btn-outline">
              + Add Lecture
            </button>
          </section>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/instructor/dashboard')} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Course'}
            </button>
          </div>
        </form>

        {/* Quiz Management Section */}
        <QuizManagement courseId={id} />
      </div>
    </div>
  );
};

export default EditCourse;

