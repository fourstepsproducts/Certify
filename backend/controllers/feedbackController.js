const asyncHandler = require('express-async-handler');
const FeedbackLink = require('../models/FeedbackLink');
const Feedback = require('../models/Feedback');
const Module = require('../models/Module');

// @desc    Create feedback link
// @route   POST /api/feedback/link
// @access  Private
const createFeedbackLink = asyncHandler(async (req, res) => {
    const { moduleId } = req.body;

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
    let link = await FeedbackLink.findOne({ moduleId });

    if (link) {
        return res.json(link);
    }

    // Create new link
    link = await FeedbackLink.create({ moduleId });

    res.status(201).json(link);
});

// @desc    Get feedback link details
// @route   GET /api/feedback/link/:linkId
// @access  Public
const getFeedbackLink = asyncHandler(async (req, res) => {
    const link = await FeedbackLink.findOne({ linkId: req.params.linkId })
        .populate('moduleId', 'name');

    if (!link) {
        res.status(404);
        throw new Error('Feedback link not found');
    }

    if (!link.isActive) {
        res.status(403);
        throw new Error('This feedback link is no longer active');
    }

    res.json(link);
});

// @desc    Submit feedback
// @route   POST /api/feedback/submit/:linkId
// @access  Public
const submitFeedback = asyncHandler(async (req, res) => {
    const { email, feedback } = req.body;
    const { linkId } = req.params;

    // Validate required fields
    if (!email || !feedback) {
        res.status(400);
        throw new Error('Email and feedback are required');
    }

    // Verify link exists and is active
    const link = await FeedbackLink.findOne({ linkId });
    if (!link) {
        res.status(404);
        throw new Error('Feedback link not found');
    }

    if (!link.isActive) {
        res.status(403);
        throw new Error('This feedback link is no longer active');
    }

    // Check for duplicate feedback
    const existingFeedback = await Feedback.findOne({
        moduleId: link.moduleId,
        email: email.toLowerCase()
    });

    if (existingFeedback) {
        res.status(400);
        throw new Error('Feedback already submitted for this module');
    }

    // Create feedback
    const feedbackDoc = await Feedback.create({
        moduleId: link.moduleId,
        linkId,
        email,
        feedback
    });

    res.status(201).json({
        message: 'Feedback submitted successfully',
        feedback: feedbackDoc
    });
});

// @desc    Get all feedback for a module
// @route   GET /api/feedback/module/:moduleId
// @access  Private
const getModuleFeedback = asyncHandler(async (req, res) => {
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

    const feedback = await Feedback.find({ moduleId })
        .sort({ submittedAt: -1 });

    res.json(feedback);
});

module.exports = {
    createFeedbackLink,
    getFeedbackLink,
    submitFeedback,
    getModuleFeedback
};
