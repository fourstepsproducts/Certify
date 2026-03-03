const asyncHandler = require('express-async-handler');
const RegistrationLink = require('../models/RegistrationLink');
const Registration = require('../models/Registration');
const Module = require('../models/Module');

// @desc    Create registration link
// @route   POST /api/registrations/link
// @access  Private
const createRegistrationLink = asyncHandler(async (req, res) => {
    const { moduleId, customFields } = req.body;

    if (!moduleId) {
        res.status(400);
        throw new Error('Module ID is required');
    }

    // Verify module exists and user owns it
    const module = await Module.findById(moduleId);
    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    if (module.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    // Check if link already exists for this module
    let link = await RegistrationLink.findOne({ moduleId });

    if (link) {
        // Update existing link with new custom fields
        link.customFields = customFields || [];
        await link.save();
        return res.json(link);
    }

    // Create new link
    link = await RegistrationLink.create({
        moduleId,
        customFields: customFields || []
    });

    res.status(201).json(link);
});

// @desc    Get registration link details
// @route   GET /api/registrations/link/:linkId
// @access  Public
const getRegistrationLink = asyncHandler(async (req, res) => {
    const link = await RegistrationLink.findOne({ linkId: req.params.linkId })
        .populate('moduleId', 'name isPaid entryFee paymentConfig');

    if (!link) {
        return res.status(404).json({ message: 'Registration link not found' });
    }

    if (!link.isActive) {
        res.status(403);
        throw new Error('This registration link is no longer active');
    }

    res.json(link);
});

// @desc    Submit registration
// @route   POST /api/registrations/submit/:linkId
// @access  Public
const submitRegistration = asyncHandler(async (req, res) => {
    const { name, email, phoneNumber, customData } = req.body;
    const { linkId } = req.params;

    // Validate required fields
    // if (!name || !email || !phoneNumber) {
    //     res.status(400);
    //     throw new Error('All fields are required');
    // }

    // Verify link exists and is active
    const link = await RegistrationLink.findOne({ linkId });
    if (!link) {
        return res.status(404).json({ message: 'Registration link not found' });
    }

    if (!link.isActive) {
        res.status(403);
        throw new Error('This registration link is no longer active');
    }

    // Check for duplicate registration
    const existingRegistration = await Registration.findOne({
        linkId,
        email: email.toLowerCase()
    });

    if (existingRegistration) {
        res.status(400);
        throw new Error('You have already registered with this email address');
    }

    // Check payment if required
    const module = await Module.findById(link.moduleId);
    if (module && module.isPaid) {
        const PaymentVerification = require('../models/PaymentVerification');
        const verification = await PaymentVerification.findOne({
            email: email.toLowerCase(),
            webinarId: module._id,
            status: 'paid'
        });

        if (!verification) {
            res.status(402); // Payment Required
            throw new Error('Payment verification required for this webinar');
        }
    }

    // Create registration
    const registration = await Registration.create({
        moduleId: link.moduleId,
        linkId,
        name,
        email,
        phoneNumber,
        customData: customData || {}
    });

    res.status(201).json({
        message: 'Registration submitted successfully',
        registration
    });
});

// @desc    Get all registrations for a module
// @route   GET /api/registrations/module/:moduleId
// @access  Private
const getModuleRegistrations = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;

    // Verify module exists and user owns it
    const module = await Module.findById(moduleId);
    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    if (module.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const registrations = await Registration.find({ moduleId })
        .sort({ submittedAt: -1 });

    res.json(registrations);
});

// @desc    Get registration link by module ID (Internal/Admin)
// @route   GET /api/registrations/link/module/:moduleId
// @access  Private
const getRegistrationLinkByModuleId = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;

    const link = await RegistrationLink.findOne({ moduleId });

    if (!link) {
        // It's okay if not found, just return null or 404 handled gracefully by frontend
        return res.status(404).json({ message: 'Registration link not found' });
    }

    res.json(link);
});

module.exports = {
    createRegistrationLink,
    getRegistrationLink,
    submitRegistration,
    getModuleRegistrations,
    getRegistrationLinkByModuleId
};
