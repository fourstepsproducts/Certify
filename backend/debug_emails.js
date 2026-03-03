const mongoose = require('mongoose');
require('dotenv').config();

const Registration = require('./models/Registration');
const Feedback = require('./models/Feedback');
const Module = require('./models/Module');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/certificate-canvas');
        console.log('Connected to DB');

        const modules = await Module.find({});

        for (const mod of modules) {
            console.log(`\n==================================================`);
            console.log(`Module: ${mod.name} (ID: ${mod._id})`);
            console.log(`==================================================`);

            const registrations = await Registration.find({ moduleId: mod._id });
            console.log(`\n[Registrations: ${registrations.length}]`);
            if (registrations.length === 0) console.log('  None');
            registrations.forEach(r => console.log(`  - ${r.email} (${r.name})`));

            const feedbacks = await Feedback.find({ moduleId: mod._id });
            console.log(`\n[Feedback Submissions: ${feedbacks.length}]`);
            if (feedbacks.length === 0) console.log('  None');
            feedbacks.forEach(f => console.log(`  - ${f.email}`));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDone.');
    }
}

run();
