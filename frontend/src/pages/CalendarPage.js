import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import '../styles/CalendarPage.css';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'personal',
    startDate: '',
    dueDate: '',
    isAllDay: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(e => e.eventType === filterType));
    }
  }, [filterType, events]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/calendar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data.events || []);
      setFilteredEvents(res.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/calendar', newEvent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Event added successfully!');
      setShowAddModal(false);
      setNewEvent({
        title: '',
        description: '',
        eventType: 'personal',
        startDate: '',
        dueDate: '',
        isAllDay: false
      });
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/calendar/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Event deleted successfully!');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      assignment: '#ef4444',
      quiz: '#f59e0b',
      announcement: '#3b82f6',
      class: '#8b5cf6',
      personal: '#10b981',
      other: '#6b7280'
    };
    return colors[type] || colors.other;
  };

  const groupEventsByDate = (events) => {
    const grouped = {};
    events.forEach(event => {
      const date = new Date(event.startDate).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByDate(filteredEvents);

  if (loading) {
    return (
      <div className="calendar-page loading">
        <div className="spinner-large"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div className="header-left">
          <FaCalendarAlt className="header-icon" />
          <div>
            <h1>My Calendar</h1>
            <p className="subtitle">Manage your schedule and deadlines</p>
          </div>
        </div>
        <button className="add-event-btn" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add Event
        </button>
      </div>

      {/* Filters */}
      <div className="calendar-filters">
        <FaFilter /> Filter by:
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Events</option>
          <option value="assignment">Assignments</option>
          <option value="quiz">Quizzes</option>
          <option value="announcement">Announcements</option>
          <option value="class">Classes</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      {/* Events List */}
      <div className="calendar-content">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt />
            <h3>No events found</h3>
            <p>Add your first event to get started!</p>
          </div>
        ) : (
          Object.keys(groupedEvents).sort((a, b) => new Date(a) - new Date(b)).map(date => (
            <div key={date} className="date-group">
              <div className="date-header">
                <span className="date-day">{new Date(date).getDate()}</span>
                <span className="date-month-year">
                  {new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="events-for-date">
                {groupedEvents[date].map(event => (
                  <div
                    key={event._id}
                    className="event-card"
                    style={{ borderLeftColor: getEventTypeColor(event.eventType) }}
                  >
                    <div className="event-info">
                      <h3>{event.title}</h3>
                      {event.description && <p>{event.description}</p>}
                      <div className="event-meta">
                        <span className="event-type" style={{ backgroundColor: getEventTypeColor(event.eventType) }}>
                          {event.eventType}
                        </span>
                        {event.dueDate && (
                          <span className="event-time">
                            Due: {new Date(event.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className="delete-event-btn"
                      onClick={() => handleDeleteEvent(event._id)}
                      title="Delete event"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}></div>
          <div className="modal-container">
            <div className="modal-header">
              <h2>Add New Event</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddEvent} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                  placeholder="Event title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Event description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={newEvent.eventType}
                    onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                    required
                  >
                    <option value="personal">Personal</option>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="announcement">Announcement</option>
                    <option value="class">Class</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newEvent.isAllDay}
                      onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked })}
                    />
                    All Day Event
                  </label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type={newEvent.isAllDay ? "date" : "datetime-local"}
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type={newEvent.isAllDay ? "date" : "datetime-local"}
                    value={newEvent.dueDate}
                    onChange={(e) => setNewEvent({ ...newEvent, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarPage;
