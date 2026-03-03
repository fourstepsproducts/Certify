const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// @desc    Seed admin user
// @route   None (Internal / Boot)
const seedAdmin = async () => {
    try {
        const adminEmail = 'hariharan040511@gmail.com';
        const adminExists = await Admin.findOne({ email: adminEmail });

        if (!adminExists) {
            await Admin.create({
                name: 'Hariharan',
                email: adminEmail,
                password: '123456', // Will be hashed in pre-save hook
            });
            console.log('✅ Admin user seeded successfully');
        } else {
            console.log('ℹ️ Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};

// @desc    Authenticate admin
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            token: generateToken(admin._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    seedAdmin,
    loginAdmin,
};
