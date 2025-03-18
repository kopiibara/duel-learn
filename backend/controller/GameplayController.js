import { pool } from '../config/db.js';

export const initializeBattle = async (req, res) => {
    try {
        const {
            lobby_code,
            host_id,
            guest_id,
            host_username,
            guest_username,
            host_in_battle,
            guest_in_battle
        } = req.body;

        // Validate required fields
        if (!lobby_code || !host_id || !guest_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Check if battle already exists
        const [existingBattle] = await pool.query(
            `SELECT * FROM battle_gameplay 
             WHERE lobby_code = ? AND is_active = true`,
            [lobby_code]
        );

        if (existingBattle.length > 0) {
            // Update existing battle with player entry status
            const updateQuery = `
                UPDATE battle_gameplay 
                SET 
                    ${host_in_battle ? 'host_in_battle = true, host_username = ?' : 'guest_in_battle = true, guest_username = ?'},
                    updated_at = CURRENT_TIMESTAMP
                WHERE lobby_code = ? AND is_active = true
            `;

            const updateParams = [
                host_in_battle ? host_username : guest_username
            ];

            updateParams.push(lobby_code);

            await pool.query(updateQuery, updateParams);

            // Check if both players are now in battle
            const [updatedBattle] = await pool.query(
                `SELECT * FROM battle_gameplay 
                 WHERE lobby_code = ? AND is_active = true`,
                [lobby_code]
            );

            if (updatedBattle[0].host_in_battle && updatedBattle[0].guest_in_battle) {
                // Both players are in, set battle as started
                // But do NOT set current_turn - it will be set by the host's randomizer
                await pool.query(
                    `UPDATE battle_gameplay 
                     SET battle_started = true,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE lobby_code = ? AND is_active = true`,
                    [lobby_code]
                );

                return res.json({
                    success: true,
                    data: {
                        battle_id: updatedBattle[0].id,
                        lobby_code,
                        current_turn: updatedBattle[0].current_turn,
                        battle_started: true
                    }
                });
            }

            return res.json({
                success: true,
                data: {
                    battle_id: existingBattle[0].id,
                    lobby_code,
                    host_in_battle: existingBattle[0].host_in_battle || host_in_battle,
                    guest_in_battle: existingBattle[0].guest_in_battle || guest_in_battle
                }
            });
        }

        // Initialize new battle with NULL for current_turn
        const query = `
            INSERT INTO battle_gameplay 
            (lobby_code, host_id, host_username, guest_id, guest_username, current_turn, round_number, 
             total_rounds, host_score, guest_score, host_health, guest_health, 
             is_active, host_in_battle, guest_in_battle, battle_started)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            lobby_code,
            host_id,
            host_username,
            guest_id,
            guest_username,
            null, // Set current_turn to NULL - will be set by host randomizer
            1, // Starting round
            30, // Total rounds
            0, // Initial host score
            0, // Initial guest score
            100, // Initial host health
            100, // Initial guest health
            true, // Battle is active
            host_in_battle || false,
            guest_in_battle || false,
            false // Battle not started until both players are in
        ];

        const [result] = await pool.query(query, values);

        res.status(201).json({
            success: true,
            data: {
                battle_id: result.insertId,
                lobby_code,
                host_in_battle: host_in_battle || false,
                guest_in_battle: guest_in_battle || false
            }
        });

    } catch (error) {
        console.error('Error initializing battle:', error);
        res.status(500).json({
            success: false,
            message: "Failed to initialize battle",
            error: error.message
        });
    }
};

export const getBattleState = async (req, res) => {
    try {
        const { lobby_code } = req.params;

        const query = `
            SELECT * FROM battle_gameplay 
            WHERE lobby_code = ? AND is_active = true
            ORDER BY created_at DESC LIMIT 1
        `;

        const [battles] = await pool.query(query, [lobby_code]);

        if (battles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active battle found for this lobby"
            });
        }

        res.json({
            success: true,
            data: battles[0]
        });

    } catch (error) {
        console.error('Error getting battle state:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get battle state",
            error: error.message
        });
    }
};

export const playCard = async (req, res) => {
    try {
        const {
            lobby_code,
            player_id,
            card_id,
            is_host // Boolean to identify if the player is host
        } = req.body;

        // First, verify it's the player's turn
        const [currentBattle] = await pool.query(
            `SELECT * FROM battle_gameplay 
             WHERE lobby_code = ? AND is_active = true
             ORDER BY created_at DESC LIMIT 1`,
            [lobby_code]
        );

        if (currentBattle.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active battle found"
            });
        }

        const battle = currentBattle[0];

        // Verify it's the player's turn (now using username)
        if (battle.current_turn !== player_id) {
            return res.status(400).json({
                success: false,
                message: "Not your turn"
            });
        }

        // Update the appropriate card field and switch turns
        const cardField = is_host ? 'host_card' : 'guest_card';
        const nextTurn = is_host ? battle.guest_username : battle.host_username;

        const updateQuery = `
            UPDATE battle_gameplay 
            SET ${cardField} = ?,
                current_turn = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE lobby_code = ? AND is_active = true
        `;

        const [result] = await pool.query(updateQuery, [
            card_id,
            nextTurn,
            lobby_code
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Failed to update battle"
            });
        }

        res.json({
            success: true,
            message: "Card played successfully",
            data: {
                next_turn: nextTurn
            }
        });

    } catch (error) {
        console.error('Error playing card:', error);
        res.status(500).json({
            success: false,
            message: "Failed to play card",
            error: error.message
        });
    }
};

export const getCurrentTurn = async (req, res) => {
    try {
        const { lobby_code } = req.params;

        const query = `
            SELECT current_turn, host_id, guest_id, round_number 
            FROM battle_gameplay 
            WHERE lobby_code = ? AND is_active = true
            ORDER BY created_at DESC LIMIT 1
        `;

        const [battles] = await pool.query(query, [lobby_code]);

        if (battles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active battle found"
            });
        }

        res.json({
            success: true,
            data: {
                current_turn: battles[0].current_turn,
                host_id: battles[0].host_id,
                guest_id: battles[0].guest_id,
                round_number: battles[0].round_number
            }
        });

    } catch (error) {
        console.error('Error getting current turn:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get current turn",
            error: error.message
        });
    }
};

export const getBattleStatus = async (req, res) => {
    try {
        const { lobby_code } = req.params;

        const query = `
            SELECT 
                is_active,
                winner_id,
                battle_end_reason,
                host_health,
                guest_health,
                host_score,
                guest_score,
                round_number,
                total_rounds
            FROM battle_gameplay 
            WHERE lobby_code = ?
            ORDER BY created_at DESC LIMIT 1
        `;

        const [battles] = await pool.query(query, [lobby_code]);

        if (battles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Battle not found"
            });
        }

        res.json({
            success: true,
            data: battles[0]
        });

    } catch (error) {
        console.error('Error getting battle status:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get battle status",
            error: error.message
        });
    }
};

export const updateTurn = async (req, res) => {
    try {
        const { lobby_code, current_turn } = req.body;

        if (!lobby_code || !current_turn) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        console.log(`Updating turn for lobby ${lobby_code} to ${current_turn}`);

        // Update the current_turn in the database
        const query = `
            UPDATE battle_gameplay 
            SET current_turn = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE lobby_code = ? AND is_active = true
        `;

        const [result] = await pool.query(query, [current_turn, lobby_code]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Battle not found"
            });
        }

        console.log(`Successfully updated turn to ${current_turn}`);

        res.json({
            success: true,
            message: "Turn updated successfully",
            data: {
                current_turn
            }
        });

    } catch (error) {
        console.error('Error updating turn:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update turn",
            error: error.message
        });
    }
}; 