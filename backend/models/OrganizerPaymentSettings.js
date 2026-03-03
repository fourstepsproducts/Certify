const mongoose = require('mongoose');

const organizerPaymentSettingsSchema = new mongoose.Schema({
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    defaultPaymentMethod: {
        type: String,
        default: 'razorpay'
    },
    razorpayKeyId: {
        type: String,
    },
    razorpaySecret: {
        type: String, // Encrypted
        select: false
    },
    defaultEntryFee: {
        type: Number,
        default: 0
    },
    autoUseSaved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('OrganizerPaymentSettings', organizerPaymentSettingsSchema);
