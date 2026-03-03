const mongoose = require('mongoose');
const Registration = require('./models/Registration');
const fs = require('fs');
require('dotenv').config();

const checkRegistrations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/certificate-canvas');

        const registrations = await Registration.find().sort({ submittedAt: -1 });

        let output = `Found ${registrations.length} registrations:\n`;
        registrations.forEach(reg => {
            output += `- Email: ${reg.email || 'N/A'}, Name: ${reg.name || 'N/A'}, ModuleId: ${reg.moduleId}\n`;
        });

        fs.writeFileSync('registrations_list.txt', output);
        // console.log('Done');
        process.exit();
    } catch (error) {
        fs.writeFileSync('registrations_list.txt', 'Error: ' + error.message);
        process.exit(1);
    }
};

checkRegistrations();
