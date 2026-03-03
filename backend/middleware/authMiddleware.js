const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Admin = require('../models/Admin'); // Add Admin model

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token - Check both collections
            // Include password so .save() doesn't fail validation if we need to update billing
            req.user = await User.findById(decoded.id);
            if (!req.user) {
                req.user = await Admin.findById(decoded.id);
            }

            // Check for scheduled plan changes if billing cycle has ended
            if (req.user && req.user.billingCycleEnd && new Date() > new Date(req.user.billingCycleEnd)) {
                if (req.user.scheduledPlan) {
                    req.user.activePlan = req.user.scheduledPlan;
                    req.user.scheduledPlan = undefined;

                    // If switching to a paid plan (not Free Demo), usually we'd charge here.
                    // For this mock implementation, we'll reset the cycle if it's a paid plan, 
                    // or clear it if it's free.
                    const isFree = req.user.activePlan === 'Free Demo';
                    if (!isFree) {
                        const nextMonth = new Date();
                        nextMonth.setDate(nextMonth.getDate() + 30);
                        req.user.billingCycleEnd = nextMonth;
                    } else {
                        req.user.billingCycleEnd = undefined;
                    }

                    await req.user.save();
                }
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error('Not authorized');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const protectAdmin = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check in Admin collection instead of User
            const Admin = require('../models/Admin');
            req.user = await Admin.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized as an admin');
            }

            next();
        } catch (error) {
            console.error('Admin Auth Error:', error.message);
            res.status(401);
            throw new Error('Not authorized, admin token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no admin token');
    }
});

module.exports = { protect, protectAdmin };
