//server.js on backend
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./index.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Adjust to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`⚡ New client connected: ${socket.id}`);

  socket.on("message", (msg) => {
    console.log(`📩 Message received: ${msg}`);
    io.emit("message", msg); // Broadcast message to all clients
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});
