import express from "express";
import studyMaterialRouter from "./routes/study-materials/route"; // Adjust the path accordingly
import dotenv from "dotenv";
import cors from "cors"; // Import the cors package

dotenv.config();

const app = express();

// Enable CORS to allow requests from your frontend (assuming it's running on localhost:3000)
app.use(
  cors({
    origin: "http://localhost:5173", // Specify the frontend URL
    methods: ["GET", "POST"], // Specify allowed HTTP methods
  })
);

app.use(express.json()); // Middleware to parse JSON request bodies

// Mount the studyMaterialRouter at /api
app.use("/api", studyMaterialRouter);

// Test a basic route to verify the server is running
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

export default app; // This is important for server.ts to import and run
