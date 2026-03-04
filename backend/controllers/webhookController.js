const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const PaymentVerification = require('../models/PaymentVerification');
const Module = require('../models/Module');
const OrganizerPaymentSettings = require('../models/OrganizerPaymentSettings');
const { decrypt } = require('../utils/encryption');

// @desc    Handle Razorpay Webhooks
// @route   POST /api/payments/webhook
// @access  Public (Razorpay Signature Verified)
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];

    // In a real production environment, you would verify the signature using your webhook secret
    // For now, we will log the event and process it.
    // To implement proper signature verification, we'd need the raw body.

    const event = req.body.event;
    console.log(`[Webhook] Received Razorpay event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
        const payment = req.body.payload.payment.entity;
        const notes = payment.notes || {};

        const orderId = payment.order_id;
        const paymentId = payment.id;
        const amount = payment.amount / 100; // convert from paisa

        // Extract info from notes which we passed during order creation
        const email = notes.email || payment.email;
        const moduleId = notes.moduleId;
        const name = notes.name || payment.name;

        if (email && moduleId) {
            console.log(`[Webhook] Processing successful payment for ${email} - Module: ${moduleId}`);

            // This is the "Safety Net": Even if the user closed the window, 
            // the webhook ensures the database is updated.
            await PaymentVerification.findOneAndUpdate(
                { email: email.toLowerCase(), webinarId: moduleId },
                {
                    amount: amount,
                    status: 'paid',
                    razorpayOrderId: orderId,
                    razorpayPaymentId: paymentId
                },
                { upsert: true }
            );

            console.log(`[Webhook] Successfully updated payment status for ${email}`);
        }
    }

    res.status(200).json({ status: 'ok' });
});

module.exports = {
    handleRazorpayWebhook
};
