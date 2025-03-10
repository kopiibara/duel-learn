import cors from 'cors'; // Import the cors package

// Use CORS middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL // Use environment variable in production
    : 'http://localhost:5173', // Default for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', 'cache-control', 'pragma'], // Added pragma header
  credentials: true, // Allow credentials (cookies, authorization headers, etc)
};

export const corsMiddleware = cors(corsOptions);
