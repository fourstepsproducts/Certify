const express = require('express');
const router = express.Router();
const { getStats, recordPurchase, getAllUsers, cancelScheduledPlan, resetUserPlan, toggleLockLayoutPermission } = require('../controllers/adminController');
const { getSystemTemplates, createSystemTemplate, deleteSystemTemplate, updateSystemTemplate } = require('../controllers/templateController');
const { loginAdmin } = require('../controllers/adminAuthController');
const { protectAdmin, protect } = require('../middleware/authMiddleware');

// Public route
router.post('/login', loginAdmin);

// Protected admin routes
router.get('/stats', protectAdmin, getStats);
router.get('/users', protectAdmin, getAllUsers);
router.post('/toggle-layout-lock-permission', protectAdmin, toggleLockLayoutPermission);

// Template Management
router.get('/templates', protectAdmin, getSystemTemplates);
router.post('/templates', protectAdmin, createSystemTemplate);
router.delete('/templates/:id', protectAdmin, deleteSystemTemplate);
router.put('/templates/:id', protectAdmin, updateSystemTemplate);

// Protected user/admin route for mock purchase
router.post('/purchase', protect, recordPurchase);
router.post('/cancel-scheduled-plan', protect, cancelScheduledPlan);
router.post('/reset-user-plan', protectAdmin, resetUserPlan);

module.exports = router;
