const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
    createFeedbackLink,
    getFeedbackLink,
    submitFeedback,
    getModuleFeedback
} = require('../controllers/feedbackController');

// Protect routes that require authentication
const protect = passport.authenticate('jwt', { session: false });

// Protected routes
router.post('/link', protect, createFeedbackLink);
router.get('/module/:moduleId', protect, getModuleFeedback);

// Public routes
router.get('/link/:linkId', getFeedbackLink);
router.post('/submit/:linkId', submitFeedback);

module.exports = router;
