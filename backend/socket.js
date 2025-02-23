import { Server } from "socket.io";

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true
        },
        pingTimeout: 60000, // 60 second timeout
        connectTimeout: 5000, // 5 second connection timeout
        transports: ['websocket', 'polling'] // Prefer WebSocket, fallback to polling
    });

    // Middleware for authentication if needed
    io.use((socket, next) => {
        try {
            // Add any authentication logic here if needed
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on("connection", (socket) => {
        try {
            console.log("🔌 New client connected:", socket.id);

            // Handle client disconnection
            socket.on("disconnect", (reason) => {
                console.log(`🔌 Client disconnected (${reason}):`, socket.id);
            });

            // Handle errors
            socket.on("error", (error) => {
                console.error("Socket error:", error);
            });

        } catch (error) {
            console.error("Error in socket connection handler:", error);
            socket.disconnect();
        }
    });

    // Handle server-side errors
    io.engine.on("connection_error", (error) => {
        console.error("Connection error:", error);
    });

    return io;
};

export default setupSocket;
