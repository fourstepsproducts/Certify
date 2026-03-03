const asyncHandler = require('express-async-handler');
const Upload = require('../models/Upload');

// @desc    Get user uploads
// @route   GET /api/uploads
// @access  Private
const getUploads = asyncHandler(async (req, res) => {
    const uploads = await Upload.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(uploads);
});

// @desc    Create new upload
// @route   POST /api/uploads
// @access  Private
const createUpload = asyncHandler(async (req, res) => {
    const { data, name, type } = req.body;

    if (!data) {
        res.status(400);
        throw new Error('Please include data');
    }

    const upload = await Upload.create({
        user: req.user.id,
        data,
        name: name || 'Uploaded Image',
        type: type || 'image'
    });

    res.status(201).json(upload);
});

// @desc    Delete upload
// @route   DELETE /api/uploads/:id
// @access  Private
const deleteUpload = asyncHandler(async (req, res) => {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
        res.status(404);
        throw new Error('Upload not found');
    }

    // Check for user
    if (upload.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await upload.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getUploads,
    createUpload,
    deleteUpload
};
