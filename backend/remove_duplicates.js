const mongoose = require('mongoose');
require('dotenv').config();

const Registration = require('./models/Registration');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/certificate-canvas');
        console.log('Connected to DB');

        const registrations = await Registration.find({});
        const map = new Map();
        const duplicates = [];

        for (const reg of registrations) {
            const key = `${reg.moduleId}-${reg.email.toLowerCase()}`;
            if (map.has(key)) {
                duplicates.push(reg._id);
            } else {
                map.set(key, true);
            }
        }

        if (duplicates.length > 0) {
            console.log(`Found ${duplicates.length} duplicate registrations. Deleting...`);
            await Registration.deleteMany({ _id: { $in: duplicates } });
            console.log('Duplicates deleted.');
        } else {
            console.log('No duplicates found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
}

run();
