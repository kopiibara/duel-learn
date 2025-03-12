import { pool } from '../config/db.js';

export const createBattleInvitation = async (req, res) => {
    try {
        const {
            sender_id,
            sender_username,
            sender_level,
            receiver_id,
            receiver_username,
            receiver_level,
            lobby_code,
            status = 'pending',
            question_types,
            study_material_title
        } = req.body;

        // Validate required fields
        if (!sender_id || !receiver_id || !lobby_code) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Validate question_types is an array
        if (!Array.isArray(question_types)) {
            return res.status(400).json({
                success: false,
                message: "question_types must be an array"
            });
        }

        const query = `
            INSERT INTO battle_invitations 
            (sender_id, sender_username, sender_level, 
             receiver_id, receiver_username, receiver_level, 
             lobby_code, status, 
             question_types, study_material_title)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Convert array to JSON string for storage
        const questionTypesJson = JSON.stringify(question_types);

        const values = [
            sender_id,
            sender_username,
            sender_level,
            receiver_id,
            receiver_username,
            receiver_level,
            lobby_code,
            status,
            questionTypesJson,
            study_material_title || null
        ];

        const [result] = await pool.query(query, values);

        res.status(201).json({
            success: true,
            data: {
                ...result,
                question_types: question_types
            }
        });

    } catch (error) {
        console.error('Error creating battle invitation:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create battle invitation",
            error: error.message
        });
    }
};

export const updateBattleInvitationStatus = async (req, res) => {
    try {
        const { invitation_id, status } = req.body;

        const query = `
            UPDATE battle_invitations
            SET status = ?
            WHERE id = ?
            RETURNING *
        `;

        const [result] = await pool.query(query, [status, invitation_id]);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Invitation not found"
            });
        }

        res.json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        console.error('Error updating battle invitation:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update battle invitation",
            error: error.message
        });
    }
};

export const getHostInfo = async (req, res) => {
    try {
        const { sender_id } = req.params;

        const query = `
            SELECT u.firebase_uid, u.username, u.level, u.display_picture
            FROM user_info u
            WHERE u.firebase_uid = ?
        `;

        const [result] = await pool.query(query, [sender_id]);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Host not found"
            });
        }

        res.json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        console.error('Error fetching host info:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch host information",
            error: error.message
        });
    }
};

// Add this function to update invitation status by lobby code and sender/receiver IDs
export const updateInvitationStatusByLobbyCode = async (req, res) => {
    try {
        const { lobby_code, sender_id, receiver_id, status } = req.body;

        const query = `
            UPDATE battle_invitations 
            SET status = ?
            WHERE lobby_code = ? 
            AND sender_id = ? 
            AND receiver_id = ?
            AND status = 'pending'
        `;

        const [result] = await pool.query(query, [status, lobby_code, sender_id, receiver_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Invitation not found or already processed"
            });
        }

        res.json({
            success: true,
            message: `Invitation ${status} successfully`
        });

    } catch (error) {
        console.error('Error updating invitation status:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update invitation status",
            error: error.message
        });
    }
};

// Add this function to get invitation details
export const getInvitationDetails = async (req, res) => {
    try {
        const { lobby_code, sender_id, receiver_id } = req.params;

        const query = `
            SELECT * FROM battle_invitations 
            WHERE lobby_code = ? 
            AND sender_id = ? 
            AND receiver_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const [results] = await pool.query(query, [lobby_code, sender_id, receiver_id]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Invitation not found"
            });
        }

        // Parse the question_types JSON string back to an array
        const invitation = results[0];
        try {
            invitation.question_types = JSON.parse(invitation.question_types || '[]');
        } catch (e) {
            console.error('Error parsing question_types:', e);
            invitation.question_types = [];
        }

        res.json({
            success: true,
            data: invitation
        });

    } catch (error) {
        console.error('Error fetching invitation details:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch invitation details",
            error: error.message
        });
    }
};

export const updateLobbySettings = async (req, res) => {
    try {
        const { lobby_code, question_types, study_material_title } = req.body;

        const query = `
            UPDATE battle_invitations 
            SET question_types = ?,
                study_material_title = ?
            WHERE lobby_code = ? 
        `;

        const [result] = await pool.query(query, [
            JSON.stringify(question_types),
            study_material_title,
            lobby_code
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "No active invitation found for this lobby"
            });
        }

        res.json({
            success: true,
            message: "Lobby settings updated successfully"
        });

    } catch (error) {
        console.error('Error updating lobby settings:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update lobby settings",
            error: error.message
        });
    }
};
