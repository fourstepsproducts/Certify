const express = require('express');
const router = express.Router();
const {
    getTemplates,
    setTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    recordDownload,
    saveLayoutOverride,
    getLayoutOverrides,
    getPublicTemplates,
    getPublicTemplateById // Import
} = require('../controllers/templateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/public', getPublicTemplates);
router.get('/public/:id', getPublicTemplateById);
router.get('/layout-overrides', getLayoutOverrides); // Move up

router.route('/')
    .get(protect, getTemplates)
    .post(protect, setTemplate);

router.post('/download', protect, recordDownload);
router.post('/layout-override', protect, saveLayoutOverride);

router.route('/:id')
    .get(protect, getTemplateById)
    .delete(protect, deleteTemplate)
    .put(protect, updateTemplate);

module.exports = router;
