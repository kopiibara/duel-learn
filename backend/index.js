import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import studyMaterialRoutes from "./routes/StudyMaterialRoutes.js";
import userRoutes from "./routes/UserAccount.js";
import friendRoutes from "./routes/FriendRoutes.js";
import userInfoRoutes from "./routes/UserInfoRoutes.js";
import adminRoutes from "./routes/admin/AdminRoutes.js"; // Import admin routes
import { corsMiddleware } from './middleware/CorsMiddleware.js'; // Import CORS middleware
import { coopMiddleware } from './middleware/CoopMiddleware.js'; // Import COOP middleware
// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express App
const app = express();

// Use CORS middleware
app.use(corsMiddleware);

// Use COOP middleware
app.use(coopMiddleware);

// Middleware
app.use(express.json());

// Routes
app.use("/api/study-material", studyMaterialRoutes);
app.use("/api/user", userRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/user-info", userInfoRoutes);
app.use("/api/admin", adminRoutes); // Mount admin routes under /api/admin

export default app;
