import { Server } from "socket.io";

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true
        },
        pingTimeout: 60000,
        connectTimeout: 5000,
        transports: ['websocket', 'polling'],
        // Add error handling and reconnection logic
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    // Handle server-side socket errors
    io.on("connect_error", (err) => {
        console.log(`Connection error due to ${err.message}`);
    });

    io.on("connection", (socket) => {
        console.log("🔌 New client connected:", socket.id);

        // Listen for new study material creation
        socket.on("newStudyMaterial", (data) => {
            try {
                console.log("📚 New study material received:", data);
                io.emit("broadcastStudyMaterial", data);
            } catch (error) {
                console.error("Error broadcasting study material:", error);
                socket.emit("error", "Failed to broadcast study material");
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`🔌 Client disconnected (${reason}):`, socket.id);
        });

        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });
    });

    // Global error handler for the io server
    io.engine.on("connection_error", (error) => {
        console.error("Connection error:", error);
    });

    return io;
};

export default setupSocket;
