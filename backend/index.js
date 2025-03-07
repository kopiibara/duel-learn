import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors"; // Import CORS package
import studyMaterialRoutes from "./routes/StudyMaterialRoutes.js";
import userRoutes from "./routes/UserAccount.js";
import friendRoutes from "./routes/FriendRoutes.js";
import userInfoRoutes from "./routes/UserInfoRoutes.js";
import lobbyRoutes from "./routes/lobby.routes.js";
import battleRoutes from './routes/battle.routes.js';
// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express App
const app = express();

const allowedOrigins = [process.env.FRONTEND_URL];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

// Increase the JSON payload size limit (adjust the size as needed)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use("/api/lobby", lobbyRoutes);
console.log("Registering battle routes...");
app.use("/api/battle", battleRoutes);

export default app;
