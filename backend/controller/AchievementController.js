import { pool } from "../config/db.js";
import NodeCache from "node-cache";
import { getIO } from '../socket.js';


// Create cache instance with 10-minute default TTL and 2-minute check period
const achievementCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Cache invalidation helper function
const invalidateAchievementCaches = (firebase_uid) => {
    // Clear general achievement cache
    achievementCache.del('all_achievements');

    // Clear user-specific caches
    if (firebase_uid) {
        achievementCache.del(`mystic_elder_${firebase_uid}`);
        achievementCache.del(`wisdom_collector_${firebase_uid}`);
        achievementCache.del(`arcane_scholar_${firebase_uid}`);
    }

    // Clear any other cache keys related to this user
    const allKeys = achievementCache.keys();
    allKeys.forEach(key => {
        if (key.includes(firebase_uid)) {
            achievementCache.del(key);
        }
    });
};

const AchievementController = {

    getAchievement: async (req, res) => {
        try {
            // Check if force refresh parameter exists
            const skipCache = req.query.timestamp !== undefined;
            const cacheKey = 'all_achievements';

            // Check cache first unless skipping
            if (!skipCache) {
                const cachedData = achievementCache.get(cacheKey);
                if (cachedData) {
                    console.log("Achievement cache hit for all achievements");
                    return res.status(200).json(cachedData);
                }
            }

            const [rows] = await pool.query(
                `SELECT achievement_id, achievement_name, achievement_description, 
                achievement_requirement, achievement_level, achievement_picture_url 
                FROM achievements WHERE achievement_level = 1`);

            const result = {
                success: true,
                data: rows,
            };

            // Cache the result
            achievementCache.set(cacheKey, result, 3600); // Cache for 1 hour

            res.status(200).json(result);
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
            const skipCache = req.query.timestamp !== undefined;
            const cacheKey = `mystic_elder_${firebase_uid}`;

            // Check cache first unless skipping
            if (!skipCache) {
                const cachedData = achievementCache.get(cacheKey);
                if (cachedData) {
                    console.log(`Cache hit for Mystic Elder - user: ${firebase_uid}`);
                    return res.status(200).json(cachedData);
                }
            }

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

            const result = {
                success: true,
                userLevel,
                mysticElderAchievement: {
                    ...mysticElderAchievement,
                    achieved
                }
            };

            // If the achievement was just earned, emit an event
            if (achieved && userLevel >= mysticElderAchievement.achievement_requirement) {
                const io = getIO();
                io.emit('achievementUnlocked', {
                    firebase_uid,
                    achievement_name: 'Mystic Elder',
                    achievement_level: userLevel,
                    timestamp: new Date().toISOString()
                });
            }

            // Cache the result (5 minutes TTL)
            achievementCache.set(cacheKey, result, 3600);

            res.status(200).json(result);
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
            const skipCache = req.query.timestamp !== undefined;
            const cacheKey = `wisdom_collector_${firebase_uid}`;

            // Check cache first unless skipping
            if (!skipCache) {
                const cachedData = achievementCache.get(cacheKey);
                if (cachedData) {
                    console.log(`Cache hit for Wisdom Collector - user: ${firebase_uid}`);
                    return res.status(200).json(cachedData);
                }
            }

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

            const result = {
                success: true,
                userStudyMaterialCount,
                wisdomCollectorAchievement: {
                    ...wisdomCollectorAchievement,
                    achieved
                }
            };

            // If the achievement was just earned, emit an event
            if (achieved && userStudyMaterialCount >= wisdomCollectorAchievement.achievement_requirement) {
                const io = getIO();
                io.emit('achievementUnlocked', {
                    firebase_uid,
                    achievement_name: 'Wisdom Collector',
                    achievement_level: userStudyMaterialCount,
                    timestamp: new Date().toISOString()
                });
            }

            // Cache the result (5 minutes TTL)
            achievementCache.set(cacheKey, result, 3600);

            res.status(200).json(result);
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
            const skipCache = req.query.timestamp !== undefined;
            const cacheKey = `arcane_scholar_${firebase_uid}`;

            // Check cache first unless skipping
            if (!skipCache) {
                const cachedData = achievementCache.get(cacheKey);
                if (cachedData) {
                    console.log(`Cache hit for Arcane Scholar - user: ${firebase_uid}`);
                    return res.status(200).json(cachedData);
                }
            }

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

            const result = {
                success: true,
                userStudyMaterialCount,
                arcaneScholarAchievement: {
                    ...arcaneScholarAchievement,
                    achieved
                }
            };

            // If the achievement was just earned, emit an event
            if (achieved && userStudyMaterialCount >= arcaneScholarAchievement.achievement_requirement) {
                const io = getIO();
                io.emit('achievementUnlocked', {
                    firebase_uid,
                    achievement_name: 'Arcane Scholar',
                    achievement_level: userStudyMaterialCount,
                    timestamp: new Date().toISOString()
                });
            }

            // Cache the result (5 minutes TTL)
            achievementCache.set(cacheKey, result, 3600);

            res.status(200).json(result);
        } catch (error) {
            console.error("Error checking Arcane Scholar achievement:", error);
            res.status(500).json({
                success: false,
                message: "Failed to check Arcane Scholar achievement",
                error: error.message
            });
        }
    },

    getUserLongestStreak: async (req, res) => {
        try {
            const { firebase_uid } = req.params;
            const skipCache = req.query.timestamp !== undefined;
            const cacheKey = `longest_streak_${firebase_uid}`;

            // Check cache first unless skipping
            if (!skipCache) {
                const cachedData = achievementCache.get(cacheKey);
                if (cachedData) {
                    console.log(`Cache hit for Longest Streak - user: ${firebase_uid}`);
                    return res.status(200).json(cachedData);
                }
            }

            // Get user's highest streak using the longest_win_streak column
            const [result] = await pool.query(
                `SELECT longest_win_streak as highest_streak FROM user_info WHERE firebase_uid = ?`,
                [firebase_uid]
            );

            // Fetch the Duelist achievement details
            const [duelistResult] = await pool.query(
                `SELECT achievement_id, achievement_name, achievement_description, 
                achievement_requirement, achievement_level, achievement_picture_url 
                FROM achievements WHERE achievement_name = 'Duelist'`
            );

            if (duelistResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Duelist achievement not found",
                });
            }

            const duelistAchievement = duelistResult[0];
            const achieved = result[0].highest_streak >= duelistAchievement.achievement_requirement;

            const response = {
                success: true,
                highest_streak: result[0].highest_streak,
                duelistAchievement: {
                    ...duelistAchievement,
                    achieved
                }
            };

            // If the achievement was just earned, emit an event
            if (achieved && result[0].highest_streak >= duelistAchievement.achievement_requirement) {
                const io = getIO();
                io.emit('achievementUnlocked', {
                    firebase_uid,
                    achievement_name: 'Duelist',
                    achievement_level: result[0].highest_streak,
                    timestamp: new Date().toISOString()
                });
            }

            // Cache the result (5 minutes TTL)
            achievementCache.set(cacheKey, response, 3600);

            res.status(200).json(response);
        } catch (error) {
            console.error("Error fetching user highest streak:", error);
            res.status(500).json({
                success: false,
                message: "Failed to retrieve user highest streak",
                error: error.message
            });
        }
    },

    getUserTotalPvPMatches: async (req, res) => {
        try {
            const { firebase_uid } = req.params;
            const skipCache = req.query.timestamp !== undefined;
            const cacheKey = `total_pvp_matches_${firebase_uid}`;

            // Check cache first unless skipping
            if (!skipCache) {
                const cachedData = achievementCache.get(cacheKey);
                if (cachedData) {
                    console.log(`Cache hit for Total PvP Matches - user: ${firebase_uid}`);
                    return res.status(200).json(cachedData);
                }
            }

            // Check if user exists
            const [userExists] = await pool.query(
                'SELECT 1 FROM user_info WHERE firebase_uid = ?',
                [firebase_uid]
            );

            if (userExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Count matches where user was either host or guest
            const [result] = await pool.query(
                `SELECT COUNT(*) as total_matches 
                 FROM pvp_battle_sessions
                 WHERE host_id = ? OR guest_id = ?`,
                [firebase_uid, firebase_uid]
            );

            // Fetch the Battle Archmage achievement
            const [battleArchmageResult] = await pool.query(
                `SELECT achievement_id, achievement_name, achievement_description, 
                achievement_requirement, achievement_level, achievement_picture_url 
                FROM achievements WHERE achievement_name = 'Battle Archmage'`
            );

            if (battleArchmageResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Battle Archmage achievement not found",
                });
            }

            const battleArchmageAchievement = battleArchmageResult[0];
            const totalMatches = result[0].total_matches || 0;
            const achieved = totalMatches >= battleArchmageAchievement.achievement_requirement;

            const response = {
                success: true,
                total_matches: totalMatches,
                battleArchmageAchievement: {
                    ...battleArchmageAchievement,
                    achieved
                }
            };

            // If the achievement was just earned, emit an event
            if (achieved && totalMatches >= battleArchmageAchievement.achievement_requirement) {
                const io = getIO();
                io.emit('achievementUnlocked', {
                    firebase_uid,
                    achievement_name: 'Battle Archmage',
                    achievement_level: totalMatches,
                    timestamp: new Date().toISOString()
                });
            }

            // Cache the result (5 minutes TTL)
            achievementCache.set(cacheKey, response, 3600);

            res.status(200).json(response);
        } catch (error) {
            console.error("Error fetching user total PvP matches:", error);
            res.status(500).json({
                success: false,
                message: "Failed to retrieve user total PvP matches",
                error: error.message
            });
        }
    },

    getUserTotalPvPWins: async (req, res) => {
        try {
            const { firebase_uid } = req.params;
            const skipCache = req.query.timestamp !== undefined;
            const cacheKey = `total_pvp_wins_${firebase_uid}`;

            // Check cache first unless skipping
            if (!skipCache) {
                const cachedData = achievementCache.get(cacheKey);
                if (cachedData) {
                    console.log(`Cache hit for Total PvP Wins - user: ${firebase_uid}`);
                    return res.status(200).json(cachedData);
                }
            }

            // Check if user exists
            const [userExists] = await pool.query(
                'SELECT 1 FROM user_info WHERE firebase_uid = ?',
                [firebase_uid]
            );

            if (userExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Count matches where user is the winner
            const [result] = await pool.query(
                `SELECT COUNT(*) as total_wins 
                 FROM pvp_battle_sessions
                 WHERE winner_id = ?`,
                [firebase_uid]
            );

            // Fetch the Best Magician achievement
            const [bestMagicianResult] = await pool.query(
                `SELECT achievement_id, achievement_name, achievement_description, 
                achievement_requirement, achievement_level, achievement_picture_url 
                FROM achievements WHERE achievement_name = 'Best Magician'`
            );

            if (bestMagicianResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Best Magician achievement not found",
                });
            }

            const bestMagicianAchievement = bestMagicianResult[0];
            const totalWins = result[0].total_wins || 0;
            const achieved = totalWins >= bestMagicianAchievement.achievement_requirement;

            const response = {
                success: true,
                total_wins: totalWins,
                bestMagicianAchievement: {
                    ...bestMagicianAchievement,
                    achieved
                }
            };

            // If the achievement was just earned, emit an event
            if (achieved && totalWins >= bestMagicianAchievement.achievement_requirement) {
                const io = getIO();
                io.emit('achievementUnlocked', {
                    firebase_uid,
                    achievement_name: 'Best Magician',
                    achievement_level: totalWins,
                    timestamp: new Date().toISOString()
                });
            }

            // Cache the result (5 minutes TTL)
            achievementCache.set(cacheKey, response, 3600);

            res.status(200).json(response);
        } catch (error) {
            console.error("Error fetching user total PvP wins:", error);
            res.status(500).json({
                success: false,
                message: "Failed to retrieve user total PvP wins",
                error: error.message
            });
        }
    },

    // Add method to programmatically invalidate cache when achievements change
    invalidateCache: async (req, res) => {
        const { firebase_uid } = req.body;

        invalidateAchievementCaches(firebase_uid);

        res.status(200).json({
            success: true,
            message: "Achievement cache invalidated"
        });
    }
};

export default AchievementController;
