import { pool } from "../config/db.js";

const FriendRequestController = {

    getUserCreatedStudyMaterial: async (req, res) => {
        try {
            const { user_uid } = req.params;

            // Using created_by_id which is the likely column name based on your other code
            const [result] = await pool.query(
                `SELECT COUNT(*) as count FROM study_material_info WHERE created_by_id = ?`,
                [user_uid]
            );

            // Return a properly formatted response
            res.status(200).json({
                success: true,
                count: result[0].count
            });

        } catch (error) {
            console.error("Error counting user study materials:", error);
            res.status(500).json({
                success: false,
                message: "Failed to retrieve study material count",
                error: error.message
            });
        }
    }


};

export default FriendRequestController;
