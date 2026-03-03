const User = require('../models/User');
const Template = require('../models/Template');
const Purchase = require('../models/Purchase');
const Download = require('../models/Download');

// @desc    Get all stats for admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        // Count actual downloads instead of template templates
        const totalDownloads = await Download.countDocuments();

        const purchases = await Purchase.find({ status: 'completed' });
        const totalRevenue = purchases.reduce((acc, curr) => acc + curr.amount, 0);

        // Fetch recent activities (Downloads)
        const recentDownloads = await Download.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name');

        const recentActivities = recentDownloads.map(d => ({
            id: d._id,
            type: 'Certificate Generated',
            user: d.user ? d.user.name : 'Unknown User',
            time: d.createdAt,
            status: 'Completed'
        }));

        res.json({
            success: true,
            data: {
                totalUsers,
                totalCertificates: totalDownloads,
                totalRevenue,
                recentActivities
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Record a mock purchase
// @route   POST /api/admin/purchase
// @access  Private
const recordPurchase = async (req, res) => {
    try {
        const { amount, planName, userId } = req.body;

        if (!planName || !userId) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const PLAN_WEIGHTS = {
            'Free Demo': 0,
            'Pro': 1,
            'Enterprise': 2
        };

        const currentWeight = PLAN_WEIGHTS[user.activePlan] || 0;
        const newWeight = PLAN_WEIGHTS[planName] || 0;

        const PLAN_PRICES = {
            'Free Demo': 0,
            'Pro': 19,
            'Enterprise': 49
        };

        const now = new Date();
        const total_days = 30;

        // Helper to set billing cycle
        const getNextBillingDate = () => {
            const date = new Date();
            date.setDate(date.getDate() + 30);
            return date;
        };

        let purchase = null;
        let message = '';

        if (newWeight > currentWeight) {
            // UPGRADE: Immediate effect
            let charge_amount = 0;

            if (currentWeight === 0 || !user.billingCycleEnd) {
                // First time purchase or free account
                charge_amount = PLAN_PRICES[planName];
                user.billingCycleEnd = getNextBillingDate();
            } else {
                // Prorated Upgrade
                const cycleEnd = new Date(user.billingCycleEnd);
                const remaining_ms = cycleEnd.getTime() - now.getTime();
                const remaining_days = Math.max(0, Math.ceil(remaining_ms / (1000 * 60 * 60 * 24)));

                const old_price = PLAN_PRICES[user.activePlan] || 0;
                const new_price = PLAN_PRICES[planName];

                // Formula: (new_price - old_price) / 30 * remaining_days
                charge_amount = ((new_price - old_price) / total_days) * remaining_days;
                charge_amount = Math.max(0, parseFloat(charge_amount.toFixed(2)));

                // user.billingCycleEnd STAYS THE SAME for upgrades
            }

            const oldPlan = user.activePlan;
            user.activePlan = planName;
            user.scheduledPlan = undefined; // Clear any pending downgrade

            purchase = await Purchase.create({
                user: userId,
                amount: charge_amount,
                planName: planName,
                description: oldPlan === 'Free Demo'
                    ? `New subscription to ${planName}`
                    : `Upgraded from ${oldPlan} to ${planName} (Prorated)`,
                status: 'completed',
                paymentId: `mock_${Math.random().toString(36).substr(2, 9)}`
            });

            message = `Upgraded to ${planName}. Charged $${charge_amount}`;

        } else if (newWeight < currentWeight) {
            // DOWNGRADE: Scheduled for next cycle
            if (user.activePlan === 'Free Demo') {
                user.activePlan = planName;
            } else {
                const oldPlan = user.activePlan;
                user.scheduledPlan = planName;

                // Create a log entry for the downgrade scheduling
                await Purchase.create({
                    user: userId,
                    amount: 0,
                    planName: planName,
                    description: `Downgrade scheduled from ${oldPlan} to ${planName}`,
                    status: 'completed',
                    paymentId: `memo_${Math.random().toString(36).substr(2, 9)}`
                });

                message = `Downgrade to ${planName} scheduled for end of billing cycle`;
            }
            // No immediate purchase record for downgrade (unless we want to track $0 invoice?)
            // We'll skip creating a purchase record for now.

        } else {
            // SAME PLAN or invalid
            return res.status(400).json({ success: false, message: 'You are already on this plan' });
        }

        await user.save();

        res.status(201).json({
            success: true,
            data: purchase,
            message: message,
            user: {
                activePlan: user.activePlan,
                scheduledPlan: user.scheduledPlan,
                billingCycleEnd: user.billingCycleEnd
            }
        });
    } catch (error) {
        console.error('Purchase Recording Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const cancelScheduledPlan = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Missing userId' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.scheduledPlan = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Scheduled downgrade cancelled',
            user: {
                activePlan: user.activePlan,
                scheduledPlan: user.scheduledPlan,
                billingCycleEnd: user.billingCycleEnd
            }
        });
    } catch (error) {
        console.error('Cancel Scheduled Plan Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const resetUserPlan = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Missing userId' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.activePlan = 'Free Demo';
        user.scheduledPlan = undefined;
        user.billingCycleEnd = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User plan reset to Free Demo',
            user: {
                activePlan: user.activePlan,
                scheduledPlan: user.scheduledPlan,
                billingCycleEnd: user.billingCycleEnd
            }
        });
    } catch (error) {
        console.error('Reset User Plan Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const toggleLockLayoutPermission = async (req, res) => {
    try {
        const { userId, canLockLayout } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Missing userId' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.canLockLayout = canLockLayout;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Layout lock permission ${canLockLayout ? 'granted' : 'revoked'}`,
            data: {
                canLockLayout: user.canLockLayout
            }
        });
    } catch (error) {
        console.error('Toggle Layout Lock Permission Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getStats,
    recordPurchase,
    getAllUsers,
    cancelScheduledPlan,
    resetUserPlan,
    toggleLockLayoutPermission
};
