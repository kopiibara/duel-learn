"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const route_1 = __importDefault(require("./routes/study-materials/route")); // Adjust the path accordingly
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors")); // Import the cors package
dotenv_1.default.config();
const app = (0, express_1.default)();
// Enable CORS to allow requests from your frontend (assuming it's running on localhost:3000)
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Specify the frontend URL
    methods: ["GET", "POST"], // Specify allowed HTTP methods
}));
app.use(express_1.default.json()); // Middleware to parse JSON request bodies
// Mount the studyMaterialRouter at /api
app.use("/api", route_1.default);
// Test a basic route to verify the server is running
app.get("/", (req, res) => {
    res.send("Server is up and running!");
});
exports.default = app; // This is important for server.ts to import and run
