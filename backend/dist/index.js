"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const databaseConnection_1 = require("./config/databaseConnection"); // Ensure correct path
// import userRoutes from "./routes/userRoutes"; // If using ES module syntax
// Load environment variables
dotenv_1.default.config();
// Connect to Database
(0, databaseConnection_1.connectDB)();
// Initialize Express App
const app = (0, express_1.default)(); // Explicitly type Express app
// Middleware
app.use(express_1.default.json());
// Routes
// app.use("/api/users", userRoutes); // Uncomment when needed
exports.default = app;
