import { pool } from "../config/db.js";

const formatImageToBase64 = (imageBuffer) => {
    if (!imageBuffer) return null;
    const base64String = imageBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64String}`;
};

const SearchController = {
    globalSearch: async (req, res) => {
        const { query } = req.params;
        let connection;

        try {
            if (!query || query.trim() === '') {
                return res.status(400).json({ message: "Search query cannot be empty" });
            }

            connection = await pool.getConnection();

            // Fetch users
            const [users] = await connection.execute(
                `SELECT firebase_uid, username, level, display_picture, exp
                 FROM user_info 
                 WHERE LOWER(username) LIKE LOWER(?)
                 ORDER BY level DESC, username ASC 
                 LIMIT 10`,
                [`%${query}%`]
            );

            // Fetch study materials
            const [materials] = await connection.execute(
                `SELECT study_material_id, title, tags, total_items, 
                        created_by, created_by_id, total_views, created_at, status, visibility  
                 FROM study_material_info 
                 WHERE LOWER(title) LIKE LOWER(?)
                 AND status = 'active' AND visibility = 0
                 ORDER BY total_views DESC, created_at DESC
                 LIMIT 10`,
                [`%${query}%`]
            );

            res.status(200).json({
                users,
                study_materials: materials,
                query,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ message: "Error performing search", details: error.message });
        } finally {
            if (connection) connection.release();
        }
    },

    searchUsers: async (req, res) => {
        const { query } = req.params;
        let connection;

        try {
            console.log('Searching users with query:', query);

            if (!query || query.trim() === '') {
                return res.status(400).json({ message: "Search query cannot be empty" });
            }

            connection = await pool.getConnection();

            // Search users with more detailed information
            const [users] = await connection.execute(
                `SELECT firebase_uid, username, level, display_picture, 
                        created_at, exp 
                 FROM user_info 
                 WHERE LOWER(username) LIKE LOWER(?) 
                 ORDER BY level DESC, username ASC 
                 LIMIT 20`,
                [`%${query}%`]
            );

            // Format user data
            const formattedUsers = users.map(user => ({
                firebase_uid: user.firebase_uid,
                username: user.username,
                level: user.level || 0,
                exp: user.exp || 0,
                display_picture: user.display_picture || null,
                created_at: user.created_at
            }));

            console.log(`Found ${users.length} users matching "${query}"`);

            res.status(200).json(formattedUsers);
        } catch (error) {
            console.error("User search error:", error);
            res.status(500).json({
                message: "Error searching users",
                details: error.message || "Unknown database error"
            });
        } finally {
            if (connection) {
                try {
                    connection.release();
                } catch (err) {
                    console.error("Error releasing connection:", err);
                }
            }
        }
    },

    searchStudyMaterials: async (req, res) => {
        const { query } = req.params;
        let connection;

        try {
            console.log('Searching study materials with query:', query);

            if (!query || query.trim() === '') {
                return res.status(400).json({ message: "Search query cannot be empty" });
            }

            connection = await pool.getConnection();

            // Search study materials with simpler query for debugging
            const [materials] = await connection.execute(
                `SELECT i.study_material_id, i.title, i.tags, i.total_items,
                        i.created_by, i.created_by_id, i.total_views, i.created_at,
                        i.status, i.visibility 
                 FROM study_material_info i
                 WHERE LOWER(i.title) LIKE LOWER(?)
                 AND i.status = 'active' AND i.visibility = 0
                 ORDER BY i.total_views DESC, i.created_at DESC
                 LIMIT 20`,
                [`%${query}%`]
            );

            console.log(`Found ${materials.length} study materials matching "${query}"`);

            // Process study materials (simpler version for debugging)
            const studyMaterials = materials.map(info => ({
                study_material_id: info.study_material_id,
                title: info.title,
                tags: typeof info.tags === 'string' ? JSON.parse(info.tags) : [],
                total_items: info.total_items || 0,
                created_by: info.created_by || '',
                created_by_id: info.created_by_id || '',
                total_views: info.total_views || 0,
                created_at: info.created_at,
                status: info.status,
                visibility: info.visibility,
                items: [] // Simplified for debugging
            }));

            res.status(200).json(studyMaterials);
        } catch (error) {
            console.error("Study material search error:", error);
            res.status(500).json({
                message: "Error searching study materials",
                details: error.message || "Unknown database error"
            });
        } finally {
            if (connection) {
                try {
                    connection.release();
                } catch (err) {
                    console.error("Error releasing connection:", err);
                }
            }
        }
    },

    // Add this new method to get a user's profile and study materials together
    getUserWithMaterials: async (req, res) => {
        const { username } = req.params;
        let connection;

        try {
            console.log('Fetching user profile and materials for:', username);

            if (!username || username.trim() === '') {
                return res.status(400).json({ message: "Username cannot be empty" });
            }

            connection = await pool.getConnection();

            // Get user profile
            const [users] = await connection.execute(
                `SELECT firebase_uid, username, level, display_picture, exp
                 FROM user_info 
                 WHERE username = ?
                 LIMIT 1`,
                [username]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = {
                firebase_uid: users[0].firebase_uid,
                username: users[0].username,
                level: users[0].level || 0,
                exp: users[0].exp || 0,
                display_picture: users[0].display_picture,
                created_at: users[0].created_at
            };

            // Get user's study materials
            const [materials] = await connection.execute(
                `SELECT study_material_id, title, tags, total_items, 
                        created_by, created_by_id, total_views, created_at,
                        status, visibility  
                 FROM study_material_info 
                 WHERE created_by = ? AND status = 'active'
                 ORDER BY created_at DESC`,
                [username]
            );

            // Process study materials
            const studyMaterials = materials.map(info => ({
                study_material_id: info.study_material_id,
                title: info.title,
                tags: typeof info.tags === 'string' ? JSON.parse(info.tags) : [],
                total_items: info.total_items || 0,
                created_by: info.created_by || '',
                created_by_id: info.created_by_id || '',
                total_views: info.total_views || 0,
                created_at: info.created_at,
                status: info.status,
                visibility: info.visibility,
                items: [] // We'll keep this simple for now to avoid heavy queries
            }));

            res.status(200).json({
                user,
                study_materials: studyMaterials,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error fetching user profile and materials:", error);
            res.status(500).json({
                message: "Error fetching user profile and materials",
                details: error.message
            });
        } finally {
            if (connection) connection.release();
        }
    }
};

export default SearchController;