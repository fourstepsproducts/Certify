const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const PaymentVerification = require('../models/PaymentVerification');
const Registration = require('../models/Registration');
const RegistrationLink = require('../models/RegistrationLink');
const Module = require('../models/Module');
const OrganizerPaymentSettings = require('../models/OrganizerPaymentSettings');
const transporter = require('../utils/mailer');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { encrypt, decrypt } = require('../utils/encryption');

// @desc    Get organizer global payment settings
// @route   GET /api/payments/organizer-settings
// @access  Private
const getOrganizerSettings = asyncHandler(async (req, res) => {
    // 1. Get explicitly saved global settings (legacy/default)
    const settings = await OrganizerPaymentSettings.findOne({ organizerId: req.user._id });

    // 2. Get modules that have connected payment settings
    const savedModules = await Module.find({
        userId: req.user._id,
        'paymentConfig.status': 'connected',
        'paymentConfig.razorpayKeyId': { $ne: '' }
    }).select('name paymentConfig entryFee');

    const configs = savedModules.map(m => ({
        moduleId: m._id,
        moduleName: m.name,
        razorpayKeyId: m.paymentConfig.razorpayKeyId,
        entryFee: m.entryFee
    }));

    // If we have legacy settings, add them as a "Global Default" entry if not redundant
    if (settings) {
        configs.unshift({
            moduleId: 'global',
            moduleName: 'Global Default',
            razorpayKeyId: settings.razorpayKeyId,
            entryFee: settings.defaultEntryFee
        });
    }

    res.json({
        hasSavedCredentials: configs.length > 0,
        savedConfigs: configs
    });
});

// @desc    Save organizer global payment settings
// @route   POST /api/payments/organizer-settings
// @access  Private
const saveOrganizerSettings = asyncHandler(async (req, res) => {
    const { razorpayKeyId, razorpaySecret, defaultEntryFee } = req.body;

    if (razorpayKeyId && !razorpayKeyId.startsWith('rzp_')) {
        res.status(400);
        throw new Error('Invalid Razorpay Key ID format. Must start with rzp_');
    }

    const settingsData = {
        organizerId: req.user._id,
        razorpayKeyId,
        defaultEntryFee,
        defaultPaymentMethod: 'razorpay'
    };

    if (razorpaySecret) {
        settingsData.razorpaySecret = encrypt(razorpaySecret);
    }

    const settings = await OrganizerPaymentSettings.findOneAndUpdate(
        { organizerId: req.user._id },
        settingsData,
        { upsert: true, new: true }
    );

    res.json({
        success: true,
        message: 'Global payment settings saved',
        hasSavedCredentials: true,
        razorpayKeyId: settings.razorpayKeyId
    });
});

// @desc    Save module payment settings
// @route   POST /api/payments/settings/:moduleId
// @access  Private
const savePaymentSettings = asyncHandler(async (req, res) => {
    const { entryFee, razorpayKeyId, razorpaySecret, paymentMethod, saveToGlobal, fromModuleId } = req.body;

    if (razorpayKeyId && !razorpayKeyId.startsWith('rzp_')) {
        res.status(400);
        throw new Error('Invalid Razorpay Key ID format. Must start with rzp_');
    }
    const { moduleId } = req.params;

    const moduleRecord = await Module.findById(moduleId);
    if (!moduleRecord) {
        res.status(404);
        throw new Error('Module not found');
    }

    // Authorization check
    if (moduleRecord.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this module');
    }

    moduleRecord.entryFee = entryFee;
    moduleRecord.paymentConfig.razorpayKeyId = razorpayKeyId;

    if (razorpaySecret && razorpaySecret !== '********') {
        moduleRecord.paymentConfig.razorpaySecret = encrypt(razorpaySecret);
    } else if (fromModuleId) {
        // Copy secret from another module or global settings
        let sourceSecret;
        if (fromModuleId === 'global') {
            const global = await OrganizerPaymentSettings.findOne({ organizerId: req.user._id }).select('+razorpaySecret');
            sourceSecret = global?.razorpaySecret;
        } else {
            const source = await Module.findOne({ _id: fromModuleId, userId: req.user._id }).select('+paymentConfig.razorpaySecret');
            sourceSecret = source?.paymentConfig?.razorpaySecret;
        }

        if (sourceSecret) {
            moduleRecord.paymentConfig.razorpaySecret = sourceSecret;
        }
    }

    moduleRecord.paymentConfig.paymentMethod = paymentMethod || 'checkout';
    moduleRecord.paymentConfig.status = 'connected';
    moduleRecord.paymentConfig.isSavedGlobal = true; // Always save as global since user wants it simple
    moduleRecord.isPaid = true; // Mark as paid since credentials are set

    await moduleRecord.save();

    const settingsData = {
        organizerId: req.user._id,
        razorpayKeyId,
        defaultEntryFee: entryFee,
        defaultPaymentMethod: paymentMethod || 'checkout'
    };

    // Propagate secret to global settings table
    if (razorpaySecret && razorpaySecret !== '********') {
        settingsData.razorpaySecret = encrypt(razorpaySecret);
    } else if (fromModuleId) {
        let sourceSecret;
        if (fromModuleId === 'global') {
            const global = await OrganizerPaymentSettings.findOne({ organizerId: req.user._id }).select('+razorpaySecret');
            sourceSecret = global?.razorpaySecret;
        } else {
            const source = await Module.findOne({ _id: fromModuleId, userId: req.user._id }).select('+paymentConfig.razorpaySecret');
            sourceSecret = source?.paymentConfig?.razorpaySecret;
        }
        if (sourceSecret) {
            settingsData.razorpaySecret = sourceSecret;
        }
    }

    if (settingsData.razorpaySecret || settingsData.razorpayKeyId) {
        await OrganizerPaymentSettings.findOneAndUpdate(
            { organizerId: req.user._id },
            settingsData,
            { upsert: true, new: true }
        );
    }

    res.json({
        success: true,
        message: 'Payment settings saved successfully',
        paymentConfig: {
            razorpayKeyId: moduleRecord.paymentConfig.razorpayKeyId,
            paymentMethod: moduleRecord.paymentConfig.paymentMethod,
            status: moduleRecord.paymentConfig.status
        }
    });
});

