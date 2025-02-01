const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db.js");
// const userRoutes = require("./routes/userRoutes.js");

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());

// Routes
// app.use("/api/users", userRoutes);

module.exports = app;
