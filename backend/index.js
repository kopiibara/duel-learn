
const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const cors = require('cors');  // Import CORS package
const studyMaterialRoutes = require('./routes/StudyMaterial');
const userRoutes = require('./routes/UserAccount'); // Import user routes

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express App
const app = express();

// Enable CORS for all routes (you can adjust this to be more specific)
app.use(cors({
    origin: 'http://localhost:5173',
}
));

// Middleware 
app.use(express.json());

// Routes
app.use('/api/studyMaterial', studyMaterialRoutes);
app.use('/api/user', userRoutes); // Use user routes




module.exports = app;
