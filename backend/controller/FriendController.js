import { pool } from "../config/db.js";

const FriendRequestController = {

    getUserFriend: async (req, res) => {
        const { user } = req.params;

        try {
            const [friends] = await pool.execute(
                `SELECT 
          u.id AS friend_id, 
          u.username AS friend_name, 
          f.updated_at AS friendship_date
       FROM friend_requests f
       JOIN users u ON 
          (f.sender_id = u.id OR f.receiver_id = u.id)
       WHERE 
          (f.sender_id = ? OR f.receiver_id = ?) 
          AND f.status = 'accepted'
          AND u.id != ?;`,
                [user, user, user]
            );

            res.json(friends);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving friends list" });
        }

    },

};

export default FriendRequestController;
