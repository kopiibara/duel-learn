import { pool } from "../config/db.js";

export const getFriendsList = async (req, res) => {
    const { firebase_uid } = req.params;

    if (!firebase_uid) {
        return res.status(400).json({
            success: false,
            message: "firebase_uid is required"
        });
    }

    try {
        // Test database connection
        await pool.getConnection();

        // Get friends through accepted friend requests and join with user_info
        const query = `
            SELECT DISTINCT
                u.firebase_uid,
                u.username,
                ui.level,
                ui.exp,
                ui.mana,
                ui.coins,
                u.display_picture
            FROM users u
            LEFT JOIN user_info ui ON u.firebase_uid = ui.firebase_uid
            INNER JOIN friend_requests fr ON 
                (fr.sender_id = ? AND fr.receiver_id = u.firebase_uid) OR 
                (fr.receiver_id = ? AND fr.sender_id = u.firebase_uid)
            WHERE fr.status = 'accepted'
        `;

        const [friends] = await pool.query(query, [firebase_uid, firebase_uid]);
        console.log("Query results:", friends);

        // Format the response using actual level from user_info
        const formattedFriends = friends.map(friend => ({
            firebase_uid: friend.firebase_uid,
            username: friend.username,
            level: friend.level || 1,
            display_picture: friend.display_picture || null
        }));

        return res.status(200).json({
            success: true,
            data: formattedFriends
        });

    } catch (error) {
        // More detailed error logging
        console.error("Error in getFriendsList:");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        console.error("Request params:", req.params);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
