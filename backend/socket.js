import { Server } from "socket.io";

let io;

const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000, // Reduce to detect dead connections faster
    connectTimeout: 5000,
    transports: ["websocket"], // Prefer WebSocket over polling for efficiency
    allowEIO3: true, // Support older socket.io clients if needed
  });

  // Store active user connections
  const activeUsers = new Map();

  // Handle server-side socket errors
  io.on("connect_error", (err) => {
    console.log(`Connection error due to ${err.message}`);
  });

  // Set max listeners to prevent warnings if needed
  io.sockets.setMaxListeners(20);

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // Set max listeners for this socket if needed
    socket.setMaxListeners(15);

    // Add user to a room based on their firebase_uid
    socket.on("setup", (userId) => {
      try {
        if (!userId) {
          console.error("Missing user ID during setup");
          return;
        }

        // Store the userId in the socket object for later reference
        socket.userId = userId;

        // Join a room with the user's ID
        socket.join(userId);

        // Log for debugging
        console.log(
          `🔗 User ${userId} connected and joined room. Socket ID: ${socket.id}`
        );
        console.log(`👥 Current active rooms:`, Array.from(socket.rooms));

        // Store in active users map
        activeUsers.set(userId, socket.id);

        // Send confirmation to user
        socket.emit("connected", { success: true, socketId: socket.id });
      } catch (error) {
        console.error("Error in setup:", error);
      }
    });

    // Update the sendFriendRequest event handler
    socket.on("sendFriendRequest", (data) => {
      try {
        const { sender_id, receiver_id, senderUsername, receiver_username } =
          data;

        if (!sender_id || !receiver_id || !senderUsername) {
          throw new Error("Missing required friend request data");
        }

        console.log("📨 New friend request:", {
          from: senderUsername,
          sender_id,
          to: receiver_id,
        });

        // Emit to the receiver's room with all necessary data
        io.to(receiver_id).emit("newFriendRequest", {
          sender_id,
          sender_username: senderUsername,
          receiver_id,
          receiver_username,
        });

        // Confirm to sender that request was sent
        socket.emit("friendRequestSent", {
          success: true,
          receiver_id,
          receiver_username,
        });
      } catch (error) {
        console.error("Error processing friend request:", error);
        socket.emit("error", {
          type: "friendRequest",
          message: "Failed to send friend request",
          details: error.message,
        });
      }
    });

    // Update the acceptFriendRequest handler to include more detailed          information
    socket.on("acceptFriendRequest", (data) => {
      try {
        const { sender_id, receiver_id, senderInfo, receiverInfo } = data;

        console.log("Socket: Processing friend request acceptance", {
          sender_id,
          receiver_id,
          senderInfo: senderInfo
            ? {
                username: senderInfo.username,
                uid: senderInfo.firebase_uid || senderInfo.uid,
              }
            : "missing",
          receiverInfo: receiverInfo
            ? {
                username: receiverInfo.username,
                uid: receiverInfo.firebase_uid || receiverInfo.uid,
              }
            : "missing",
        });

        if (!sender_id || !receiver_id) {
          throw new Error("Missing required sender or receiver ID");
        }

        // Notify sender - send receiver's info
        if (activeUsers.has(sender_id)) {
          console.log(`Notifying sender ${sender_id} about accepted request`);
          io.to(sender_id).emit("friendRequestAccepted", {
            newFriend: receiverInfo || { firebase_uid: receiver_id },
          });
        } else {
          console.log(`Sender ${sender_id} is not active, cannot notify`);
        }

        // Notify receiver - send sender's info
        if (activeUsers.has(receiver_id)) {
          console.log(
            `Notifying receiver ${receiver_id} about accepted request`
          );
          io.to(receiver_id).emit("friendRequestAccepted", {
            newFriend: senderInfo || { firebase_uid: sender_id },
          });
        } else {
          console.log(`Receiver ${receiver_id} is not active, cannot notify`);
        }
      } catch (error) {
        console.error("Error handling friend request acceptance:", error);
        socket.emit("error", {
          message: "Failed to process friend acceptance",
          details: error.message,
        });
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
          receiver_id,
        });

        // Notify both users about the rejection
        io.to(sender_id).emit("friendRequestRejected", {
          sender_id,
          receiver_id,
        });
        io.to(receiver_id).emit("friendRequestRejected", {
          sender_id,
          receiver_id,
        });
      } catch (error) {
        console.error("Error processing friend rejection:", error);
        socket.emit("error", {
          type: "friendRejection",
          message: "Failed to process friend rejection",
          details: error.message,
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
          removed_id: receiver_id,
        });

        // Notify both users about the friend removal
        io.to(sender_id).emit("friendRemoved", {
          removedFriendId: receiver_id,
        });
        io.to(receiver_id).emit("friendRemoved", {
          removedFriendId: sender_id,
        });
      } catch (error) {
        console.error("Error processing friend removal:", error);
        socket.emit("error", {
          type: "friendRemoval",
          message: "Failed to process friend removal",
          details: error.message,
        });
      }
    });

    // Listen for new study material creation
    socket.on("newStudyMaterial", (data) => {
      try {
        if (!data || !data.title) {
          throw new Error("Invalid study material data");
        }

        console.log("📚 New study material received:", data);

        // Ensure the data has the correct property names that frontend expects
        const broadcastData = {
          study_material_id: data.studyMaterialId || data.study_material_id,
          title: data.title,
          tags: data.tags || [],
          images: data.images || [],
          total_items: data.totalItems || data.total_items || 0,
          created_by: data.createdBy || data.created_by,
          created_by_id: data.createdById || data.created_by_id,
          visibility: data.visibility || 0,
          created_at: data.created_at || new Date().toISOString(),
          items: data.items || [],
        };

        // Broadcast to all connected clients
        io.emit("broadcastStudyMaterial", broadcastData);
      } catch (error) {
        console.error("Error broadcasting study material:", error);
        socket.emit("error", {
          type: "studyMaterial",
          message: "Failed to broadcast study material",
          details: error.message,
        });
      }
    });

    // Handle email action results
    socket.on("emailActionResult", (data) => {
      try {
        if (!data || !data.mode) {
          throw new Error("Invalid email action result data");
        }

        console.log("📧 Email action result:", data);

        // Broadcast to all connected clients
        io.emit("emailActionResult", data);
      } catch (error) {
        console.error("Error handling email action result:", error);
        socket.emit("error", {
          type: "emailAction",
          message: "Failed to process email action result",
          details: error.message,
        });
      }
    });

    // Handle password reset success
    socket.on("passwordResetSuccess", () => {
      try {
        console.log("🔑 Password reset success");
        io.emit("passwordResetSuccess");
      } catch (error) {
        console.error("Error handling password reset success:", error);
        socket.emit("error", {
          type: "passwordReset",
          message: "Failed to process password reset success",
          details: error.message,
        });
      }
    });

    // Handle email verification success
    socket.on("emailVerifiedSuccess", () => {
      try {
        console.log("✅ Email verification success");
        io.emit("emailVerifiedSuccess");
      } catch (error) {
        console.error("Error handling email verification success:", error);
        socket.emit("error", {
          type: "emailVerification",
          message: "Failed to process email verification success",
          details: error.message,
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
        details: error.message,
      });
    });

    // Add these new event handlers for battle invitations
    socket.on("notify_battle_invitation", (data) => {
      try {
        const { senderId, senderName, receiverId, lobbyCode } = data;

        // Validate all required fields
        if (!senderId || !senderName || !receiverId || !lobbyCode) {
          console.error("Missing required data for battle invitation:", {
            senderId,
            senderName,
            receiverId,
            lobbyCode,
          });
          socket.emit("error", {
            type: "battleInvitation",
            message: "Missing required data for battle invitation",
          });
          return;
        }

        console.log("🎮 Sending battle invitation:", {
          senderId,
          senderName,
          receiverId,
          lobbyCode,
        });

        // Send ALL required fields to the receiver
        io.to(receiverId).emit("battle_invitation", {
          senderId,
          senderName: senderName,
          receiverId,
          lobbyCode,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error in notify_battle_invitation:", error);
      }
    });

    socket.on("accept_battle_invitation", (data) => {
      try {
        const { senderId, receiverId, lobbyCode } = data;

        console.log("🎮 Battle invitation accepted:", {
          senderId,
          receiverId,
          lobbyCode,
          timestamp: new Date().toISOString(),
        });

        // Important: Emit to BOTH players
        [senderId, receiverId].forEach((userId) => {
          io.to(userId).emit("battle_invitation_accepted", {
            senderId,
            receiverId,
            lobbyCode,
            timestamp: new Date().toISOString(),
          });
        });
      } catch (error) {
        console.error("Error in accept_battle_invitation:", error);
        socket.emit("error", {
          type: "battleAcceptance",
          message: "Failed to process battle acceptance",
          details: error.message,
        });
      }
    });

    socket.on("decline_battle_invitation", (data) => {
      try {
        const { senderId, receiverId, lobbyCode } = data;

        if (!senderId || !receiverId) {
          throw new Error("Missing required invitation decline data");
        }

        console.log("❌ Battle invitation declined:", {
          senderId,
          receiverId,
          lobbyCode,
        });

        // Notify the original sender that their invitation was declined
        io.to(senderId).emit("battle_invitation_declined", {
          senderId,
          receiverId,
          lobbyCode,
        });
      } catch (error) {
        console.error("Error processing invitation decline:", error);
        socket.emit("error", {
          type: "battleDecline",
          message: "Failed to process battle decline",
          details: error.message,
        });
      }
    });

    socket.on("join_lobby", (data) => {
      try {
        const {
          lobbyCode,
          playerId,
          playerName,
          playerLevel,
          playerPicture,
          hostId,
        } = data;

        if (!lobbyCode || !playerId) {
          console.error("Missing required lobby data:", data);
          return;
        }

        console.log(
          `🎮 Player ${playerName || playerId} joining lobby ${lobbyCode}`
        );

        // Add player to the lobby room
        socket.join(lobbyCode);

        // Notify the host specifically
        if (hostId) {
          console.log(
            `Notifying host ${hostId} about player ${
              playerName || playerId
            } joining`
          );
          io.to(hostId).emit("player_joined_lobby", {
            lobbyCode,
            playerId,
            playerName,
            playerLevel,
            playerPicture,
          });
        }

        // Also broadcast to everyone in the lobby
        socket.to(lobbyCode).emit("player_joined_lobby", {
          lobbyCode,
          playerId,
          playerName,
          playerLevel,
          playerPicture,
        });

        // Send confirmation to the joining player
        socket.emit("lobby_joined", {
          success: true,
          lobbyCode,
          message: "Successfully joined lobby",
        });
      } catch (error) {
        console.error("Error in join_lobby handler:", error);
        socket.emit("error", {
          type: "lobbyJoin",
          message: "Failed to join lobby",
          details: error.message,
        });
      }
    });

    socket.on("player_ready", (data) => {
      try {
        const { lobbyCode, playerId, isReady } = data;

        if (!lobbyCode || !playerId) {
          console.error("Missing required ready status data:", data);
          return;
        }

        console.log(
          `🎮 Player ${playerId} is ${
            isReady ? "ready" : "not ready"
          } in lobby ${lobbyCode}`
        );

        // Broadcast to everyone in the lobby including the sender
        io.to(lobbyCode).emit("player_ready_status", {
          lobbyCode,
          playerId,
          isReady,
        });
      } catch (error) {
        console.error("Error in player_ready handler:", error);
      }
    });

    socket.on("request_lobby_info", (data) => {
      try {
        const { lobbyCode, requesterId } = data;

        if (!lobbyCode || !requesterId) {
          console.error("Missing required lobby info request data");
          return;
        }

        console.log(
          `🔍 Player ${requesterId} requesting lobby info for lobby ${lobbyCode}`
        );

        // Forward the request to the host (we don't know who the host is, so broadcast to the lobby)
        socket.to(lobbyCode).emit("request_lobby_info", {
          lobbyCode,
          requesterId,
        });
      } catch (error) {
        console.error("Error handling lobby info request:", error);
      }
    });

    socket.on("lobby_info_response", (data) => {
      try {
        const {
          lobbyCode,
          requesterId,
          hostId,
          hostName,
          material,
          questionTypes,
          mode,
        } = data;

        if (!lobbyCode || !requesterId) {
          console.error("Missing required lobby info response data");
          return;
        }

        // Add more detailed logging to diagnose material format issues
        console.log(
          `📡 Host ${hostId} sending lobby info to ${requesterId} for lobby ${lobbyCode}`,
          {
            lobbyCode,
            material: material?.title
              ? { title: material.title, id: material.id || "unknown" }
              : "No material or invalid format",
            questionTypes: questionTypes || [],
            mode,
          }
        );

        // Send the lobby info to the specific requesting player
        io.to(requesterId).emit("lobby_info_response", {
          lobbyCode,
          requesterId,
          hostId,
          hostName,
          hostLevel: user.level,
          hostPicture: user.display_picture,
          material: selectedMaterial,
          questionTypes: selectedTypesFinal,
          mode: selectedMode,
        });
      } catch (error) {
        console.error("Error handling lobby info response:", error);
      }
    });

    socket.on("lobby_material_update", (data) => {
      try {
        const { lobbyCode, material, questionTypes, mode } = data;

        if (!lobbyCode) {
          console.error("Missing lobby code for material update");
          return;
        }

        console.log(`📚 Updating lobby ${lobbyCode} material:`, {
          material: material?.title,
          questionTypes,
          mode,
        });

        // Broadcast to everyone in the lobby except the sender
        socket.to(lobbyCode).emit("lobby_material_update", {
          lobbyCode,
          material,
          questionTypes,
          mode,
        });
      } catch (error) {
        console.error("Error handling lobby material update:", error);
      }
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
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export default setupSocket;
