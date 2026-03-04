const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    steps: [stepSchema],
    createdAt: {
        type: Number,
        default: Date.now
    }
});

const focusTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }
});

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    frequency: {
        type: String,
        enum: ['once', 'daily', 'weekly', 'weekdays', 'weekends', 'custom'],
        default: 'once'
    }
});

const userSchema = new mongoose.Schema({
    supabaseId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    picture: {
        type: String
    },
    goals: [goalSchema],
    focusTasks: [focusTaskSchema],
    events: [eventSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
