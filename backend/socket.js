import { Server } from "socket.io";

let io;

// Helper function to validate required fields
const validateFields = (data, requiredFields, errorType) => {
  for (const field of requiredFields) {
    if (!data[field]) {
      const error = new Error(`Missing required field: ${field}`);
      error.type = errorType;
      throw error;
    }
  }
  return true;
};

// Centralized error handler
const handleSocketError = (socket, error, defaultType = "general") => {
  console.error(`Socket error: ${error.message}`, error);
  socket.emit("error", {
    type: error.type || defaultType,
    message: `Failed to process ${error.type || defaultType}`,
    details: error.message,
  });
};

// Standardized event handler creation helper
const createEventHandler = (socket, eventName, requiredFields, logEmoji, handler) => {
  socket.on(eventName, (data = {}) => {
    try {
      if (requiredFields.length > 0) {
        validateFields(data, requiredFields, eventName);
      }

      if (logEmoji) {
        console.log(`${logEmoji} ${eventName}:`, requiredFields.length > 0 ? data : "");
      }

      handler(data);
    } catch (error) {
      handleSocketError(socket, error, eventName.replace(/([A-Z])/g, '_$1').toLowerCase());
    }
  });
};

// Socket setup function with improved error handling and connection management
const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*", // Fallback to allow any origin in development
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000, // Increase from 30000 to 60000
    pingInterval: 25000, // Add explicit ping interval 
    connectTimeout: 10000, // Increase from 5000 to 10000
    transports: ["websocket", "polling"], // Prefer websocket first
    allowUpgrades: true, // Allow transport upgrades
    maxHttpBufferSize: 1e6, // 1MB
    path: "/socket.io/", // Explicit path
  });

  // Store active user connections
  const activeUsers = new Map();

  // More robust server-side error handling
  io.engine.on("connection_error", (error) => {
    console.error("Socket.IO connection error:", error);
  });

  io.on("connect_error", (err) => {
    console.error(`Socket.IO connect error: ${err.message}`);
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);
    socket.setMaxListeners(20); // Increased to handle more events

    // Handle user setup and room joining
    socket.on("setup", (userId) => {
      try {
        if (!userId) {
          console.error("Missing user ID during setup");
          return;
        }

        // Store the userId in the socket object for later reference
        socket.userId = userId;
        socket.join(userId);

        console.log(`🔗 User ${userId} connected. Socket ID: ${socket.id}`);

        // Store in active users map
        activeUsers.set(userId, socket.id);
        socket.emit("connected", { success: true, socketId: socket.id });
      } catch (error) {
        console.error("Error in setup:", error);
        socket.emit("error", {
          type: "setup",
          message: "Failed to complete setup",
          details: error.message,
        });
      }
    });

    // Friend system handlers
    const createFriendEventHandler = (socket) => {
      // Handle friend request sending
      createEventHandler(
        socket,
        "sendFriendRequest",
        ["sender_id", "receiver_id", "sender_username"],
        "📨",
        (data) => {
          const { sender_id, receiver_id, sender_username, receiver_username } = data;

          io.to(receiver_id).emit("newFriendRequest", {
            sender_id, sender_username, receiver_id, receiver_username
          });

          socket.emit("friendRequestSent", {
            success: true, receiver_id, receiver_username
          });
        }
      );

      // Handle friend request acceptance
      createEventHandler(
        socket,
        "acceptFriendRequest",
        ["sender_id", "receiver_id"],
        "✅",
        (data) => {
          const { sender_id, receiver_id, senderInfo, receiverInfo } = data;

          // Notify sender if active
          if (activeUsers.has(sender_id)) {
            io.to(sender_id).emit("friendRequestAccepted", {
              newFriend: receiverInfo || { firebase_uid: receiver_id },
              otherUser: receiverInfo || { firebase_uid: receiver_id }
            });
          }

          // Notify receiver if active
          if (activeUsers.has(receiver_id)) {
            io.to(receiver_id).emit("friendRequestAccepted", {
              newFriend: senderInfo || { firebase_uid: sender_id },
              otherUser: senderInfo || { firebase_uid: sender_id }
            });
          }
        }
      );

      // Handle friend request rejection
      createEventHandler(
        socket,
        "rejectFriendRequest",
        ["sender_id", "receiver_id"],
        "❌",
        (data) => {
          const { sender_id, receiver_id } = data;
          const notificationData = { sender_id, receiver_id };

          io.to(sender_id).emit("friendRequestRejected", notificationData);
          io.to(receiver_id).emit("friendRequestRejected", notificationData);
        }
      );

      // Handle friend removal
      createEventHandler(
        socket,
        "removeFriend",
        ["sender_id", "receiver_id"],
        "❌",
        (data) => {
          const { sender_id, receiver_id } = data;

          io.to(sender_id).emit("friendRemoved", { removedFriendId: receiver_id });
          io.to(receiver_id).emit("friendRemoved", { removedFriendId: sender_id });
        }
      );
    };

    // Register all friend event handlers at once
    createFriendEventHandler(socket);

    // Study material handler
    socket.on("newStudyMaterial", (data) => {
      try {
        if (!data || !data.title) {
          throw new Error("Invalid study material data");
        }

        console.log("📚 New study material received:", data);

        // Normalize data structure for consistency
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
          updated_at: data.updated_at || new Date().toISOString(),
          items: data.items || [],
        };

        io.emit("broadcastStudyMaterial", broadcastData);
      } catch (error) {
        handleSocketError(socket, error, "studyMaterial");
      }
    });

    // Simple notification events with standardized error handling
    const simpleEvents = [
      { event: "emailActionResult", requires: ["mode"], logEmoji: "📧" },
      { event: "passwordResetSuccess", requires: [], logEmoji: "🔑" },
      { event: "emailVerifiedSuccess", requires: [], logEmoji: "✅" }
    ];

    simpleEvents.forEach(({ event, requires, logEmoji }) => {
      createEventHandler(socket, event, requires, logEmoji, (data) => {
        io.emit(event, data);
      });
    });

    // Battle invitation system
    createEventHandler(
      socket,
      "notify_battle_invitation",
      ["senderId", "senderName", "receiverId", "lobbyCode"],
      "🎮",
      (data) => {
        const { senderId, senderName, receiverId, lobbyCode } = data;

        io.to(receiverId).emit("battle_invitation", {
          senderId,
          senderName,
          receiverId,
          lobbyCode,
          timestamp: new Date().toISOString(),
        });
      }
    );

    createEventHandler(
      socket,
      "accept_battle_invitation",
      ["senderId", "receiverId", "lobbyCode"],
      "🎮",
      (data) => {
        const { senderId, receiverId, lobbyCode } = data;
        const notificationData = {
          senderId, receiverId, lobbyCode,
          timestamp: new Date().toISOString()
        };

        // Notify both players
        [senderId, receiverId].forEach(userId => {
          io.to(userId).emit("battle_invitation_accepted", notificationData);
        });
      }
    );

    createEventHandler(
      socket,
      "decline_battle_invitation",
      ["senderId", "receiverId"],
      "❌",
      (data) => {
        const { senderId, receiverId, lobbyCode } = data;
        io.to(senderId).emit("battle_invitation_declined", {
          senderId, receiverId, lobbyCode
        });
      }
    );

    // Lobby management
    createEventHandler(
      socket,
      "join_lobby",
      ["lobbyCode", "playerId"],
      "🎮",
      (data) => {
        const { lobbyCode, playerId, playerName, playerLevel, playerPicture, hostId } = data;
        socket.join(lobbyCode);

        const joinData = {
          lobbyCode, playerId, playerName, playerLevel, playerPicture
        };

        // Notify host if specified
        if (hostId) {
          io.to(hostId).emit("player_joined_lobby", joinData);
        }

        // Notify everyone in lobby
        socket.to(lobbyCode).emit("player_joined_lobby", joinData);

        // Confirm to joining player
        socket.emit("lobby_joined", {
          success: true, lobbyCode, message: "Successfully joined lobby"
        });
      }
    );

    // Lobby information handlers
    createEventHandler(
      socket,
      "request_lobby_info",
      ["lobbyCode", "requesterId"],
      "🔍",
      (data) => {
        const { lobbyCode, requesterId } = data;
        socket.to(lobbyCode).emit("request_lobby_info", { lobbyCode, requesterId });
      }
    );

    createEventHandler(
      socket,
      "lobby_info_response",
      ["lobbyCode", "requesterId"],
      "📡",
      (data) => {
        const { lobbyCode, requesterId, hostId, hostName, material, questionTypes, mode, hostLevel, hostPicture } = data;

        io.to(requesterId).emit("lobby_info_response", {
          lobbyCode, requesterId, hostId, hostName,
          hostLevel, hostPicture, material, questionTypes, mode
        });
      }
    );

    createEventHandler(
      socket,
      "lobby_material_update",
      ["lobbyCode"],
      "📚",
      (data) => {
        const { lobbyCode, material, questionTypes, mode } = data;
        socket.to(lobbyCode).emit("lobby_material_update", {
          lobbyCode, material, questionTypes, mode
        });
      }
    );

    createEventHandler(
      socket,
      "player_ready_state_changed",
      ["lobbyCode", "playerId"],
      "🎮",
      (data) => {
        const { lobbyCode, playerId, isReady } = data;
        socket.to(lobbyCode).emit("player_ready_state_changed", {
          lobbyCode, playerId, isReady
        });
      }
    );

    // Health check for socket connections
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() });
    });

    // Handle disconnection with improved cleanup
    socket.on("disconnect", (reason) => {
      if (socket.userId) {
        activeUsers.delete(socket.userId);
        console.log(`👋 User ${socket.userId} disconnected (${reason})`);
      }

      // Leave all rooms when disconnecting
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

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
  });

  return io;
};

// Get the io instance with error handling
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Health check function to verify socket server is running
export const isSocketHealthy = () => {
  return !!io;
};

export default setupSocket;
