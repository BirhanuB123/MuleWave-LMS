import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/Admin.css';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/admin/courses');
      setCourses(res.data.data);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const togglePublish = async (course) => {
    try {
      // toggle publish state
      const updated = { isPublished: !course.isPublished };
      await api.put(`/courses/${course._id}`, updated);
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published');
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update course');
    }
  };

  return (
    <div className="admin-page container">
      <h1>Manage Courses</h1>
      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Instructor</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id}>
                  <td>{c.title}</td>
                  <td>{c.instructor?.firstName} {c.instructor?.lastName}</td>
                  <td>{c.price}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => deleteCourse(c._id)}>Delete</button>
                    <button style={{marginLeft: '8px'}} className="btn btn-sm btn-outline" onClick={() => togglePublish(c)}>
                      {c.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
