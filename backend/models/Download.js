const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    templateName: {
        type: String,
        default: 'Untitled Certificate',
    },
    format: {
        type: String,
        enum: ['PNG', 'PDF'],
        required: true,
    },
    plan: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Download', downloadSchema);
