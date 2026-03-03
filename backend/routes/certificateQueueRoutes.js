const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
    matchEmails,
    getQueue,
    sendCertificates,
    getEligibleStudents
} = require('../controllers/certificateQueueController');
const { sendDataDrivenEmails } = require('../controllers/emailController');

// Protect all routes with JWT authentication
const protect = passport.authenticate('jwt', { session: false });

router.post('/match/:moduleId', protect, matchEmails);
router.get('/queue/:moduleId', protect, getQueue);
router.get('/eligible/:moduleId', protect, getEligibleStudents);
router.post('/send', protect, sendCertificates);
router.post('/send-email', protect, sendDataDrivenEmails);

module.exports = router;
