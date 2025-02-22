import { Server } from "socket.io";

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Store user socket mappings
    const userSockets = new Map();

    io.on("connection", (socket) => {
        console.log("🔌 User connected:", socket.id);

        // Join a room with the user's display name when they connect
        socket.on("joinRoom", (username) => {
            console.log(`👤 ${username} joined their room`);
            userSockets.set(username, socket.id);
            socket.join(username);
        });

        socket.on("newStudyMaterial", async (studyMaterial) => {
            try {
                console.log("📝 New study material received from:", studyMaterial.created_by);

                // Broadcast to all connected clients except the creator
                socket.broadcast.emit("studyMaterialCreated", {
                    type: "new_material",
                    data: studyMaterial,
                    timestamp: new Date().toISOString(),
                    creator: studyMaterial.created_by
                });

                console.log("🔔 Notification broadcasted to all users");
            } catch (error) {
                console.error("❌ Error handling newStudyMaterial:", error);
            }
        });


        socket.on("disconnect", () => {
            // Remove user from mapping when they disconnect
            for (const [username, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(username);
                    console.log(`🔌 User disconnected: ${username}`);
                    break;
                }
            }
        });
    });

    return io;
};

export default setupSocket;
