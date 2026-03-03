const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    verifyEmail,
    checkVerificationStatus,
    sendVerificationEmailInController,
    googleCallback,
    completeProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('passport');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/profile/complete', protect, completeProfile);
router.get('/verify-email/:token', verifyEmail);
router.get('/check-status/:email', checkVerificationStatus);
router.post('/send-verification', sendVerificationEmailInController);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    googleCallback
);

module.exports = router;
