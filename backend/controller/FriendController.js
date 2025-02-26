import { pool } from "../config/db.js";
import { nanoid } from 'nanoid';

const FriendRequestController = {

    getUserInfo: async (req, res) => {

        const { firebase_uid } = req.params;

        const connection = await pool.getConnection();

        try {
            const [userInfo] = await connection.execute(
                `SELECT * FROM user_info  WHERE firebase_uid != ?`,
                [firebase_uid]
            );

            res.status(200).json(userInfo);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving user info" });
        }
        finally {
            connection.release();
        }

    },

    sendFriendRequest: async (req, res) => {
        console.log("Received Friend Request:", req.body);

        const { sender_id, receiver_id } = req.body;
        if (!sender_id || !receiver_id) {
            return res.status(400).json({ message: "Missing sender_id or receiver_id" });
        }

        const connection = await pool.getConnection();
        try {
            const [existingRequest] = await connection.execute(
                `SELECT * FROM friend_requests 
                WHERE sender_id = ? AND receiver_id = ?`,
                [sender_id, receiver_id]
            );

            if (existingRequest.length > 0) {
                return res.status(400).json({ message: "You have already sent a friend request to this user" });
            }

            const friendrequest_id = nanoid();
            await connection.execute(
                `INSERT INTO friend_requests (friendrequest_id, sender_id, receiver_id, status, created_at, updated_at)
                VALUES (?, ?, ?, 'pending', NOW(), NOW())`,
                [friendrequest_id, sender_id, receiver_id]
            );

            const [senderInfo] = await connection.execute(
                'SELECT username FROM user_info WHERE firebase_uid = ?',
                [sender_id]
            );

            console.log("Friend Request Sent Successfully");

            res.status(201).json({
                message: "Friend request sent successfully",
                senderUsername: senderInfo[0]?.username
            });
        } catch (error) {
            console.error("Database Error:", error);
            res.status(500).json({ message: "Error sending friend request" });
        } finally {
            connection.release();
        }
    }

};

export default FriendRequestController;
