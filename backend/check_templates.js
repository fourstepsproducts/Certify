const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const Template = require('./models/Template');
const User = require('./models/User');

const checkTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const templates = await Template.find({});
        console.log(`Total Templates in DB: ${templates.length}`);

        if (templates.length > 0) {
            console.log('First 3 Templates:');
            templates.slice(0, 3).forEach(t => {
                console.log(`- ID: ${t._id}, Name: ${t.name}, User: ${t.user}`);
            });
        } else {
            console.log('No templates found in the database.');
        }

        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => console.log(`- User: ${u.email} (ID: ${u._id})`));

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkTemplates();
