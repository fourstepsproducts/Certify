const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");

const User = require("../models/User");
const Admin = require("../models/Admin");

async function seedAdmin() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env file");
        }
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Cleanup previous mistakes
        const prevEmail = 'fourstepsproducts@gmail.com';

        // Remove from User collection if still there
        await User.deleteOne({ email: prevEmail });
        await User.deleteOne({ email: process.env.ADMIN_EMAIL });

        // Remove the accidental admin from Admin collection
        await Admin.deleteOne({ email: prevEmail });

        // 2. Handle Admin collection
        const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

        if (existingAdmin) {
            console.log(`Admin (${process.env.ADMIN_EMAIL}) already exists in Admin collection. Updating password...`);
            existingAdmin.password = process.env.ADMIN_PASSWORD;
            existingAdmin.isSuperAdmin = process.env.ADMIN_IS_SUPER === "true";
            await existingAdmin.save();
            console.log("Admin updated successfully");
            process.exit();
        }

        const admin = new Admin({
            name: "Super Admin",
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            isSuperAdmin: process.env.ADMIN_IS_SUPER === "true"
        });

        await admin.save();

        console.log(`Admin (${process.env.ADMIN_EMAIL}) created successfully in Admin collection`);
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedAdmin();
