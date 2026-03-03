const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Template = require('../models/Template');
const Download = require('../models/Download');
const sendVerificationEmail = require('../utils/sendVerificationEmail');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists in our system.');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        isVerified: false
    });

    if (user) {
        // Send verification email
        await sendVerificationEmail(user);

        res.status(201).json({
            message: "Registration successful. Please verify your email.",
            email: user.email
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            res.status(401);
            throw new Error('Please verify your email first');
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            activePlan: user.activePlan,
            profileCompleted: user.profileCompleted,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    try {
        console.log('[GET_ME] Start for user ID:', req.user.id);
        const user = await User.findById(req.user.id).select('-password').lean();

        if (!user) {
            console.warn('[GET_ME] User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('[GET_ME] User found:', user.email);

        // Fetch recent completed purchases
        let purchases = [];
        try {
            const Purchase = require('../models/Purchase');
            purchases = await Purchase.find({ user: user._id, status: 'completed' })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();
            console.log('[GET_ME] Purchases fetched:', purchases.length);
        } catch (err) {
            console.error('[GET_ME] Error fetching purchases:', err.message);
        }

        // Calculate usage statistics
        let certificatesCreated = 0;
        try {
            certificatesCreated = await Template.countDocuments({ user: user._id });
            console.log('[GET_ME] Certificates count:', certificatesCreated);
        } catch (err) {
            console.error('[GET_ME] Error counting templates:', err.message);
        }

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        let downloadsUsed = 0;
        try {
            downloadsUsed = await Download.countDocuments({
                user: user._id,
                plan: user.activePlan || 'Free Demo',
                createdAt: { $gte: startOfMonth }
            });
            console.log('[GET_ME] Downloads count:', downloadsUsed);
        } catch (err) {
            console.error('[GET_ME] Error counting downloads:', err.message);
        }

        let templatesUsedCount = 0;
        try {
            const templatesUsedData = await Download.distinct('templateName', {
                user: user._id,
                plan: user.activePlan || 'Free Demo',
                createdAt: { $gte: startOfMonth }
            });
            templatesUsedCount = templatesUsedData.length;
            console.log('[GET_ME] Templates used count:', templatesUsedCount);
        } catch (err) {
            console.error('[GET_ME] Error getting distinct templates:', err.message);
        }

        const limits = {
            'Free Demo': 3,
            'Pro': 500,
            'Enterprise': Infinity
        };
        const activePlan = user.activePlan || 'Free Demo';
        const downloadLimit = limits[activePlan] || 0;

        console.log('[GET_ME] Sending response...');
        res.status(200).json({
            ...user,
            purchases,
            usageStats: {
                certificatesCreated,
                downloadsUsed,
                templatesUsed: templatesUsedCount,
                downloadLimit
            }
        });
    } catch (error) {
        console.error('[GET_ME] Critical Error:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Server internal error' });
    }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);

        const user = await User.findByIdAndUpdate(decoded.userId, {
            isVerified: true,
        });

        if (!user) {
            return res.status(400).send("User not found ❌");
        }

        res.send(`
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #28a745;">Email verified successfully ✅</h1>
                <p>Redirecting you to login...</p>
                <script>
                    setTimeout(() => {
                        window.location.href = 'http://localhost:5173/signin';
                    }, 2000);
                </script>
            </div>
        `);
    } catch (err) {
        res.status(400).send("Invalid or expired link ❌");
    }
});

// @desc    Check verification status
// @route   GET /api/auth/check-status/:email
// @access  Public
const checkVerificationStatus = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const user = await User.findOne({ email });
    res.status(200).json({ isVerified: user ? user.isVerified : false });
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Send verification email (standalone)
// @route   POST /api/auth/send-verification
// @access  Public
const sendVerificationEmailInController = asyncHandler(async (req, res) => {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            name: 'Temporary User',
            email,
            password: Math.random().toString(36).slice(-8),
            isVerified: false,
        });
    }
    await sendVerificationEmail(user);
    res.status(200).json({ message: "Verification email sent." });
});

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = asyncHandler(async (req, res) => {
    console.log('googleCallback reached for user:', req.user._id);
    const token = generateToken(req.user._id);
    console.log('Generated token, redirecting back to frontend...');
    res.redirect(`http://localhost:5173/editor?token=${token}`);
});

// @desc    Complete user profile (onboarding)
// @route   POST /api/auth/profile/complete
// @access  Private
const completeProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const {
        role,
        organizationName,
        organizationType,
        website,
        phone,
        profession,
        referralSource
    } = req.body;

    if (!role) {
        res.status(400);
        throw new Error('Please select a role');
    }

    user.role = role;
    user.organizationName = organizationName;
    user.organizationType = organizationType;
    user.website = website;
    user.phone = phone;
    user.profession = profession;
    user.referralSource = referralSource;
    user.profileCompleted = true;

    await user.save();

    res.status(200).json({
        message: 'Profile completed successfully',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileCompleted: user.profileCompleted
        }
    });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    verifyEmail,
    checkVerificationStatus,
    sendVerificationEmailInController,
    googleCallback,
    completeProfile,
};
