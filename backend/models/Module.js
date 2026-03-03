const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Module name is required'],
        trim: true,
        maxlength: [100, 'Module name cannot exceed 100 characters']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    headingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Heading',
        required: [false, 'Heading ID is optional for legacy support']
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    entryFee: {
        type: Number,
        default: 0
    },
    paymentConfig: {
        razorpayKeyId: {
            type: String,
            default: ''
        },
        razorpaySecret: {
            type: String, // Encrypted
            default: '',
            select: false
        },
        paymentMethod: {
            type: String,
            enum: ['checkout', 'link', 'upi_qr'],
            default: 'checkout'
        },
        status: {
            type: String,
            enum: ['not_configured', 'connected'],
            default: 'not_configured'
        },
        isSavedGlobal: {
            type: Boolean,
            default: false
        }
    },
    certificateConfig: {
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Template'
        },
        fieldMapping: {
            type: Map,
            of: String,
            default: {}
        },
        certNumberPrefix: {
            type: String,
            default: ''
        },
        serialFormat: {
            type: [{
                type: {
                    type: String,
                    enum: ['text', 'date', 'year', 'month', 'counter', 'separator', 'dynamic'],
                    required: true
                },
                value: String, // For text content or date format
                key: String,   // For dynamic fields (e.g. 'name')
                length: Number // For counter padding
            }],
            default: []
        },
        serialCounter: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Index for faster queries
moduleSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Module', moduleSchema);
