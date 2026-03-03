const mongoose = require('mongoose');
const Feedback = require('./models/Feedback');
require('dotenv').config();

const removeDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/certificate-canvas');
        console.log('MongoDB Connected');

        // Find duplicates
        const duplicates = await Feedback.aggregate([
            {
                $group: {
                    _id: { moduleId: "$moduleId", email: "$email" },
                    count: { $sum: 1 },
                    ids: { $push: "$_id" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        console.log(`Found ${duplicates.length} sets of duplicates`);

        for (const set of duplicates) {
            // Keep the latest one, remove others
            // ids are pushed in order of encounter, but let's sort to be safe if we want latest
            // Actually, let's keep the *failed* ones (or just keep the first one). 
            // Usually we keep the latest.

            // Fetch docs to sort by date
            const docs = await Feedback.find({ _id: { $in: set.ids } }).sort({ submittedAt: -1 });

            // Keep docs[0] (latest), remove the rest
            const toRemove = docs.slice(1);

            for (const doc of toRemove) {
                await Feedback.findByIdAndDelete(doc._id);
                console.log(`Removed duplicate feedback for ${set._id.email} (ID: ${doc._id})`);
            }
        }

        console.log('Duplicate cleanup complete');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

removeDuplicates();
