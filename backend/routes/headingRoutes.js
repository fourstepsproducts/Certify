const express = require('express');
const router = express.Router();
const {
    createHeading,
    getHeadings,
    deleteHeading,
    updateHeading
} = require('../controllers/headingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getHeadings)
    .post(protect, createHeading);

router.route('/:id')
    .delete(protect, deleteHeading)
    .put(protect, updateHeading);

module.exports = router;
