const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Import User model AFTER dotenv config
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding...");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin already exists:");
      console.log(`Email: ${existingAdmin.email}`);
      console.log("Seeder skipped.");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user directly
    const admin = new User({
      fullName: "System Administrator",
      email: "admin@qrattendance.com",
      password: "Admin@123",
      role: "admin",
      isActive: true,
    });

    await admin.save();

    console.log("Admin created successfully!");
    console.log("================================");
    console.log("Admin Login Credentials:");
    console.log("Email:    admin@qrattendance.com");
    console.log("Password: Admin@123");
    console.log("================================");
    console.log("Please change the password after first login!");

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error("Seeder Error:", error.message);
    console.error("Full error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();