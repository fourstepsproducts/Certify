const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
    createRegistrationLink,
    getRegistrationLink,
    submitRegistration,
    getModuleRegistrations,
    getRegistrationLinkByModuleId
} = require('../controllers/registrationController');

// Protect routes that require authentication
const protect = passport.authenticate('jwt', { session: false });

// Protected routes
router.post('/link', protect, createRegistrationLink);
router.get('/link/module/:moduleId', protect, getRegistrationLinkByModuleId);
router.get('/module/:moduleId', protect, getModuleRegistrations);

// Public routes
router.get('/link/:linkId', getRegistrationLink);
router.post('/submit/:linkId', submitRegistration);

module.exports = router;
