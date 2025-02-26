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

    // Store active user connections
    const activeUsers = new Map();

    // Handle server-side socket errors
    io.on("connect_error", (err) => {
        console.log(`Connection error due to ${err.message}`);
    });

    io.on("connection", (socket) => {
        console.log("🔌 New client connected:", socket.id);

        // Add user to a room based on their firebase_uid
        socket.on("setup", (username) => {
            if (!username) {
                console.error("Invalid firebase_uid in setup");
                return;
            }

            // Store the user's socket mapping
            activeUsers.set(username, socket.id);
            socket.username = username; // Store uid in socket for easy access

            socket.join(username);
            console.log("👤 User joined room:", username);
        });

        // Handle friend requests with improved error handling and logging
        socket.on("sendFriendRequest", (data) => {
            try {
                const { sender_id, receiver_id, senderUsername } = data;

                if (!sender_id || !receiver_id || !senderUsername) {
                    throw new Error("Missing required friend request data");
                }

                console.log("📨 New friend request:", {
                    from: senderUsername,
                    sender_id,
                    to: receiver_id
                });

                // Emit to the receiver's room
                io.to(receiver_id).emit("newFriendRequest", {
                    sender_id,
                    senderUsername
                });

                // Confirm to sender that request was sent
                socket.emit("friendRequestSent", {
                    success: true,
                    receiver_id
                });

            } catch (error) {
                console.error("Error processing friend request:", error);
                socket.emit("error", {
                    type: "friendRequest",
                    message: "Failed to send friend request",
                    details: error.message
                });
            }
        });

        // Listen for new study material creation
        socket.on("newStudyMaterial", (data) => {
            try {
                if (!data || !data.content) {
                    throw new Error("Invalid study material data");
                }

                console.log("📚 New study material received:", data);
                io.emit("broadcastStudyMaterial", data);
            } catch (error) {
                console.error("Error broadcasting study material:", error);
                socket.emit("error", {
                    type: "studyMaterial",
                    message: "Failed to broadcast study material",
                    details: error.message
                });
            }
        });

        // Handle disconnection
        socket.on("disconnect", (reason) => {
            if (socket.username) {
                activeUsers.delete(socket.username);
                console.log(`👋 User ${socket.username} disconnected (${reason})`);
            }
            console.log(`🔌 Client disconnected (${reason}):`, socket.id);
        });

        // Generic error handler
        socket.on("error", (error) => {
            console.error("Socket error for user:", socket.username, error);
            socket.emit("error", {
                message: "An unexpected error occurred",
                details: error.message
            });
        });
    });

    // Global error handler for the io server
    io.engine.on("connection_error", (error) => {
        console.error("Connection error:", error);
    });

    return io;
};

export default setupSocket;
