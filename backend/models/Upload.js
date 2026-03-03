const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    data: {
        type: String, // Base64 string
        required: true
    },
    type: {
        type: String,
        default: 'image'
    },
    name: {
        type: String,
        default: 'Uploaded Image'
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Upload', uploadSchema);
