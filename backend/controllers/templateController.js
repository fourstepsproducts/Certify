const asyncHandler = require('express-async-handler');
const Template = require('../models/Template');
const Download = require('../models/Download');
const TemplateLayout = require('../models/TemplateLayout');
const { addTrainingEntry } = require('../utils/trainingDataWriter');

const FREE_TEMPLATE_LIMIT = 3;
const FREE_DOWNLOAD_LIMIT = 3;

// @desc    Get all templates
// @route   GET /api/templates
// @access  Private
const getTemplates = asyncHandler(async (req, res) => {
    const templates = await Template.find({ user: req.user.id });

    res.status(200).json(templates);
});

// @desc    Get system templates (Admin)
// @route   GET /api/admin/templates
// @access  Private (Admin)
const getSystemTemplates = asyncHandler(async (req, res) => {
    const templates = await Template.find({ isSystem: true }).sort({ createdAt: -1 });
    res.status(200).json(templates);
});

// @desc    Create system template (Admin)
// @route   POST /api/admin/templates
// @access  Private (Admin)
const createSystemTemplate = asyncHandler(async (req, res) => {
    if (!req.body.name) {
        res.status(400);
        throw new Error('Please include a template name');
    }

    const isSceneGraph = req.body.sceneGraph && req.body.sceneGraph.version && req.body.sceneGraph.root;

    const templateData = {
        user: req.user.id, // Admin ID
        name: req.body.name,
        thumbnail: req.body.thumbnail,
        category: req.body.category || 'system',
        isSystem: true,
    };

    if (isSceneGraph) {
        templateData.sceneGraph = req.body.sceneGraph;
        templateData.dataFormat = 'sceneGraph';
        templateData.version = req.body.sceneGraph.version || '1.0.0';
    } else {
        templateData.canvasData = req.body.canvasData;
        templateData.dataFormat = 'json';
    }

    const template = await Template.create(templateData);
    res.status(201).json(template);
});

// @desc    Update system template (Admin)
// @route   PUT /api/admin/templates/:id
// @access  Private (Admin)
const updateSystemTemplate = asyncHandler(async (req, res) => {
    const template = await Template.findById(req.params.id);

    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }

    // Update fields
    if (req.body.sceneGraph) {
        template.sceneGraph = req.body.sceneGraph;
        template.dataFormat = 'sceneGraph'; // Enforce new format
    }

    if (req.body.canvasData) {
        template.canvasData = req.body.canvasData;
    }

    if (req.body.thumbnail) template.thumbnail = req.body.thumbnail;
    if (req.body.status) template.status = req.body.status;
    if (req.body.name) template.name = req.body.name;

    const updatedTemplate = await template.save();
    res.status(200).json(updatedTemplate);
});

