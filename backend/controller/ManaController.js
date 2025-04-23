import dotenv from 'dotenv';
import { pool } from '../config/db.js';

dotenv.config();

const ManaController = {

    userManaReduction: async (req, res) => {
        try {
            const { firebase_uid } = req.body;

            // First check if user has enough mana
            const [userInfo] = await pool.query(
                "SELECT mana FROM user_info WHERE firebase_uid = ?",
                [firebase_uid]
            );

            if (!userInfo.length || userInfo[0].mana < 10) {
                return res.status(400).json({ error: 'Insufficient mana' });
            }

            // Update mana (reduce by 10)
            const updateQuery = `UPDATE user_info SET mana = mana - 10 WHERE firebase_uid = ?`;
            await pool.query(updateQuery, [firebase_uid]);

            // Get updated mana value
            const [updatedInfo] = await pool.query(
                "SELECT mana FROM user_info WHERE firebase_uid = ?",
                [firebase_uid]
            );

            res.status(200).json({
                success: true,
                mana: updatedInfo[0].mana
            });
        } catch (error) {
            console.error('Error reducing mana:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    replenishMana: async (req, res) => {
        try {
            const { firebase_uid } = req.body;

            // Get user's current mana and last update time
            const [userData] = await pool.query(
                "SELECT mana, last_mana_update, max_mana FROM user_info WHERE firebase_uid = ?",
                [firebase_uid]
            );

            if (!userData.length) {
                return res.status(404).json({ error: 'User not found' });
            }

            const { mana, last_mana_update, max_mana = 200 } = userData[0];
            const now = new Date();
            const lastUpdate = last_mana_update ? new Date(last_mana_update) : new Date(now - 3600000); // Default to 1 hour ago if null

            // Calculate elapsed time in minutes
            const elapsedMinutes = (now - lastUpdate) / (1000 * 60);

            // Calculate mana to replenish (1.67 mana per minute = 200 per 2 hours)
            const replenishRate = 200 / (3 * 60); // mana per minute
            let manaToAdd = Math.floor(elapsedMinutes * replenishRate);

            // Cap at max_mana
            const newMana = Math.min(mana + manaToAdd, max_mana);

            // Update user's mana and last update time
            await pool.query(
                "UPDATE user_info SET mana = ?, last_mana_update = ? WHERE firebase_uid = ?",
                [newMana, now, firebase_uid]
            );

            res.status(200).json({
                success: true,
                mana: newMana,
                replenished: newMana - mana
            });
        } catch (error) {
            console.error('Error replenishing mana:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getUserMana: async (req, res) => {
        try {
            const { firebase_uid } = req.params;

            // Get user's current mana and last update time
            const [userData] = await pool.query(
                "SELECT mana, last_mana_update, max_mana FROM user_info WHERE firebase_uid = ?",
                [firebase_uid]
            );

            if (!userData.length) {
                return res.status(404).json({ error: 'User not found' });
            }

            const { mana, last_mana_update, max_mana = 200 } = userData[0];
            const now = new Date();
            const lastUpdate = last_mana_update ? new Date(last_mana_update) : new Date(now - 3600000);

            // Calculate elapsed time in minutes
            const elapsedMinutes = (now - lastUpdate) / (1000 * 60);

            // Calculate mana to replenish (1.67 mana per minute = 200 per 2 hours)
            const replenishRate = 200 / (3 * 60); // mana per minute
            let manaToAdd = Math.floor(elapsedMinutes * replenishRate);

            // Cap at max_mana
            const newMana = Math.min(mana + manaToAdd, max_mana);

            if (newMana > mana) {
                // Update user's mana and last update time
                await pool.query(
                    "UPDATE user_info SET mana = ?, last_mana_update = ? WHERE firebase_uid = ?",
                    [newMana, now, firebase_uid]
                );
            }

            res.status(200).json({
                success: true,
                mana: newMana
            });
        } catch (error) {
            console.error('Error getting user mana:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getManaDetails: async (req, res) => {
        try {
            const { firebase_uid } = req.params;

            // Get user's detailed mana information
            const [userData] = await pool.query(
                "SELECT mana, last_mana_update, max_mana FROM user_info WHERE firebase_uid = ?",
                [firebase_uid]
            );

            if (!userData.length) {
                return res.status(404).json({ error: 'User not found' });
            }

            const { mana, last_mana_update, max_mana = 200 } = userData[0];
            const now = new Date();
            const lastUpdate = last_mana_update ? new Date(last_mana_update) : new Date(now - 3600000);

            // Calculate elapsed time in minutes
            const elapsedMinutes = (now - lastUpdate) / (1000 * 60);

            // Calculate mana replenishment rate and settings
            const replenishRatePerMinute = 200 / (3 * 60); // mana per minute
            const replenishRatePerHour = replenishRatePerMinute * 60;
            const timeToFullReplenish = (max_mana - mana) / replenishRatePerMinute; // minutes
            
            // Calculate mana to add based on elapsed time
            let manaToAdd = Math.floor(elapsedMinutes * replenishRatePerMinute);
            
            // Cap at max_mana
            const currentMana = Math.min(mana + manaToAdd, max_mana);

            // Calculate percentage filled
            const percentageFilled = (currentMana / max_mana) * 100;

            // Update user's mana if needed (no need for return value)
            if (currentMana > mana) {
                await pool.query(
                    "UPDATE user_info SET mana = ?, last_mana_update = ? WHERE firebase_uid = ?",
                    [currentMana, now, firebase_uid]
                );
            }

            res.status(200).json({
                success: true,
                mana: {
                    current: currentMana,
                    maximum: max_mana,
                    percentageFilled: percentageFilled,
                    lastUpdated: lastUpdate.toISOString(),
                    replenishRate: {
                        perMinute: replenishRatePerMinute,
                        perHour: replenishRatePerHour
                    },
                    timeToFull: {
                        minutes: Math.ceil(timeToFullReplenish),
                        formattedTime: `${Math.floor(timeToFullReplenish / 60)}h ${Math.ceil(timeToFullReplenish % 60)}m`
                    },
                    isFull: currentMana >= max_mana
                }
            });
        } catch (error) {
            console.error('Error getting detailed mana info:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default ManaController;