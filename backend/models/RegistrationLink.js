const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const registrationLinkSchema = new mongoose.Schema({
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
    },
    customFields: [{
        id: String,
        label: String,
        type: {
            type: String,
            enum: ['text', 'number', 'dropdown', 'checkbox', 'email'],
            default: 'text'
        },
        required: {
            type: Boolean,
            default: false
        },
        placeholder: String,
        options: [String] // For dropdowns
    }]
}, {
    timestamps: true
});

registrationLinkSchema.index({ moduleId: 1 });

module.exports = mongoose.model('RegistrationLink', registrationLinkSchema);
