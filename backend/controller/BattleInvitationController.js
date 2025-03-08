import { pool } from "../config/db.js";
import { getIO } from "../socket.js";

// Helper function to create an invitation in the database
const createInvitation = async (invitationData) => {
    try {
        const { senderId, senderUsername, receiverId, receiverUsername, lobbyCode } = invitationData;

        // Here you would insert into your database
        // For now, we'll just return true to simulate success
        console.log("Creating invitation in database:", invitationData);
        return true;
    } catch (error) {
        console.error("Database error creating invitation:", error);
        return false;
    }
};

// Helper function to update invitation status
const updateInvitationStatus = async (statusData) => {
    try {
        const { senderId, receiverId, lobbyCode, status } = statusData;

        // Here you would update the status in your database
        // For now, we'll just return true to simulate success
        console.log("Updating invitation status in database:", statusData);
        return true;
    } catch (error) {
        console.error("Database error updating invitation status:", error);
        return false;
    }
};

// New controller methods that handle HTTP requests
export const createInvitationHandler = async (req, res) => {
    console.log("Hit pvp-invitation endpoint");
    try {
        const { senderId, senderUsername, receiverId, receiverUsername, lobbyCode } = req.body;
        console.log("Received invitation request:", {
            senderId, senderUsername, receiverId, receiverUsername, lobbyCode
        });

        const result = await createInvitation({
            senderId,
            senderUsername,
            receiverId,
            receiverUsername,
            lobbyCode
        });

        // Get the socket.io instance to emit events
        try {
            const io = getIO();
            // Emit a battle invitation event to the receiver
            io.to(receiverId).emit("battle_invitation", {
                senderId,
                senderName: senderUsername,
                receiverId,
                lobbyCode,
                timestamp: new Date().toISOString()
            });
            console.log("Emitted battle_invitation event via HTTP endpoint");
        } catch (error) {
            console.error("Error emitting socket event:", error);
            // Continue with the response even if socket emission fails
        }

        if (result) {
            res.status(200).json({ success: true, message: 'Invitation sent successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to send invitation' });
        }
    } catch (error) {
        console.error('Error creating invitation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateInvitationStatusHandler = async (req, res) => {
    try {
        const { senderId, receiverId, lobbyCode, status } = req.body;
        const result = await updateInvitationStatus({
            senderId,
            receiverId,
            lobbyCode,
            status
        });

        // Get the socket.io instance to emit events
        try {
            const io = getIO();

            if (status === 'accepted') {
                io.to(senderId).emit("battle_invitation_accepted", {
                    senderId,
                    receiverId,
                    lobbyCode
                });
            } else if (status === 'declined') {
                io.to(senderId).emit("battle_invitation_declined", {
                    senderId,
                    receiverId,
                    lobbyCode
                });
            }
            console.log(`Emitted battle_invitation_${status} event via HTTP endpoint`);
        } catch (error) {
            console.error("Error emitting socket event:", error);
            // Continue with the response even if socket emission fails
        }

        if (result) {
            res.status(200).json({ success: true, message: 'Status updated successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to update status' });
        }
    } catch (error) {
        console.error('Error updating invitation status:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Track active lobbies and their players
const activeLobbies = new Map();

// Store lobby information
export const createOrUpdateLobbyHandler = async (req, res) => {
    try {
        const { lobbyCode, hostId, hostName, studyMaterialId, questionTypes } = req.body;

        if (!lobbyCode || !hostId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required lobby data'
            });
        }

        // Update or create lobby in our memory store
        activeLobbies.set(lobbyCode, {
            lobbyCode,
            hostId,
            hostName,
            studyMaterialId,
            questionTypes,
            players: activeLobbies.has(lobbyCode)
                ? activeLobbies.get(lobbyCode).players
                : [],
            createdAt: activeLobbies.has(lobbyCode)
                ? activeLobbies.get(lobbyCode).createdAt
                : new Date().toISOString()
        });

        console.log(`Lobby ${lobbyCode} created/updated by ${hostName || hostId}`);

        res.status(200).json({
            success: true,
            message: 'Lobby information updated',
            lobbyData: activeLobbies.get(lobbyCode)
        });
    } catch (error) {
        console.error('Error updating lobby information:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get lobby information
export const getLobbyInfoHandler = async (req, res) => {
    try {
        const { lobbyCode } = req.params;

        if (!lobbyCode) {
            return res.status(400).json({
                success: false,
                message: 'Missing lobby code'
            });
        }

        if (!activeLobbies.has(lobbyCode)) {
            return res.status(404).json({
                success: false,
                message: 'Lobby not found'
            });
        }

        res.status(200).json({
            success: true,
            lobbyData: activeLobbies.get(lobbyCode)
        });
    } catch (error) {
        console.error('Error retrieving lobby information:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Add a player to a lobby
export const addPlayerToLobbyHandler = async (req, res) => {
    try {
        const { lobbyCode, playerId, playerName, playerLevel, playerPicture } = req.body;

        if (!lobbyCode || !playerId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required player data'
            });
        }

        if (!activeLobbies.has(lobbyCode)) {
            return res.status(404).json({
                success: false,
                message: 'Lobby not found'
            });
        }

        const lobby = activeLobbies.get(lobbyCode);

        // Check if player already exists
        const playerExists = lobby.players.some(p => p.playerId === playerId);

        if (!playerExists) {
            lobby.players.push({
                playerId,
                playerName,
                playerLevel,
                playerPicture,
                isReady: false,
                joinedAt: new Date().toISOString()
            });
        }

        // Update the lobby
        activeLobbies.set(lobbyCode, lobby);

        console.log(`Player ${playerName || playerId} added to lobby ${lobbyCode}`);

        // Get socket instance and notify the host
        try {
            const io = getIO();
            io.to(lobby.hostId).emit("player_joined_lobby", {
                lobbyCode,
                playerId,
                playerName,
                playerLevel,
                playerPicture
            });
        } catch (error) {
            console.error("Error emitting player_joined_lobby event:", error);
            // Continue even if socket emission fails
        }

        res.status(200).json({
            success: true,
            message: 'Player added to lobby',
            lobbyData: lobby
        });
    } catch (error) {
        console.error('Error adding player to lobby:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}; 