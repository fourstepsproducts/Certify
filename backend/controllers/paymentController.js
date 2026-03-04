const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const PaymentVerification = require('../models/PaymentVerification');
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
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        moduleId,
        email,
        name
    } = req.body;

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
        // Store verification info
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

        // Send confirmation email
        try {
            const dashboardUrl = `${process.env.FRONTEND_URL}/user/dashboard`;
            await transporter.sendMail({
                from: `"CertifyPro" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Payment Receipt - ${moduleRecord.name}`,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background-color: #f9fafb; color: #1f2937;">
                        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <div style="background: linear-gradient(to right, #4f46e5, #818cf8); padding: 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Payment Received</h1>
                                <p style="color: #e0e7ff; margin-top: 5px;">Thank you for your registration</p>
                            </div>
                            
                            <div style="padding: 40px;">
                                <p style="font-size: 16px;">Hello <strong>${name || 'User'}</strong>,</p>
                                <p>This email serves as a formal receipt for your payment towards <strong>${moduleRecord.name}</strong>.</p>
                                
                                <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="color: #6b7280;">Module:</span>
                                        <span style="font-weight: bold;">${moduleRecord.name}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="color: #6b7280;">Order ID:</span>
                                        <span style="font-family: monospace;">${razorpay_order_id}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="color: #6b7280;">Payment ID:</span>
                                        <span style="font-family: monospace;">${razorpay_payment_id}</span>
                                    </div>
                                    <div style="border-top: 1px solid #e5e7eb; margin: 15px 0; padding-top: 15px; display: flex; justify-content: space-between;">
                                        <span style="font-size: 18px; font-weight: bold;">Amount Paid:</span>
                                        <span style="font-size: 18px; font-weight: bold; color: #4f46e5;">₹${moduleRecord.entryFee}</span>
                                    </div>
                                </div>
                                
                                <p style="text-align: center; margin-top: 40px;">
                                    <a href="${dashboardUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; transition: background-color 0.3s;">
                                        View Bill on Dashboard
                                    </a>
                                </p>
                                
                                <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 25px;">
                                    You can download a PDF version of your bill from your student dashboard.
                                </p>
                            </div>
                            
                            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6;">
                                <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; 2024 CertifyPro. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Email confirmation failed:', emailError.message);
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified and confirmed',
            status: 'paid'
        });
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

