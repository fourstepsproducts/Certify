const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    activePlan: {
        type: String,
        default: 'Free Demo',
    },
    canLockLayout: {
        type: Boolean,
        default: false,
    },
    billingCycleEnd: {
        type: Date,
    },
    scheduledPlan: {
        type: String, // For downgrades effective next cycle
    },
    googleId: {
        type: String,
    },
    role: {
        type: String,
        enum: ['organizer', 'participant'],
    },
    profileCompleted: {
        type: Boolean,
        default: false,
    },
    organizationName: String,
    organizationType: String,
    website: String,
    phone: String,
    profession: String,
    referralSource: String,
}, {
    timestamps: true,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
