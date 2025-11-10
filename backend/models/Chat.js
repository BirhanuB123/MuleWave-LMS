const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isInstructor: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });

// Index for efficient querying of course messages
chatSchema.index({ courseId: 1, timestamp: -1 });

module.exports = mongoose.model('Chat', chatSchema);