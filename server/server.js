import app from './app.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
    console.log(process.env.EMAIL_USER);  // Check if email user is correctly loaded
console.log(process.env.EMAIL_PASS);  // Check if email pass is correctly loaded
    await connectDB();

    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);
    });
};


startServer();
