const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const seedAdmin = async () => {
    try {
        await User.deleteMany({ email: 'admin@company.com' }); // Clear any existing

        const adminUser = await User.create({
            name: 'System Admin',
            email: 'admin@company.com',
            password: 'password123',
            role: 'manager',
            department: 'Administration',
            joiningDate: new Date()
        });

        console.log('✅ Default Manager (Admin) Created Successfully!');
        console.log('------------------------------------------------');
        console.log('Email:    admin@company.com');
        console.log('Password: password123');
        console.log('------------------------------------------------');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
