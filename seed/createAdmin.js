const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("../models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jms_school");

    const email = process.env.ADMIN_EMAIL || "admin@jmsschool.com";
    const password = process.env.ADMIN_PASSWORD || "Admin@123";
    const existing = await User.findOne({ email });

    if (existing) {
      existing.password = password;
      existing.name = "JMS Admin";
      existing.role = "admin";
      await existing.save();
      console.log(`Admin credentials reset: ${existing.email}`);
      process.exit(0);
    }

    const admin = await User.create({
      name: "JMS Admin",
      email,
      password,
      role: "admin",
    });

    console.log(`Admin created: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

seedAdmin();
