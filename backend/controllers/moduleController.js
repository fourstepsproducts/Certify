const asyncHandler = require('express-async-handler');
const Module = require('../models/Module');
const Registration = require('../models/Registration');
const Feedback = require('../models/Feedback');
const CertificateQueue = require('../models/CertificateQueue');

// @desc    Create new module
// @route   POST /api/modules
// @access  Private
const createModule = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Module name is required');
    }

    const module = await Module.create({
        name,
        userId: req.user._id,
        headingId: req.body.headingId || undefined,
        isPaid: req.body.isPaid || false,
        entryFee: req.body.entryFee || 0
    });

    res.status(201).json(module);
});

// @desc    Get all user's modules
// @route   GET /api/modules
// @access  Private
const getModules = asyncHandler(async (req, res) => {
    const modules = await Module.find({ userId: req.user._id })
        .sort({ createdAt: -1 });

    // Get counts for each module
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

    res.json(modulesWithCounts);
});

// @desc    Get module by ID
// @route   GET /api/modules/:id
// @access  Private
const getModuleById = asyncHandler(async (req, res) => {
    const module = await Module.findById(req.params.id);

    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    // Check if user owns this module
    if (module.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this module');
    }

    res.json(module);
});

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private
const deleteModule = asyncHandler(async (req, res) => {
    const module = await Module.findById(req.params.id);

    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    // Check if user owns this module
    if (module.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this module');
    }

    // Cascade delete related data
    await Promise.all([
        Registration.deleteMany({ moduleId: module._id }),
        Feedback.deleteMany({ moduleId: module._id }),
        CertificateQueue.deleteMany({ moduleId: module._id })
    ]);

    await module.deleteOne();

    res.json({ message: 'Module deleted successfully' });
});

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Private
const updateModule = asyncHandler(async (req, res) => {
    const module = await Module.findById(req.params.id);

    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    // Check if user owns this module
    if (module.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this module');
    }

    // Update fields
    if (req.body.name) module.name = req.body.name;
    if (req.body.headingId !== undefined) module.headingId = req.body.headingId;
    if (req.body.isPaid !== undefined) module.isPaid = req.body.isPaid;
    if (req.body.entryFee !== undefined) module.entryFee = req.body.entryFee;

    // Update certificate config
    if (req.body.certificateConfig) {
        module.certificateConfig = {
            templateId: req.body.certificateConfig.templateId || module.certificateConfig?.templateId,
            fieldMapping: req.body.certificateConfig.fieldMapping || module.certificateConfig?.fieldMapping || {},
            certNumberPrefix: req.body.certificateConfig.certNumberPrefix !== undefined
                ? req.body.certificateConfig.certNumberPrefix
                : (module.certificateConfig?.certNumberPrefix || ''),
            serialFormat: req.body.certificateConfig.serialFormat || module.certificateConfig?.serialFormat || [],
            serialCounter: req.body.certificateConfig.serialCounter !== undefined
                ? req.body.certificateConfig.serialCounter
                : (module.certificateConfig?.serialCounter || 0)
        };
    }

    const updatedModule = await module.save();
    res.json(updatedModule);
});

module.exports = {
    createModule,
    getModules,
    getModuleById,
    deleteModule,
    updateModule
};
