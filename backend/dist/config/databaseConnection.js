"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Create MySQL connection pool
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // Increase the connection timeout to 10 seconds
});
exports.pool = pool;
const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ MySQL Database Connected!");
        connection.release(); // Release the connection back to the pool
    }
    catch (error) {
        console.error(`❌ Database Connection Failed: ${error}`);
        process.exit(1); // Exit process with failure
    }
};
exports.connectDB = connectDB;
