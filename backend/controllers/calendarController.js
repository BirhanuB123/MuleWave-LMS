const CalendarEvent = require('../models/Calendar');
const Course = require('../models/Course');

// @desc    Get all calendar events for user
// @route   GET /api/calendar
// @access  Private
exports.getUserCalendar = async (req, res) => {
  try {
    const { startDate, endDate, type, courseId } = req.query;
    
    const query = { user: req.user.id };
    
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (type) {
      query.eventType = type;
    }
    
    if (courseId) {
      query.course = courseId;
    }

    const events = await CalendarEvent.find(query)
      .populate('course', 'title')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create calendar event
// @route   POST /api/calendar
// @access  Private
exports.createEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.create({
      user: req.user.id,
      ...req.body
    });

    const populatedEvent = await CalendarEvent.findById(event._id)
      .populate('course', 'title');

    res.status(201).json({
      success: true,
      event: populatedEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update calendar event
// @route   PUT /api/calendar/:id
// @access  Private
exports.updateEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await CalendarEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'title');

    res.json({
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete calendar event
// @route   DELETE /api/calendar/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await CalendarEvent.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark event as completed
// @route   PUT /api/calendar/:id/complete
// @access  Private
exports.completeEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    event.isCompleted = !event.isCompleted;
    event.completedAt = event.isCompleted ? Date.now() : null;
    await event.save();

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Complete event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get upcoming events (next 7 days)
// @route   GET /api/calendar/upcoming
// @access  Private
exports.getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const events = await CalendarEvent.find({
      user: req.user.id,
      startDate: {
        $gte: today,
        $lte: nextWeek
      },
      isCompleted: false
    })
      .populate('course', 'title')
      .sort({ startDate: 1 })
      .limit(10);

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
