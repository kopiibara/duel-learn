import { createInvitation, updateInvitationStatus } from '../controller/BattleInvitationController.js';

export const setupBattleInvitationHandlers = (io, connectedUsers) => {
    // Return a function that sets up handlers for each socket
    return (socket) => {
        socket.on("setup", (userId) => {
            console.log("Setting up socket for user:", userId);

            // Join a room with the user's ID
            socket.join(userId);

            // Store the mapping
            connectedUsers.set(userId, socket.id);

            console.log("User registered:", {
                userId,
                socketId: socket.id,
                activeUsers: Array.from(connectedUsers.entries())
            });
        });

        socket.on("notify_battle_invitation", (data) => {
            const { senderId, senderName, receiverId, lobbyCode } = data;

            console.log("Processing battle invitation:", {
                from: senderId,
                to: receiverId,
                senderName,
                lobbyCode,
                timestamp: new Date().toISOString()
            });

            // Get receiver's socket ID from the connected users map
            const receiverSocketId = connectedUsers.get(receiverId);

            if (!receiverSocketId) {
                console.log("Receiver not connected:", receiverId);
                return;
            }

            // Emit to specific socket
            io.to(receiverSocketId).emit("battle_invitation", {
                senderId,
                senderName,
                lobbyCode,
                timestamp: new Date().toISOString()
            });

            console.log("Battle invitation sent to socket:", receiverSocketId);
        });

        // Handle sending battle invitation
        socket.on('send_battle_invitation', async (data) => {
            const { senderId, senderName, receiverId, lobbyCode } = data;

            // Save to database
            const saved = await createInvitation({
                senderId,
                receiverId,
                lobbyCode
            });

            if (saved) {
                // Emit to specific user
                io.to(receiverId).emit('battle_invitation', {
                    senderId,
                    senderName,
                    lobbyCode
                });
            }
        });

        // Handle accepting battle invitation
        socket.on('accept_battle_invitation', async (data) => {
            const { senderId, receiverId, lobbyCode } = data;

            const updated = await updateInvitationStatus({
                senderId,
                receiverId,
                lobbyCode,
                status: 'accepted'
            });

            if (updated) {
                // Notify both users
                io.to(senderId).emit('battle_invitation_accepted', {
                    receiverId,
                    lobbyCode
                });
                io.to(receiverId).emit('battle_invitation_accepted', {
                    senderId,
                    lobbyCode
                });
            }
        });

        // Handle declining battle invitation
        socket.on('decline_battle_invitation', async (data) => {
            const { senderId, receiverId, lobbyCode } = data;

            const updated = await updateInvitationStatus({
                senderId,
                receiverId,
                lobbyCode,
                status: 'declined'
            });

            if (updated) {
                // Notify sender
                io.to(senderId).emit('battle_invitation_declined', {
                    receiverId,
                    lobbyCode
                });
            }
        });

        socket.on('player_ready', (data) => {
            io.to(data.lobbyCode).emit('player_ready', {
                role: data.role,
                ready: data.ready
            });
        });

        socket.on('update_game_settings', (data) => {
            socket.to(data.lobbyCode).emit('game_settings_updated', {
                material: data.material,
                questionTypes: data.questionTypes
            });
        });
    };
}; 