import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

// Database connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Database is connected");
    })
    .catch((err) => {
        console.log("Database is not connected", err);
    });

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Updated CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',  // Replace with your frontend URL
    credentials: true,                // Allow credentials (cookies)
}));


// Routes
import authRoutes from './routes/authRoutes.js'; // Ensure this file exists and is correct
app.use('/', authRoutes);

// Add the /welcome route
app.get('/welcome', (req, res) => {
    res.send("Welcome!");
});

// Set the server port
const port = 8000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
