const express = require('express');
const router = express.Router();
const {
    getUploads,
    createUpload,
    deleteUpload
} = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getUploads)
    .post(protect, createUpload);

router.route('/:id')
    .delete(protect, deleteUpload);

module.exports = router;
