import { pool } from "../config/db.js";

export const createInvitation = async (data) => {
    const { senderId, receiverId, lobbyCode } = data;

    try {
        const query = `
            INSERT INTO battle_invitations 
            (sender_id, receiver_id, lobby_code) 
            VALUES (?, ?, ?)
        `;

        await pool.query(query, [senderId, receiverId, lobbyCode]);
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