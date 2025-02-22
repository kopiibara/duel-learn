import { pool } from "../config/db.js";

const FriendRequestController = {

    getUserFriend: async (req, res) => {
        const connection = await pool.getConnection();
        const { username } = req.params;

        try {
            const [friendList] = await connection.execute(
                `SELECT username, display_picture FROM users where username = ?`,
                [username]
            );
            console.log(
                `Fetched ${friendList} of ${username} from the database.`

            );

            if (friendList.length === 0) {
                return res.status(404).json({ message: "No friends found" });
            }
            res.status(200).json(friendList);
        } catch (error) {
            console.error("Error fetching friend requests:", error);
            res.status(500).json({ error: "Internal server error" });
        }


    },

};

export default FriendRequestController;