// @desc    Delete system template (Admin)
// @route   DELETE /api/admin/templates/:id
// @access  Private (Admin)
const deleteSystemTemplate = asyncHandler(async (req, res) => {
    const template = await Template.findById(req.params.id);

    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }

    // Allow deleting if it's a system template or if we are admin
    // Since this route is protected by protectAdmin, we just check if exists
    await template.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Get system templates (Public)
// @route   GET /api/templates/public
// @access  Public
const getPublicTemplates = asyncHandler(async (req, res) => {
    const templates = await Template.find({
        isSystem: true,
        status: 'published'
    }).sort({ createdAt: -1 });
    res.status(200).json(templates);
});

// @desc    Get public template by ID
// @route   GET /api/templates/public/:id
// @access  Public
const getPublicTemplateById = asyncHandler(async (req, res) => {
    const templateId = req.params.id.trim();
    // Fetching template logic
    try {
        const template = await Template.findById(templateId);
        if (!template) {
            res.status(404);
            throw new Error('Template not found');
        }
        res.status(200).json(template);
    } catch (error) {
        console.error(`Error fetching public template ${templateId}:`, error.message);
        res.status(404);
        throw new Error('Template not found');
    }
});

// @desc    Get template by ID
// @route   GET /api/templates/:id
// @access  Private
const getTemplateById = asyncHandler(async (req, res) => {
    const templateId = req.params.id.trim();
    // Base fetch logic
    const template = await Template.findById(templateId);

    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the template user OR it is a system template
    if (template.user.toString() !== req.user.id && !template.isSystem) {
        res.status(401);
        throw new Error('User not authorized');
    }

    res.status(200).json(template);
});

// @desc    Set template
// @route   POST /api/templates
// @access  Private
const setTemplate = asyncHandler(async (req, res) => {
    // Check limits for Free users
    if (req.user.activePlan === 'Free Demo') {
        const templateCount = await Template.countDocuments({ user: req.user.id });
        if (templateCount >= FREE_TEMPLATE_LIMIT) {
            res.status(403);
            throw new Error(`Free plan limit reached. You can only save up to ${FREE_TEMPLATE_LIMIT} templates. Please upgrade to Pro for more.`);
        }
    }

    if (!req.body.name) {
        res.status(400);
        throw new Error('Please include a template name');
    }

    // Check if Scene Graph or legacy JSON format
    const isSceneGraph = req.body.sceneGraph && req.body.sceneGraph.version && req.body.sceneGraph.root;

    if (!isSceneGraph && !req.body.canvasData) {
        res.status(400);
        throw new Error('Please include either sceneGraph or canvasData');
    }

    const templateData = {
        user: req.user.id,
        name: req.body.name,
        thumbnail: req.body.thumbnail,
        category: req.body.category || 'achievement',
    };

    if (isSceneGraph) {
        // New Scene Graph format
        templateData.sceneGraph = req.body.sceneGraph;
        templateData.dataFormat = 'sceneGraph';
        templateData.version = req.body.sceneGraph.version || '1.0.0';
    } else {
        // Legacy JSON format
        templateData.canvasData = req.body.canvasData;
        templateData.dataFormat = 'json';
    }

    const template = await Template.create(templateData);

    // Save to training data file (async, don't block response)
    const dataToSave = isSceneGraph ? req.body.sceneGraph : req.body.canvasData;
    await addTrainingEntry(req.body.name, req.body.category || 'achievement', dataToSave);

    res.status(200).json(template);
});

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private
const updateTemplate = asyncHandler(async (req, res) => {
    const template = await Template.findById(req.params.id);

    if (!template) {
        res.status(400);
        throw new Error('Template not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the template user
    if (template.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Prepare update data
    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.thumbnail) updateData.thumbnail = req.body.thumbnail;
    if (req.body.category) updateData.category = req.body.category;

    // Check if updating with Scene Graph
    const isSceneGraph = req.body.sceneGraph && req.body.sceneGraph.version && req.body.sceneGraph.root;

    if (isSceneGraph) {
        updateData.sceneGraph = req.body.sceneGraph;
        updateData.dataFormat = 'sceneGraph';
        updateData.version = req.body.sceneGraph.version || '1.0.0';
    } else if (req.body.canvasData) {
        updateData.canvasData = req.body.canvasData;
        updateData.dataFormat = 'json';
    }

    const updatedTemplate = await Template.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            new: true,
        }
    );

    res.status(200).json(updatedTemplate);
});

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private
const deleteTemplate = asyncHandler(async (req, res) => {
    const template = await Template.findById(req.params.id);

    if (!template) {
        res.status(400);
        throw new Error('Template not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the template user
    if (template.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await template.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Record a certificate download
// @route   POST /api/templates/download
// @access  Private
const recordDownload = asyncHandler(async (req, res) => {
    const { templateName, format, count = 1 } = req.body;
    const requestedCount = parseInt(count) || 1;

    // Get start of month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Count existing downloads this month FOR THE CURRENT PLAN ONLY
    const currentUsage = await Download.countDocuments({
        user: req.user.id,
        plan: req.user.activePlan,
        createdAt: { $gte: startOfMonth }
    });

    let limit = 0;
    let limitName = "";

    // Determine limit based on plan
    if (req.user.activePlan === 'Free Demo') {
        limit = FREE_DOWNLOAD_LIMIT;
        limitName = "Free limit";
    } else if (req.user.activePlan === 'Pro') {
        limit = 500; // Pro limit
        limitName = "Pro limit";
    } else {
        // Enterprise or others: Unlimited
        limit = Infinity;
    }

    // Check if request exceeds limit
    if (limit !== Infinity && (currentUsage + requestedCount > limit)) {
        const remaining = Math.max(0, limit - currentUsage);
        res.status(403);
        throw new Error(`Limit reached. You can only download ${remaining} more times on your current plan this month.`);
    }

    console.log(`[DOWNLOAD] User ${req.user.email} is downloading ${templateName} as ${format} (x${requestedCount}) on ${req.user.activePlan} plan`);

    if (!format) {
        res.status(400);
        throw new Error('Please include download format (PNG/PDF)');
    }

    // Record the downloads
    const downloadRecords = [];
    for (let i = 0; i < requestedCount; i++) {
        downloadRecords.push({
            user: req.user.id,
            templateName: templateName || 'Untitled Certificate',
            format,
            plan: req.user.activePlan, // Important: Record the plan at time of download
            createdAt: new Date()
        });
    }

    let result;
    if (downloadRecords.length > 0) {
        result = await Download.insertMany(downloadRecords);
        console.log(`[DOWNLOAD] Successfully recorded ${downloadRecords.length} downloads for ${req.user.email} on ${req.user.activePlan}`);
    }

    res.status(201).json({
        message: 'Downloads recorded successfully',
        count: requestedCount,
        usage: currentUsage + requestedCount,
        limit: limit === Infinity ? 'Unlimited' : limit
    });
});

// @desc    Save template layout override
// @route   POST /api/templates/layout-override
// @access  Private
const saveLayoutOverride = asyncHandler(async (req, res) => {
    const { templateId, layoutOverrides } = req.body;

    if (!templateId || !layoutOverrides) {
        res.status(400);
        throw new Error('Please include templateId and layoutOverrides');
    }

    // Check if user has permission
    if (!req.user.canLockLayout) {
        res.status(401);
        throw new Error('User not authorized to lock layouts');
    }

    // Find and update or create
    const override = await TemplateLayout.findOneAndUpdate(
        { templateId },
        {
            layoutOverrides,
            updatedBy: req.user.id
        },
        {
            new: true,
            upsert: true
        }
    );

    res.status(200).json(override);
});

// @desc    Get all template layout overrides
// @route   GET /api/templates/layout-overrides
// @access  Public
const getLayoutOverrides = asyncHandler(async (req, res) => {
    const overrides = await TemplateLayout.find({});
    res.status(200).json(overrides);
});

module.exports = {
    getTemplates,
    setTemplate,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    recordDownload,
    saveLayoutOverride,
    getLayoutOverrides,
    getSystemTemplates,
    createSystemTemplate,
    deleteSystemTemplate,
    updateSystemTemplate,
    getPublicTemplates,
    getPublicTemplateById,
};
