const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
    createModule,
    getModules,
    getModuleById,
    deleteModule,
    updateModule
} = require('../controllers/moduleController');

// Protect all routes with JWT authentication
const protect = passport.authenticate('jwt', { session: false });

router.route('/')
    .post(protect, createModule)
    .get(protect, getModules);

router.route('/:id')
    .get(protect, getModuleById)
    .put(protect, updateModule)
    .delete(protect, deleteModule);

module.exports = router;
