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
const passport = require('../config/passport');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/profile/complete', protect, completeProfile);
router.get('/verify-email/:token', verifyEmail);
router.get('/check-status/:email', checkVerificationStatus);
router.post('/send-verification', sendVerificationEmailInController);

// Google Auth
router.get("/google", (req, res, next) => {
    try {
        console.log("DIAGNOSTIC: Google auth route hit. Registered strategies:", Object.keys(passport._strategies));

        // This confirms if we are hitting the NEW code
        if (req.query.debug) {
            return res.json({
                status: "DIAGNOSTIC_MODE",
                strategies: Object.keys(passport._strategies)
            });
        }

        passport.authenticate("google", {
            scope: ["profile", "email"],
            session: false
        })(req, res, next);
    } catch (error) {
        console.error("Google auth error:", error);
        res.status(500).json({
            error: "Google authentication failed",
            details: error.message
        });
    }
});

router.get("/google/callback", (req, res, next) => {
    try {
        passport.authenticate("google", { session: false }, (err, user) => {
            if (err) {
                console.error("Google callback error:", err);
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(401).json({ error: "User not authenticated" });
            }

            // If we have a user, handle the successful login logic (usually issuing a token)
            req.user = user; // Attach user to request for the callback controller
            next();
        })(req, res, next);
    } catch (error) {
        console.error("Callback exception:", error);
        res.status(500).json({ error: error.message });
    }
}, googleCallback);

module.exports = router;