// @desc    Test Razorpay connection
// @route   POST /api/payments/test-connection/:moduleId
// @access  Private
const testRazorpayConnection = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const moduleRecord = await Module.findById(moduleId).select('+paymentConfig.razorpaySecret');

    if (!moduleRecord) {
        res.status(404);
        throw new Error('Module not found');
    }

    let keyId = moduleRecord.paymentConfig.razorpayKeyId;
    let secretEncrypted = moduleRecord.paymentConfig.razorpaySecret;

    // Fallback to global settings if module levels are empty
    if (!keyId || !secretEncrypted) {
        const globalSettings = await OrganizerPaymentSettings.findOne({ organizerId: req.user._id }).select('+razorpaySecret');
        if (globalSettings) {
            keyId = globalSettings.razorpayKeyId;
            secretEncrypted = globalSettings.razorpaySecret;
        }
    }

    if (!keyId || !secretEncrypted) {
        res.status(400);
        throw new Error('Payment settings not configured or missing from global settings');
    }

    try {
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: decrypt(secretEncrypted)
        });

        // Try to create a dummy order
        await razorpay.orders.create({
            amount: 100, // 1 INR
            currency: 'INR',
            receipt: 'test_receipt_1'
        });

        res.json({ success: true, message: 'Connection verified successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Connection failed: ' + error.message });
    }
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Public
const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { moduleId, amount, email, name } = req.body;

    console.log(`[Order] Creating Razorpay order for Module: ${moduleId}, Email: ${email}`);

    if (!moduleId || !mongoose.Types.ObjectId.isValid(moduleId)) {
        res.status(400);
        throw new Error('Valid Module ID is required');
    }

    const moduleRecord = await Module.findById(moduleId).select('+paymentConfig.razorpaySecret');
    if (!moduleRecord || !moduleRecord.isPaid) {
        res.status(400);
        throw new Error('Invalid module or module is not configured for payments');
    }

    if (!moduleRecord.entryFee || moduleRecord.entryFee <= 0) {
        res.status(400);
        throw new Error('Module entry fee must be greater than zero');
    }

    let keyId = moduleRecord.paymentConfig.razorpayKeyId;
    let secretEncrypted = moduleRecord.paymentConfig.razorpaySecret;

    // Fallback to global settings if module levels are empty
    if (!keyId || !secretEncrypted) {
        console.log('[Order] Module settings empty, falling back to global settings');
        const globalSettings = await OrganizerPaymentSettings.findOne({ organizerId: moduleRecord.userId }).select('+razorpaySecret');
        if (globalSettings) {
            keyId = keyId || globalSettings.razorpayKeyId;
            secretEncrypted = secretEncrypted || globalSettings.razorpaySecret;
        }
    }

    if (!keyId || !secretEncrypted) {
        res.status(400);
        throw new Error('Razorpay credentials not found for this organizer');
    }

    const decryptedSecret = decrypt(secretEncrypted);
    if (!decryptedSecret) {
        res.status(500);
        throw new Error('Failed to decrypt Razorpay secret. Please re-save credentials.');
    }

    const instance = new Razorpay({
        key_id: keyId,
        key_secret: decryptedSecret
    });

    const options = {
        amount: Math.round(moduleRecord.entryFee * 100), // convert to paisa
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
            moduleId: moduleId.toString(),
            email: email || '',
            name: name || ''
        }
    };

    try {
        const order = await instance.orders.create(options);
        console.log(`[Order] Successfully created Razorpay order: ${order.id}`);
        res.json({
            success: true,
            orderId: order.id,
            amount: options.amount,
            keyId: keyId
        });
    } catch (error) {
        console.error('[Order] Razorpay API Error:', error);
        res.status(500);
        throw new Error('Razorpay Service Error: ' + error.message);
    }
});

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify-razorpay
// @access  Public
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    // Collect data from either body (POST) or query (GET/Redirect)
    const razorpay_order_id = req.body.razorpay_order_id || req.query.razorpay_order_id;
    const razorpay_payment_id = req.body.razorpay_payment_id || req.query.razorpay_payment_id;
    const razorpay_signature = req.body.razorpay_signature || req.query.razorpay_signature;
    const moduleId = req.body.moduleId || req.query.moduleId;
    const email = req.body.email || req.query.email;
    const name = req.body.name || req.query.name;
    const linkId = req.body.linkId || req.query.linkId;
    const phone = req.body.phone || req.query.phone;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !moduleId) {
        res.status(400);
        throw new Error('Missing required Razorpay parameters for verification');
    }

    const moduleRecord = await Module.findById(moduleId).select('+paymentConfig.razorpaySecret');
    if (!moduleRecord) {
        res.status(404);
        throw new Error('Module not found');
    }

    let secretEncrypted = moduleRecord.paymentConfig.razorpaySecret;

    // Fallback to global settings if module level secret is empty
    if (!secretEncrypted) {
        const globalSettings = await OrganizerPaymentSettings.findOne({ organizerId: moduleRecord.userId }).select('+razorpaySecret');
        if (globalSettings) {
            secretEncrypted = globalSettings.razorpaySecret;
        }
    }

    if (!secretEncrypted) {
        res.status(400);
        throw new Error('Payment configuration secret missing');
    }

    const secret = decrypt(secretEncrypted);
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Payment verified
        // 1. Store verification info (enables handleSubmit on frontend)
        await PaymentVerification.findOneAndUpdate(
            { email: email.toLowerCase(), webinarId: moduleId },
            {
                amount: moduleRecord.entryFee,
                status: 'paid',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id
            },
            { upsert: true, new: true }
        );

        // 2. Perform fallback registration (if frontend handler failed)
        if (linkId && email) {
            try {
                const existingRegistration = await Registration.findOne({ linkId, email: email.toLowerCase() });
                if (!existingRegistration) {
                    await Registration.create({
                        moduleId,
                        linkId,
                        name: name || 'User',
                        email: email.toLowerCase(),
                        phoneNumber: phone || '',
                        customData: {
                            registrationStatus: 'auto_registered_from_payment'
                        }
                    });
                    console.log(`[Verify] Auto-registered user: ${email}`);
                }
            } catch (regError) {
                console.error('[Verify] Fallback registration failed:', regError.message);
            }
        }

        // Send confirmation email (with error trap)
        if (email) {
            try {
                const dashboardUrl = `${process.env.FRONTEND_URL}/user/dashboard`;
                await transporter.sendMail({
                    from: `"CertifyPro" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `Payment Receipt - ${moduleRecord.name}`,
                    html: `<div style="padding: 20px; font-family: sans-serif;">
                        <h2>Payment Received</h2>
                        <p>Thank you <strong>${name || 'User'}</strong> for your payment of ₹${moduleRecord.entryFee} for <strong>${moduleRecord.name}</strong>.</p>
                        <p>Your Order ID: ${razorpay_order_id}</p>
                        <p>Your Payment ID: ${razorpay_payment_id}</p>
                        <p><a href="${dashboardUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View on Dashboard</a></p>
                    </div>`
                });
            } catch (emailError) {
                console.error('Email confirmation failed:', emailError.message);
            }
        }

        // Handle Redirect for full-page Razorpay mode or JSON for modal
        if (req.accepts('html') || req.query.moduleId) {
            // This is a browser redirect (or explicitly requested via query)
            const successUrl = `${process.env.FRONTEND_URL}/success?moduleName=${encodeURIComponent(moduleRecord.name)}`;
            console.log(`[Verify] Redirecting user to success page: ${successUrl}`);
            return res.redirect(successUrl);
        } else {
            // This is an AJAX call from a local handler
            return res.status(200).json({
                success: true,
                message: 'Payment verified and confirmed',
                status: 'paid'
            });
        }
    } else {
        res.status(400);
        throw new Error('Invalid signature. Payment verification failed.');
    }
});

// @desc    Initiate fake payment (send verification code) - Kept for backward compatibility
const initiatePayment = asyncHandler(async (req, res) => {
    // ... existing implementation ...
});

// @desc    Verify payment code - Kept for backward compatibility
const verifyPayment = asyncHandler(async (req, res) => {
    // ... existing implementation ...
});

// @desc    Get current user's payment history (bills)
const getPaymentHistory = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.email) {
        res.status(401);
        throw new Error('User not found or email missing');
    }

    const { email } = req.user;

    const payments = await PaymentVerification.find({
        email: email.toLowerCase(),
        status: 'paid'
    }).populate('webinarId', 'name')
        .sort({ updatedAt: -1 });

    res.json(payments);
});

module.exports = {
    savePaymentSettings,
    testRazorpayConnection,
    createRazorpayOrder,
    verifyRazorpayPayment,
    initiatePayment,
    verifyPayment,
    getPaymentHistory,
    getOrganizerSettings,
    saveOrganizerSettings
};

