const mongoose = require('mongoose');
const Module = require('./models/Module');
const RegistrationLink = require('./models/RegistrationLink');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const setupTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/certify');
        console.log('Connected to MongoDB');

        // 1. Get or Create Admin
        let admin = await Admin.findOne({ email: 'hariharan040511@gmail.com' });
        if (!admin) {
            admin = await Admin.create({
                name: 'Hariharan',
                email: 'hariharan040511@gmail.com',
                password: 'password123'
            });
            console.log('Created Admin');
        }

        // 2. Create a Paid Module
        let module = await Module.findOne({ name: 'Local Test Module' });
        if (!module) {
            module = await Module.create({
                name: 'Local Test Module',
                userId: admin._id,
                isPaid: true,
                entryFee: 1, // 1 INR
                paymentConfig: {
                    razorpayKeyId: 'rzp_test_yourkeyhere', // REPLEACE WITH YOUR TEST KEY
                    razorpaySecret: '', // Leave empty to trigger safe fallback or re-save in UI
                    status: 'connected',
                    paymentMethod: 'checkout'
                }
            });
            console.log('Created Paid Module');
        }

        // 3. Create Registration Link
        let link = await RegistrationLink.findOne({ moduleId: module._id });
        if (!link) {
            link = await RegistrationLink.create({
                moduleId: module._id,
                customFields: [
                    { label: 'Full Name', type: 'text', required: true },
                    { label: 'Email Address', type: 'email', required: true }
                ]
            });
            console.log('Created Registration Link');
        }

        console.log('\n🚀 SETUP COMPLETE!');
        console.log('------------------');
        console.log('Test Registration URL:');
        console.log(`http://localhost:5173/register/${link.linkId}`);
        console.log('------------------');
        console.log('NOTE: Go to http://localhost:5174 (Admin) to save your actual Razorpay credentials for this module!');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

setupTest();
