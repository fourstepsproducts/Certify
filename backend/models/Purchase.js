const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: false,
    },
    amount: {
        type: Number,
        required: true,
    },
    planName: {
        type: String,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed',
    },
    paymentId: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Purchase', purchaseSchema);
