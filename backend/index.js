//index.js on backend
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cors from 'cors';  // Import CORS package
import studyMaterialRoutes from './routes/StudyMaterial.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express App
const app = express();

// Enable CORS for all routes (you can adjust this to be more specific)
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


// Middleware 
app.use(express.json());

// Routes
app.use('/api/study-material', studyMaterialRoutes);




export default app;
