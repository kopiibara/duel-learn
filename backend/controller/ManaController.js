import dotenv from 'dotenv';
import { pool } from '../config/db.js';

dotenv.config();

// Simple in-memory transaction cache
const recentTransactions = new Map();

// Add timeout to clean up old transactions (5 minutes)
const TRANSACTION_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const ManaController = {

    userManaReduction: async (req, res) => {
        try {
            const { firebase_uid, manaCost = 10, transactionId = Date.now() } = req.body;

            // Check for duplicate transaction within short timeframe
            const transactionKey = `${firebase_uid}-${transactionId}`;
            if (recentTransactions.has(transactionKey)) {
                console.log(`[${transactionId}] Duplicate transaction detected for ${firebase_uid}`);

                // Return the previously calculated result to avoid database interaction
                const previousResult = recentTransactions.get(transactionKey);
                return res.status(200).json({
                    success: true,
                    mana: previousResult.mana,
                    duplicate: true
                });
            }

            console.log(`[${transactionId}] Starting mana reduction for ${firebase_uid}, amount: ${manaCost}`);

            // Start a transaction for atomic operation
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // First, log the mana before update for debugging
                const [beforeUpdate] = await connection.query(
                    "SELECT mana, account_type FROM user_info WHERE firebase_uid = ?",
                    [firebase_uid]
                );

                if (!beforeUpdate.length) {
                    console.log(`[${transactionId}] User not found: ${firebase_uid}`);
                    await connection.rollback();
                    connection.release();
                    return res.status(404).json({ error: 'User not found' });
                }

                const originalMana = beforeUpdate[0].mana;
                console.log(`[${transactionId}] Original mana: ${originalMana}`);

                // Check if user is premium - skip mana deduction if premium
                if (beforeUpdate[0].account_type !== 'premium') {
                    // Check if user has enough mana
                    if (originalMana < manaCost) {
                        console.log(`[${transactionId}] Insufficient mana: ${originalMana} < ${manaCost}`);
                        await connection.rollback();
                        connection.release();
                        return res.status(400).json({ error: 'Insufficient mana' });
                    }

                    // Update mana using the value from the frontend
                    console.log(`[${transactionId}] Reducing mana by ${manaCost}`);
                    await connection.query(
                        `UPDATE user_info SET mana = mana - ? WHERE firebase_uid = ?`,
                        [manaCost, firebase_uid]
                    );
                } else {
                    console.log(`[${transactionId}] User is premium, skipping mana deduction`);
                }

                // Get updated mana value
                const [afterUpdate] = await connection.query(
                    "SELECT mana FROM user_info WHERE firebase_uid = ?",
                    [firebase_uid]
                );

                const updatedMana = afterUpdate[0].mana;
                console.log(`[${transactionId}] Updated mana: ${updatedMana}`);

                await connection.commit();
                connection.release();

                console.log(`[${transactionId}] Transaction complete: ${originalMana} → ${updatedMana}`);

                // Store transaction result before returning
                recentTransactions.set(transactionKey, {
                    mana: updatedMana,
                    timestamp: Date.now()
                });

                // Set timeout to remove this transaction from cache
                setTimeout(() => {
                    recentTransactions.delete(transactionKey);
                }, TRANSACTION_CACHE_TIMEOUT);

                return res.status(200).json({
                    success: true,
                    mana: updatedMana
                });
            } catch (error) {
                console.error(`[${transactionId}] Transaction error:`, error);
                await connection.rollback();
                connection.release();
                throw error;
            }
        } catch (error) {
            console.error('Error reducing mana:', error);
            return res.status(500).json({ error: 'Internal server error' });
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
            const elapsedMinutes = Math.max(0, (now - lastUpdate) / (1000 * 60));

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
            const elapsedMinutes = Math.max(0, (now - lastUpdate) / (1000 * 60));

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

            // Calculate elapsed time in minutes (ensure it's not negative)
            const elapsedMinutes = Math.max(0, (now - lastUpdate) / (1000 * 60));

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