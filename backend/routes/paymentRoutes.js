const express = require('express');
const router = express.Router();
const {
    initiatePayment,
    verifyPayment,
    getPaymentHistory,
    savePaymentSettings,
    testRazorpayConnection,
    createRazorpayOrder,
    verifyRazorpayPayment,
    getOrganizerSettings,
    saveOrganizerSettings
} = require('../controllers/paymentController');
const { handleRazorpayWebhook } = require('../controllers/webhookController');
const { protect } = require('../middleware/authMiddleware');

router.post('/webhook', handleRazorpayWebhook);
router.post('/initiate', initiatePayment);
router.post('/verify', verifyRazorpayPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/organizer-settings', protect, getOrganizerSettings);
router.post('/organizer-settings', protect, saveOrganizerSettings);

router.post('/settings/:moduleId', protect, savePaymentSettings);
router.post('/test-connection/:moduleId', protect, testRazorpayConnection);
router.post('/create-order', createRazorpayOrder);
router.post('/verify-razorpay', verifyRazorpayPayment);

module.exports = router;
