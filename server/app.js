import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

// Routes
app.use('/', authRoutes);

export default app;
