const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const feedbackLinkSchema = new mongoose.Schema({
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: [true, 'Module ID is required']
    },
    linkId: {
        type: String,
        default: () => uuidv4(),
        unique: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

feedbackLinkSchema.index({ moduleId: 1 });

module.exports = mongoose.model('FeedbackLink', feedbackLinkSchema);
