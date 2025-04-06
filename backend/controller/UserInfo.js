import { pool } from "../config/db.js";

const UserInfo = {
    getUserInfo: async (req, res) => {
        let connection;
        try {
            const { firebase_uid } = req.params;

            // Get a connection from the pool
            connection = await pool.getConnection();

            // Fetch combined user data from both tables
            const [userData] = await connection.execute(
                `SELECT 
                    u.firebase_uid,
                    u.username,
                    u.email,
                    u.display_picture,
                    u.full_name,
                    u.email_verified,
                    u.isSSO,
                    u.account_type,
                    ui.level,
                    ui.exp,
                    ui.mana,
                    ui.coins,
                    ui.tech_pass
                FROM users u
                LEFT JOIN user_info ui ON u.firebase_uid = ui.firebase_uid
                WHERE u.firebase_uid = ?`,
                [firebase_uid]
            );

            if (userData.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Send the combined data
            res.status(200).json({
                message: 'User info fetched successfully',
                user: userData[0],
            });
        } catch (error) {
            console.error('Error fetching user info:', error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        } finally {
            if (connection) connection.release();
        }
    },

    updateLevel: async (req, res) => {
        let connection;

        try {
            const { firebase_uid, level } = req.body;

            // Get a connection from the pool
            connection = await pool.getConnection();

            // Update user's level in user_info table
            await connection.execute(
                'UPDATE user_info SET level = ? WHERE firebase_uid = ?',
                [level, firebase_uid]
            );

            res.status(200).json({ message: 'User level updated successfully' });
        } catch (error) {
            console.error('Error updating user level:', error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        } finally {
            if (connection) connection.release();
        }
    },

    getUserProfileById: async (req, res) => {
        let connection;
        try {
            connection = await pool.getConnection();
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required"
                });
            }

            console.log(`Fetching profile for user: ${userId}`);

            const [userResult] = await connection.query(
                `SELECT firebase_uid, username, display_picture, level 
                 FROM user_info 
                 WHERE firebase_uid = ?`,
                [userId]
            );

            if (userResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const userData = userResult[0];

            res.json({
                success: true,
                data: {
                    firebase_uid: userData.firebase_uid,
                    username: userData.username,
                    display_picture: userData.display_picture,
                    level: userData.level
                }
            });

        } catch (error) {
            console.error("Error fetching user profile:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch user profile",
                error: error.message
            });
        } finally {
            if (connection) connection.release(); // Always release the connection
        }
    },


};

export default UserInfo;