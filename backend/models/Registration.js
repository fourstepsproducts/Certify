const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: [true, 'Module ID is required']
    },
    linkId: {
        type: String,
        required: [true, 'Link ID is required']
    },
    name: {
        type: String,
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phoneNumber: {
        type: String,
        trim: true,
        maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    customData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
registrationSchema.index({ moduleId: 1, submittedAt: -1 });
registrationSchema.index({ email: 1 });
registrationSchema.index({ linkId: 1 });
registrationSchema.index({ moduleId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
