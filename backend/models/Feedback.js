const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: [true, 'Module ID is required']
    },
    linkId: {
        type: String,
        required: [true, 'Link ID is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    feedback: {
        type: String,
        required: [true, 'Feedback is required'],
        trim: true,
        maxlength: [2000, 'Feedback cannot exceed 2000 characters']
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
feedbackSchema.index({ moduleId: 1, submittedAt: -1 });
feedbackSchema.index({ email: 1 });
feedbackSchema.index({ linkId: 1 });
feedbackSchema.index({ moduleId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
