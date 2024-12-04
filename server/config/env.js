import dotenv from 'dotenv';

dotenv.config();

export const env = {
    mongoUrl: process.env.MONGO_URL,
    jwtSecret: process.env.JWT_SECRET,
    port: process.env.PORT || 8000,
};
