import express, { Application } from "express";
import dotenv from "dotenv";
import { pool, connectDB } from "./config/databaseConnection"; // Ensure correct path
// import userRoutes from "./routes/userRoutes"; // If using ES module syntax

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express App
const app: Application = express(); // Explicitly type Express app

// Middleware
app.use(express.json());

// Routes
// app.use("/api/users", userRoutes); // Uncomment when needed

export default app;
