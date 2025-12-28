const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken, authenticateToken } = require("../middleware/auth");

// Seed default users (run once on server start)
const seedUsers = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ email: "123@gmail.com" });
    if (!adminExists) {
      await User.create({
        email: "123@gmail.com",
        password: "123",
        role: "admin",
      });
      console.log("Admin user created: 123@gmail.com");
    }

    // Check if staff exists
    const staffExists = await User.findOne({ email: "user@gmail.com" });
    if (!staffExists) {
      await User.create({
        email: "user@gmail.com",
        password: "123",
        role: "staff",
      });
      console.log("Staff user created: user@gmail.com");
    }

    // Check if visitor/recruiter demo account exists
    const visitorExists = await User.findOne({ email: "visitor@gmail.com" });
    if (!visitorExists) {
      await User.create({
        email: "visitor@gmail.com",
        password: "visitor123",
        role: "visitor",
      });
      console.log(
        "Visitor user created: visitor@gmail.com (for recruiter demos)"
      );
    }

    // Check if visitor-staff (recruiter demo with staff access) exists
    const visitorStaffExists = await User.findOne({
      email: "visitor-staff@gmail.com",
    });
    if (!visitorStaffExists) {
      await User.create({
        email: "visitor-staff@gmail.com",
        password: "visitor123",
        role: "visitor-staff",
      });
      console.log(
        "Visitor-Staff user created: visitor-staff@gmail.com (for recruiter demos with staff access)"
      );
    }
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Get current user info
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Verify token endpoint
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = { router, seedUsers };
