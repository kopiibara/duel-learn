import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"; // Use testDBConnection instead of connectDB
import studyMaterialRoutes from "./routes/StudyMaterialRoutes.js";
import userRoutes from "./routes/UserAccount.js";
import friendRoutes from "./routes/FriendRoutes.js";
import userInfoRoutes from "./routes/UserInfoRoutes.js";
import lobbyRoutes from "./routes/lobby.routes.js";
import battleRoutes from "./routes/battle.routes.js";
import gameplayRoutes from "./routes/gameplay.routes.js";
import openAiRoutes from "./routes/OpenAiRoutes.js";
import searchRoutes from "./routes/SearchRoutes.js";
import adminRoutes from "./routes/admin/AdminRoutes.js";
import ocrRoutes from "./routes/OcrRoutes.js";
import { corsMiddleware } from "./middleware/CorsMiddleware.js";
import { coopMiddleware } from "./middleware/CoopMiddleware.js";

// Load environment variables
dotenv.config();

// Test MySQL Connection
await connectDB();  // Ensures the database is connected before starting Express

// Initialize Express App
const app = express();

// Use CORS middleware
app.use(corsMiddleware);

// Use COOP middleware
app.use(coopMiddleware);

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Add logging middleware (optional for debugging)
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url}`);
  next();
});

// Routes
app.use("/api/study-material", studyMaterialRoutes);
app.use("/api/user", userRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/user-info", userInfoRoutes);
app.use("/api/lobby", lobbyRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/battle", battleRoutes);
app.use("/api/gameplay", gameplayRoutes);
app.use("/api/openai", openAiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ocr", ocrRoutes);

// Start the Server (For Local Development)
if (process.env.NODE_ENV !== "vercel") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app; // Required for Vercel Deployment
