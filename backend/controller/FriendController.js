import { pool } from "../config/db.js";
import { nanoid } from 'nanoid';
import manilacurrentTimestamp from "../utils/CurrentTimestamp.js";


const FriendRequestController = {

    getUserInfo: async (req, res) => {
        const { firebase_uid } = req.params;
        const connection = await pool.getConnection();

        try {
            const [userInfo] = await connection.execute(
                `SELECT * FROM user_info 
                WHERE firebase_uid != ? 
                AND firebase_uid NOT IN (
                    SELECT CASE 
                        WHEN sender_id = ? THEN receiver_id
                        WHEN receiver_id = ? THEN sender_id
                    END
                    FROM friend_requests
                    WHERE (sender_id = ? OR receiver_id = ?)
                    AND status = 'accepted'
                )`,
                [firebase_uid, firebase_uid, firebase_uid, firebase_uid, firebase_uid]
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

    searchUsers: async (req, res) => {
        const { searchQuery } = req.params;
        console.log('Received search query:', searchQuery);
        const connection = await pool.getConnection();

        try {
            console.log('Executing SQL query with params:', [`%${searchQuery}%`]);
            const [users] = await connection.execute(
                `SELECT * FROM user_info 
                WHERE LOWER(username) LIKE LOWER(?) 
                ORDER BY username ASC 
                LIMIT 20`,
                [`%${searchQuery}%`]
            );

            console.log('Found users:', users.length);
            console.log('Search results:', users);

            if (users.length === 0) {
                console.log('No users found for query:', searchQuery);
            }

            res.status(200).json(users);
        }
        catch (error) {
            console.error("Search error:", error);
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                sqlMessage: error.sqlMessage
            });
            res.status(500).json({ message: "Error searching users" });
        }
        finally {
            connection.release();
        }
    },

    getFriendInfo: async (req, res) => {

        const { firebase_uid } = req.params;

        const connection = await pool.getConnection();

        try {
            const [userInfo] = await connection.execute(
                `SELECT DISTINCT u.* 
                FROM user_info u
                INNER JOIN friend_requests fr 
                ON (u.firebase_uid = fr.sender_id OR u.firebase_uid = fr.receiver_id)
                WHERE fr.status = 'accepted'
                AND ((fr.sender_id = ? AND u.firebase_uid = fr.receiver_id)
                    OR (fr.receiver_id = ? AND u.firebase_uid = fr.sender_id))`,
                [firebase_uid, firebase_uid]
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

    getPendingFriendRequests: async (req, res) => {
        const { firebase_uid } = req.params;

        const connection = await pool.getConnection();

        try {
            const [pendingRequests] = await connection.execute(
                `SELECT fr.*, ui.username as sender_username, ui.level as sender_level 
                FROM friend_requests fr
                LEFT JOIN user_info ui ON fr.sender_id = ui.firebase_uid
                WHERE fr.receiver_id = ? AND fr.status = 'pending'`,
                [firebase_uid]
            );

            // Transform the results to match the expected format in the frontend
            const formattedRequests = pendingRequests.map(request => ({
                ...request,
                sender_info: {
                    username: request.sender_username,
                    level: request.sender_level
                }
            }));

            res.status(200).json(formattedRequests);

        }
        catch (error) {
            console.error("Database Error:", error);
            res.status(500).json({ message: "Error retrieving pending friend requests" });
        }
        finally {
            connection.release();
        }



    },

    getFriendRequestsCount: async (req, res) => {
        const { firebase_uid } = req.params;

        const connection = await pool.getConnection();

        try {
            const [friendRequests] = await connection.execute(
                `SELECT COUNT(*) FROM friend_requests WHERE receiver_id = ? AND status = 'pending'`,
                [firebase_uid]
            );

            res.status(200).json({ count: friendRequests[0].count });
        }
        catch (error) {
            console.error("Database Error:", error);
            res.status(500).json({ message: "Error retrieving friend requests count" });
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

        const currentTimestamp = manilacurrentTimestamp;
        const updatedTimestamp = manilacurrentTimestamp;

        const connection = await pool.getConnection();
        try {
            const [existingRequest] = await connection.execute(
                `SELECT * FROM friend_requests 
                WHERE sender_id = ? AND receiver_id = ? AND status != 'declined'`,
                [sender_id, receiver_id]
            );

            if (existingRequest.length > 0) {
                return res.status(400).json({ message: "You have already sent a friend request to this user" });
            }

            // Delete any existing declined requests before creating a new one
            await connection.execute(
                `DELETE FROM friend_requests 
                WHERE sender_id = ? AND receiver_id = ? AND status = 'declined'`,
                [sender_id, receiver_id]
            );

            const friendrequest_id = nanoid();
            await connection.execute(
                `INSERT INTO friend_requests (friendrequest_id, sender_id, receiver_id, status, created_at, updated_at)
                VALUES (?, ?, ?, 'pending', ?, ?)`,
                [friendrequest_id, sender_id, receiver_id, currentTimestamp, updatedTimestamp]
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
    },

    acceptFriendRequest: async (req, res) => {
        const { sender_id, receiver_id } = req.body;
        if (!sender_id || !receiver_id) {
            return res.status(400).json({ message: "Missing sender_id or receiver_id" });
        }

        const acceptedTimestamp = manilacurrentTimestamp;
        const connection = await pool.getConnection();
        try {
            // Update the friend request status
            await connection.execute(
                `UPDATE friend_requests SET status = 'accepted', updated_at = ? WHERE sender_id = ? AND receiver_id = ?`,
                [acceptedTimestamp, sender_id, receiver_id]
            );

            // Get the sender's information
            const [senderInfo] = await connection.execute(
                'SELECT username, level FROM user_info WHERE firebase_uid = ?',
                [sender_id]
            );

            res.status(200).json({
                message: "Friend request accepted successfully",
                senderInfo: senderInfo[0]
            });
        }
        catch (error) {
            console.error("Database Error:", error);
            res.status(500).json({ message: "Error accepting friend request" });
        }
        finally {
            connection.release();
        }
    },

    rejectFriendRequest: async (req, res) => {
        const { sender_id, receiver_id } = req.body;
        if (!sender_id || !receiver_id) {
            return res.status(400).json({ message: "Missing sender_id or receiver_id" });
        }

        const rejectedTimestamp = manilacurrentTimestamp;
        const connection = await pool.getConnection();
        try {
            await connection.execute(
                `UPDATE friend_requests SET status = 'declined', updated_at = ? WHERE sender_id = ? AND receiver_id = ?`,
                [rejectedTimestamp, sender_id, receiver_id]
            );

            res.status(200).json({ message: "Friend request rejected successfully" });
        }
        catch (error) {
            console.error("Database Error:", error);
            res.status(500).json({ message: "Error rejecting friend request" });
        }
    },

    removeFriend: async (req, res) => {
        const { sender_id, receiver_id } = req.body;
        if (!sender_id || !receiver_id) {
            return res.status(400).json({ message: "Missing sender_id or receiver_id" });
        }

        const deletedTimestamp = manilacurrentTimestamp;


        const connection = await pool.getConnection();
        try {
            // First, get the friend request details before deletion
            const [friendRequest] = await connection.execute(
                `SELECT * FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
                [sender_id, receiver_id, receiver_id, sender_id]
            );

            if (friendRequest.length > 0) {
                // Insert into deleted_friend_requests table
                await connection.execute(
                    `INSERT INTO deleted_friend_request (friendrequest_id, sender_id, receiver_id, deleted_at)
                    VALUES (?, ?, ?, ?)`,
                    [friendRequest[0].friendrequest_id, friendRequest[0].sender_id, friendRequest[0].receiver_id, deletedTimestamp]
                );

                // Then delete from friend_requests
                await connection.execute(
                    `DELETE FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
                    [sender_id, receiver_id, receiver_id, sender_id]
                );
            }

            res.status(200).json({ message: "Friend removed successfully" });
        }
        catch (error) {
            console.error("Database Error:", error);
            res.status(500).json({ message: "Error removing friend" });
        }
        finally {
            connection.release();
        }
    }


};

export default FriendRequestController;
