import { pool } from "../config/db.js";

const UserInfo = {
    getUserInfo: async (req, res) => {
        let connection;
        try {
            const { firebase_uid } = req.params;

            // Get a connection from the pool
            connection = await pool.getConnection();

            // Fetch user info from user_info table
            const [userInfo] = await connection.execute(
                'SELECT firebase_uid, username, display_picture, level, exp, mana, coins as coin FROM user_info WHERE firebase_uid = ?',
                [firebase_uid]
            );

            if (userInfo.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Fetch account type from users table
            const [userAccount] = await connection.execute(
                'SELECT account_type FROM users WHERE firebase_uid = ?',
                [firebase_uid]
            );

            // Combine the data
            const userData = {
                ...userInfo[0],
                account_type: userAccount.length > 0 ? userAccount[0].account_type : 'free'
            };

            res.status(200).json({
                message: 'User info fetched successfully',
                user: userData,
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
};

export default UserInfo;