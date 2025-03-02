import { Server } from "socket.io";

let io;

const setupSocket = (server) => {
    io = new Server(server, {
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
        socket.on("setup", (userId) => {
            if (!userId) {
                console.error("Invalid userId in setup");
                return;
            }

            // Store the user's socket mapping
            activeUsers.set(userId, socket.id);
            socket.userId = userId; // Store uid in socket for easy access

            socket.join(userId);
            console.log("👤 User joined room:", userId);
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

        // Update the acceptFriendRequest handler to include more detailed information
        socket.on("acceptFriendRequest", (data) => {
            try {
                const { sender_id, receiver_id, senderInfo, receiverInfo } = data;

                console.log("Socket: Processing friend request acceptance", {
                    sender_id,
                    receiver_id,
                    senderInfo: senderInfo ? {
                        username: senderInfo.username,
                        uid: senderInfo.firebase_uid || senderInfo.uid
                    } : 'missing',
                    receiverInfo: receiverInfo ? {
                        username: receiverInfo.username,
                        uid: receiverInfo.firebase_uid || receiverInfo.uid
                    } : 'missing'
                });

                if (!sender_id || !receiver_id) {
                    throw new Error("Missing required sender or receiver ID");
                }

                // Notify sender - send receiver's info
                if (activeUsers.has(sender_id)) {
                    console.log(`Notifying sender ${sender_id} about accepted request`);
                    io.to(sender_id).emit("friendRequestAccepted", {
                        newFriend: receiverInfo || { firebase_uid: receiver_id }
                    });
                } else {
                    console.log(`Sender ${sender_id} is not active, cannot notify`);
                }

                // Notify receiver - send sender's info
                if (activeUsers.has(receiver_id)) {
                    console.log(`Notifying receiver ${receiver_id} about accepted request`);
                    io.to(receiver_id).emit("friendRequestAccepted", {
                        newFriend: senderInfo || { firebase_uid: sender_id }
                    });
                } else {
                    console.log(`Receiver ${receiver_id} is not active, cannot notify`);
                }
            } catch (error) {
                console.error("Error handling friend request acceptance:", error);
                socket.emit("error", { message: "Failed to process friend acceptance", details: error.message });
            }
        });

        // Handle friend request rejection
        socket.on("rejectFriendRequest", (data) => {
            try {
                const { sender_id, receiver_id } = data;

                if (!sender_id || !receiver_id) {
                    throw new Error("Missing required friend rejection data");
                }

                console.log("❌ Friend request rejected:", {
                    sender_id,
                    receiver_id
                });

                // Notify both users about the rejection
                io.to(sender_id).emit("friendRequestRejected", {
                    sender_id,
                    receiver_id
                });
                io.to(receiver_id).emit("friendRequestRejected", {
                    sender_id,
                    receiver_id
                });

            } catch (error) {
                console.error("Error processing friend rejection:", error);
                socket.emit("error", {
                    type: "friendRejection",
                    message: "Failed to process friend rejection",
                    details: error.message
                });
            }
        });

        // Handle friend removal
        socket.on("removeFriend", (data) => {
            try {
                const { sender_id, receiver_id } = data;

                if (!sender_id || !receiver_id) {
                    throw new Error("Missing required friend removal data");
                }

                console.log("❌ Friend removed:", {
                    remover_id: sender_id,
                    removed_id: receiver_id
                });

                // Notify both users about the friend removal
                io.to(sender_id).emit("friendRemoved", {
                    removedFriendId: receiver_id
                });
                io.to(receiver_id).emit("friendRemoved", {
                    removedFriendId: sender_id
                });

            } catch (error) {
                console.error("Error processing friend removal:", error);
                socket.emit("error", {
                    type: "friendRemoval",
                    message: "Failed to process friend removal",
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
            if (socket.userId) {
                activeUsers.delete(socket.userId);
                console.log(`👋 User ${socket.userId} disconnected (${reason})`);
            }
            console.log(`🔌 Client disconnected (${reason}):`, socket.id);
        });

        // Generic error handler
        socket.on("error", (error) => {
            console.error("Socket error for user:", socket.userId, error);
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

// Add this function to get the io instance
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

export default setupSocket;
