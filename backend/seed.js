import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import User from "./models/User.js";
import Teacher from "./models/Teacher.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Teacher.deleteMany();

    /* ===============================
       CREATE USERS
    ================================= */

    const faculty1 = await User.create({
      username: "nihal",
      email: "faculty1@test.com",
      password: "admin123", // plain password
      role: "faculty",
      department: "IT",
    });

    const faculty2 = await User.create({
      username: "ayush",
      email: "faculty2@test.com",
      password: "admin123", // plain
      role: "faculty",
      department: "CSE",
    });

    const faculty3 = await User.create({
      username: "arpit",
      email: "faculty3@test.com",
      password: "admin123", // plain
      role: "faculty",
      department: "CSE",
    });

    const admin = await User.create({
        username: "admin",
        email: "admin@test.com",
        password: "admin123", // plain
        role: "admin",
        department: "CSE",
      });

    /* ===============================
       CREATE TEACHERS
    ================================= */

    await Teacher.create({
      name: "Dr. Sharma",
      department: "CSE",
      email: "faculty1@test.com",
      subjects: [],
      maxHoursPerDay: 4,
      availability: [],
    });

    await Teacher.create({
      name: "Dr. Verma",
      department: "CSE",
      email: "faculty2@test.com",
      subjects: [],
      maxHoursPerDay: 4,
      availability: [],
    });

    console.log("🌱 Database Seeded Successfully");
    process.exit();

  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();