const asyncHandler = require('express-async-handler');
const Heading = require('../models/Heading');
const Module = require('../models/Module');
const Registration = require('../models/Registration');
const Feedback = require('../models/Feedback');
const CertificateQueue = require('../models/CertificateQueue');

// @desc    Create new heading
// @route   POST /api/headings
// @access  Private
const createHeading = asyncHandler(async (req, res) => {
    const { title } = req.body;

    if (!title) {
        res.status(400);
        throw new Error('Heading title is required');
    }

    // Get highest order
    const lastHeading = await Heading.findOne({ userId: req.user._id }).sort({ order: -1 });
    const order = lastHeading ? lastHeading.order + 1 : 0;

    const heading = await Heading.create({
        title,
        userId: req.user._id,
        order
    });

    res.status(201).json(heading);
});

// @desc    Get all user's headings with modules
// @route   GET /api/headings
// @access  Private
const getHeadings = asyncHandler(async (req, res) => {
    // 1. Fetch Headings
    const headings = await Heading.find({ userId: req.user._id })
        .sort({ order: 1 });

    // 2. Fetch Modules
    const modules = await Module.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // 3. Get Module Stats
    const modulesWithCounts = await Promise.all(
        modules.map(async (module) => {
            const registrationCount = await Registration.countDocuments({ moduleId: module._id });
            const feedbackCount = await Feedback.countDocuments({ moduleId: module._id });
            const eligibleCount = await CertificateQueue.countDocuments({
                moduleId: module._id,
                status: 'eligible'
            });

            return {
                ...module.toObject(),
                registrationCount,
                feedbackCount,
                eligibleCount
            };
        })
    );

    // 4. Group Modules by Heading
    const result = headings.map(heading => {
        const headingModules = modulesWithCounts.filter(m => m.headingId && m.headingId.toString() === heading._id.toString());
        return {
            ...heading.toObject(),
            modules: headingModules
        };
    });

    const uncategorizedModules = modulesWithCounts.filter(m => !m.headingId);

    res.json({
        headings: result,
        uncategorized: uncategorizedModules
    });
});

// @desc    Update heading
// @route   PUT /api/headings/:id
// @access  Private
const updateHeading = asyncHandler(async (req, res) => {
    const heading = await Heading.findById(req.params.id);

    if (!heading) {
        res.status(404);
        throw new Error('Heading not found');
    }

    if (heading.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    if (req.body.title) {
        heading.title = req.body.title;
    }

    const updatedHeading = await heading.save();
    res.json(updatedHeading);
});

// @desc    Delete heading
// @route   DELETE /api/headings/:id
// @access  Private
const deleteHeading = asyncHandler(async (req, res) => {
    const heading = await Heading.findById(req.params.id);

    if (!heading) {
        res.status(404);
        throw new Error('Heading not found');
    }

    if (heading.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    await Module.updateMany(
        { headingId: heading._id },
        { $unset: { headingId: "" } }
    );

    await heading.deleteOne();

    res.json({ message: 'Heading deleted' });
});

module.exports = {
    createHeading,
    getHeadings,
    deleteHeading,
    updateHeading
};
