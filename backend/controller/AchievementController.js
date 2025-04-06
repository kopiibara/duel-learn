import { pool } from "../config/db.js";

const FriendRequestController = {

    getAchievement: async (req, res) => {
        try {
            const [rows] = await pool.query(
                `SELECT achievement_id, achievement_name, achievement_description, achievement_requirement, achievement_level, achievement_picture_url FROM achievements WHERE achievement_level = 1`);
            res.status(200).json({
                success: true,
                data: rows,
            });

        } catch (error) {

            console.error("Error fetching achievements:", error);
            res.status(500).json({
                success: false,
                message: "Failed to retrieve achievements",
                error: error.message
            });
        }

    },
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
    },

    checkMysticElderAchievement: async (req, res) => {
        try {
            const { firebase_uid } = req.params;

            // Fetch the user's level
            const [userLevelResult] = await pool.query(
                `SELECT level FROM user_info WHERE firebase_uid = ?`,
                [firebase_uid]
            );

            if (userLevelResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            const userLevel = userLevelResult[0].level;

            // Fetch only the Mystic Elder achievement
            const [mysticElderResult] = await pool.query(
                `SELECT achievement_id, achievement_name, achievement_description, 
                achievement_requirement, achievement_level, achievement_picture_url 
                FROM achievements WHERE achievement_name = 'Mystic Elder'`
            );

            if (mysticElderResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Mystic Elder achievement not found",
                });
            }

            const mysticElderAchievement = mysticElderResult[0];
            const achieved = userLevel >= mysticElderAchievement.achievement_requirement;

            res.status(200).json({
                success: true,
                userLevel,
                mysticElderAchievement: {
                    ...mysticElderAchievement,
                    achieved
                }
            });

        } catch (error) {
            console.error("Error checking Mystic Elder achievement:", error);
            res.status(500).json({
                success: false,
                message: "Failed to check Mystic Elder achievement",
                error: error.message
            });
        }
    },

    checkWisdomCollectorAchievement: async (req, res) => {

        try {
            const { firebase_uid } = req.params;

            const [userStudyMaterial] = await pool.query(
                `SELECT COUNT(*) as count FROM study_material_info WHERE created_by_id = ?`,
                [firebase_uid]
            );

            const userStudyMaterialCount = userStudyMaterial[0].count;

            // Fetch only the Wisdom Collector achievement
            const [wisdomCollectorResult] = await pool.query(
                `SELECT achievement_id, achievement_name, achievement_description, 
                achievement_requirement, achievement_level, achievement_picture_url 
                FROM achievements WHERE achievement_name = 'Wisdom Collector'`
            );

            if (wisdomCollectorResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Wisdom Collector achievement not found",
                });
            }

            const wisdomCollectorAchievement = wisdomCollectorResult[0];
            const achieved = userStudyMaterialCount >= wisdomCollectorAchievement.achievement_requirement;

            res.status(200).json({
                success: true,
                userStudyMaterialCount,
                wisdomCollectorAchievement: {
                    ...wisdomCollectorAchievement,
                    achieved
                }
            });

        } catch (error) {
            console.error("Error checking Wisdom Collector achievement:", error);
            res.status(500).json({
                success: false,
                message: "Failed to check Wisdom Collector achievement",
                error: error.message
            });
        }
    },

    checkArcaneScholarAchievement: async (req, res) => {

        try {
            const { firebase_uid } = req.params;

            const [userStudyMaterial] = await pool.query(
                `SELECT COUNT(*) as count FROM session_report WHERE session_by_user_id = ? AND status = 'completed'`,
                [firebase_uid]
            );

            const userStudyMaterialCount = userStudyMaterial[0].count;

            // Fetch only the Arcane Scholar achievement
            const [arcaneScholarResult] = await pool.query(
                `SELECT achievement_id, achievement_name, achievement_description, 
                achievement_requirement, achievement_level, achievement_picture_url 
                FROM achievements WHERE achievement_name = 'Arcane Scholar'`
            );

            if (arcaneScholarResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Arcane Scholar achievement not found",
                });
            }

            const arcaneScholarAchievement = arcaneScholarResult[0];
            const achieved = userStudyMaterialCount >= arcaneScholarAchievement.achievement_requirement;

            res.status(200).json({
                success: true,
                userStudyMaterialCount,
                arcaneScholarAchievement: {
                    ...arcaneScholarAchievement,
                    achieved
                }
            });

        } catch (error) {
            console.error("Error checking Arcane Scholar achievement:", error);
            res.status(500).json({
                success: false,
                message: "Failed to check Arcane Scholar achievement",
                error: error.message
            });
        }
    }


};

export default FriendRequestController;
