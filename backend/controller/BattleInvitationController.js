import { pool } from "../config/db.js";

export const createInvitation = async (data) => {
    const { senderId, receiverId, lobbyCode } = data;

    try {
        const query = `
            INSERT INTO battle_invitations 
            (sender_id, sender_username, receiver_id, receiver_username, lobby_code) 
            VALUES (?, ?, ?, ?, ?)
        `;

        await pool.query(query, [senderId, receiverId, lobbyCode]);
        res.status(200).json({ message: "Invitation sent" });
        return true;
    } catch (error) {
        console.error("Error creating battle invitation:", error);
        return false;
    }
};

export const updateInvitationStatus = async (data) => {
    const { senderId, receiverId, lobbyCode, status } = data;

    try {
        const query = `
            UPDATE battle_invitations 
            SET status = ? 
            WHERE sender_id = ? 
            AND receiver_id = ? 
            AND lobby_code = ?
            AND status = 'pending'
        `;

        await pool.query(query, [status, senderId, receiverId, lobbyCode]);
        return true;
    } catch (error) {
        console.error("Error updating battle invitation:", error);
        return false;
    }
}; 