const mongoose = require('mongoose');

const headingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Heading title is required'],
        trim: true,
        maxlength: [100, 'Heading title cannot exceed 100 characters']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
headingSchema.index({ userId: 1, order: 1 });

module.exports = mongoose.model('Heading', headingSchema);
