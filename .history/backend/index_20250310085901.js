import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import studyMaterialRoutes from "./routes/StudyMaterialRoutes.js";
import userRoutes from "./routes/UserAccount.js";
import friendRoutes from "./routes/FriendRoutes.js";
import userInfoRoutes from "./routes/UserInfoRoutes.js";
<<<<<<< HEAD
import lobbyRoutes from "./routes/lobby.routes.js";
import battleRoutes from './routes/battle.routes.js';
import openAiRoutes from './routes/OpenAiRoutes.js';
=======
import adminRoutes from "./routes/admin/AdminRoutes.js"; // Import admin routes
import { corsMiddleware } from './middleware/CorsMiddleware.js'; // Import CORS middleware
import { coopMiddleware } from './middleware/CoopMiddleware.js'; // Import COOP middleware
>>>>>>> cfa57d4327f05816e98fd7fdf169bc5cd8f299fd
// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express App
const app = express();

// Use CORS middleware
app.use(corsMiddleware);

<<<<<<< HEAD
// Increase the JSON payload size limit (adjust the size as needed)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
=======
// Use COOP middleware
app.use(coopMiddleware);
>>>>>>> cfa57d4327f05816e98fd7fdf169bc5cd8f299fd

// Middleware
app.use(express.json());

// Add this before your routes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use("/api/study-material", studyMaterialRoutes);
app.use("/api/user", userRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/user-info", userInfoRoutes);
<<<<<<< HEAD
app.use("/api/lobby", lobbyRoutes);
app.use("/api/battle", battleRoutes);
app.use("/api/openai", openAiRoutes);
=======
app.use("/api/admin", adminRoutes); // Mount admin routes under /api/admin
>>>>>>> cfa57d4327f05816e98fd7fdf169bc5cd8f299fd

export default app;
