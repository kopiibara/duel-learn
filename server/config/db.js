import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URL);
        console.log('Database is connected');
    } catch (err) {
        console.error('Database connection failed', err);
        process.exit(1);
    }
};

export default connectDB;
