const mongoose = require('mongoose');

const certificateQueueSchema = new mongoose.Schema({
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: [true, 'Module ID is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['eligible', 'pending', 'ineligible', 'sent'],
        default: 'pending',
        required: true
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        default: null
    },
    sentAt: {
        type: Date,
        default: null
    },
    certificateNumber: {
        type: String,
        trim: true,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for faster queries
certificateQueueSchema.index({ moduleId: 1, status: 1 });
certificateQueueSchema.index({ email: 1 });

module.exports = mongoose.model('CertificateQueue', certificateQueueSchema);
