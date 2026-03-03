const mongoose = require('mongoose');

const paymentVerificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    webinarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    verificationCode: {
        type: String,
        required: false
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('PaymentVerification', paymentVerificationSchema);
