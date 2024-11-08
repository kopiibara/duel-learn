const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const { mongoose } = require('mongoose');
const app = express();
const cookieParser = require('cookie-parser');

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
    origin: 'http://localhost:5173',  // Update with your frontend URL
    credentials: true                 // Allow cookies to be sent
}));

// Routes
app.use('/', require('./routes/authRoutes'));

// Add the /welcome route
app.get('/welcome', (req, res) => {
    res.send("Welcome!");
});

const port = 8000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
