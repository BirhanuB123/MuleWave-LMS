import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/CourseForm.css';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'Technology',
    level: 'Beginner',
    price: 0,
    duration: '',
    language: 'English',
    thumbnail: '',
    requirements: [''],
    learningOutcomes: [''],
    lectures: [{ title: '', description: '', videoUrl: '', duration: '' }]
  });
  const [loading, setLoading] = useState(false);

  const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Health', 'Language', 'Science', 'Arts', 'Other'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    setLoading(true);

    try {
      // Filter out empty values
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        learningOutcomes: formData.learningOutcomes.filter(l => l.trim() !== ''),
        lectures: formData.lectures.filter(l => l.title.trim() !== '').map((l, idx) => ({
          ...l,
          order: idx
        }))
      };

      await api.post('/courses', cleanedData);
      toast.success('Course created successfully!');
      navigate('/instructor/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-form-page">
      <div className="container">
        <div className="form-header">
          <h1>Create New Course</h1>
          <p>Share your knowledge with students around the world</p>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          {/* Basic Information */}
          <section className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label>Course Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Complete Web Development Bootcamp"
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
                placeholder="Brief one-line description (max 200 characters)"
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
                placeholder="Detailed course description..."
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
                  placeholder="0 for free"
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
                  placeholder="English"
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
                placeholder="https://example.com/image.jpg"
              />
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
                  placeholder="e.g., Build responsive websites"
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
                  placeholder="e.g., Basic computer skills"
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
                    placeholder="Lecture title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={lecture.description}
                    onChange={(e) => handleLectureChange(index, 'description', e.target.value)}
                    placeholder="Lecture description"
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
                      placeholder="https://youtube.com/embed/..."
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

          {/* Submit */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/instructor/dashboard')} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;

