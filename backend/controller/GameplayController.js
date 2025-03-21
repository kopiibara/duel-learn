import { pool } from '../config/db.js';

export const initializeBattle = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

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
        const [existingBattle] = await connection.query(
            `SELECT * FROM battle_gameplay 
             WHERE lobby_code = ? AND is_active = true`,
            [lobby_code]
        );

        if (existingBattle.length > 0) {
            // Update existing battle with player entry status
            // Also update IDs to ensure correct IDs are stored
            const updateQuery = `
                UPDATE battle_gameplay 
                SET 
                    ${host_in_battle ? 'host_in_battle = true, host_username = ?' : 'guest_in_battle = true, guest_username = ?'},
                    ${host_in_battle ? 'host_id = ?' : 'guest_id = ?'},
                    updated_at = CURRENT_TIMESTAMP
                WHERE lobby_code = ? AND is_active = true
            `;

            const updateParams = [
                host_in_battle ? host_username : guest_username,
                host_in_battle ? host_id : guest_id
            ];

            updateParams.push(lobby_code);

            await connection.query(updateQuery, updateParams);

            // Check if both players are now in battle
            const [updatedBattle] = await connection.query(
                `SELECT * FROM battle_gameplay 
                 WHERE lobby_code = ? AND is_active = true`,
                [lobby_code]
            );

            if (updatedBattle[0].host_in_battle && updatedBattle[0].guest_in_battle) {
                // Both players are in, set battle as started
                // But do NOT set current_turn - it will be set by the host's randomizer
                await connection.query(
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
                        battle_started: true,
                        host_id: updatedBattle[0].host_id,
                        guest_id: updatedBattle[0].guest_id
                    }
                });
            }

            return res.json({
                success: true,
                data: {
                    battle_id: existingBattle[0].id,
                    lobby_code,
                    host_in_battle: existingBattle[0].host_in_battle || host_in_battle,
                    guest_in_battle: existingBattle[0].guest_in_battle || guest_in_battle,
                    host_id: existingBattle[0].host_id,
                    guest_id: existingBattle[0].guest_id
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

        const [result] = await connection.query(query, values);

        res.status(201).json({
            success: true,
            data: {
                battle_id: result.insertId,
                lobby_code,
                host_in_battle: host_in_battle || false,
                guest_in_battle: guest_in_battle || false,
                host_id,
                guest_id
            }
        });

    } catch (error) {
        console.error('Error initializing battle:', error);
        res.status(500).json({
            success: false,
            message: "Failed to initialize battle",
            error: error.message
        });
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
};

export const getBattleState = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const { lobby_code } = req.params;

        const query = `
            SELECT * FROM battle_gameplay 
            WHERE lobby_code = ? AND is_active = true
            ORDER BY created_at DESC LIMIT 1
        `;

        const [battles] = await connection.query(query, [lobby_code]);

        if (battles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active battle found for this lobby"
            });
        }

        // Ensure the response includes critical ID fields
        const battleData = {
            ...battles[0],
            host_id: battles[0].host_id,
            guest_id: battles[0].guest_id,
            current_turn: battles[0].current_turn
        };

        res.json({
            success: true,
            data: battleData
        });

    } catch (error) {
        console.error('Error getting battle state:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get battle state",
            error: error.message
        });
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
};

export const playCard = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const {
            lobby_code,
            player_id,
            card_id,
            is_host // Boolean to identify if the player is host
        } = req.body;

        // First, verify it's the player's turn
        const [currentBattle] = await connection.query(
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

        // Verify it's the player's turn (using player_id)
        if (battle.current_turn !== player_id) {
            return res.status(400).json({
                success: false,
                message: "Not your turn"
            });
        }

        // Update the appropriate card field and switch turns
        const cardField = is_host ? 'host_card' : 'guest_card';
        // Use IDs instead of usernames for turn tracking
        const nextTurn = is_host ? battle.guest_id : battle.host_id;

        const updateQuery = `
            UPDATE battle_gameplay 
            SET ${cardField} = ?,
                current_turn = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE lobby_code = ? AND is_active = true
        `;

        const [result] = await connection.query(updateQuery, [
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
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
};

export const getCurrentTurn = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const { lobby_code } = req.params;

        const query = `
            SELECT current_turn, host_id, guest_id, round_number, host_username, guest_username 
            FROM battle_gameplay 
            WHERE lobby_code = ? AND is_active = true
            ORDER BY created_at DESC LIMIT 1
        `;

        const [battles] = await connection.query(query, [lobby_code]);

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
                host_username: battles[0].host_username,
                guest_username: battles[0].guest_username,
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
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
};

export const getBattleStatus = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

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
                host_id,
                guest_id,
                host_username,
                guest_username,
                round_number,
                total_rounds
            FROM battle_gameplay 
            WHERE lobby_code = ?
            ORDER BY created_at DESC LIMIT 1
        `;

        const [battles] = await connection.query(query, [lobby_code]);

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
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
};

export const updateTurn = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const { lobby_code, current_turn } = req.body;

        if (!lobby_code || !current_turn) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const query = `
            UPDATE battle_gameplay 
            SET current_turn = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE lobby_code = ? AND is_active = true
        `;

        const [result] = await connection.query(query, [current_turn, lobby_code]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "No active battle found for this lobby"
            });
        }

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
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
};

export const endBattle = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const {
            lobby_code,
            winner_id,
            battle_end_reason,
            session_id,
            session_uuid
        } = req.body;

        console.log("endBattle request:", {
            lobby_code,
            winner_id,
            battle_end_reason,
            session_id,
            session_uuid
        });

        // Validate required fields
        if (!lobby_code || !battle_end_reason) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: lobby_code and battle_end_reason are required"
            });
        }

        // Determine which identifier to use to find the session
        let sessionQuery, sessionWhereClause;

        if (session_uuid) {
            // If session_uuid is provided, use it
            sessionWhereClause = "session_uuid = ?";
            sessionQuery = session_uuid;
            console.log(`Using session_uuid=${session_uuid} to identify battle`);
        } else if (session_id) {
            // If numeric session_id is provided, use it
            sessionWhereClause = "ID = ?";
            sessionQuery = session_id;
            console.log(`Using session_id=${session_id} to identify battle`);
        } else {
            // If neither is provided, search by lobby_code
            console.log(`No session identifiers provided, searching by lobby_code=${lobby_code}`);
            const [sessionResult] = await connection.query(
                `SELECT ID, session_uuid FROM battle_sessions 
                WHERE lobby_code = ? AND is_active = 1`,
                [lobby_code]
            );

            if (sessionResult.length === 0) {
                console.log(`No active battle session found for lobby_code=${lobby_code}`);

                // Try looking for any session with this lobby code, even inactive ones
                const [anySessionResult] = await connection.query(
                    `SELECT ID, session_uuid, is_active FROM battle_sessions 
                    WHERE lobby_code = ? 
                    ORDER BY created_at DESC LIMIT 1`,
                    [lobby_code]
                );

                if (anySessionResult.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "No battle session found for this lobby"
                    });
                }

                console.log(`Found inactive session for lobby_code=${lobby_code}:`, anySessionResult[0]);

                // Use the found session even if inactive
                if (anySessionResult[0].session_uuid) {
                    sessionWhereClause = "session_uuid = ?";
                    sessionQuery = anySessionResult[0].session_uuid;
                } else {
                    sessionWhereClause = "ID = ?";
                    sessionQuery = anySessionResult[0].ID;
                }

                console.log(`Using ${sessionWhereClause}=${sessionQuery} from inactive session`);
            } else {
                // Prefer session_uuid if available
                if (sessionResult[0].session_uuid) {
                    sessionWhereClause = "session_uuid = ?";
                    sessionQuery = sessionResult[0].session_uuid;
                } else {
                    sessionWhereClause = "ID = ?";
                    sessionQuery = sessionResult[0].ID;
                }
                console.log(`Found active session with ${sessionWhereClause}=${sessionQuery}`);
            }
        }

        console.log(`Ending battle with session identifier: ${sessionQuery}, using clause: ${sessionWhereClause}`);

        // Get the numeric session ID for the battle_endings table (foreign key)
        const [sessionData] = await connection.query(
            `SELECT ID, session_uuid FROM battle_sessions 
            WHERE ${sessionWhereClause}`,
            [sessionQuery]
        );

        if (sessionData.length === 0) {
            console.log(`Session not found with ${sessionWhereClause}=${sessionQuery}`);
            return res.status(404).json({
                success: false,
                message: "Battle session not found"
            });
        }

        console.log(`Found session data:`, sessionData[0]);
        const sessionId = sessionData[0].ID;
        const finalSessionUuid = sessionData[0].session_uuid;

        // Check if a battle ending record already exists for this session
        const [existingEnding] = await connection.query(
            `SELECT * FROM battle_endings 
            WHERE session_uuid = ?`,
            [finalSessionUuid]
        );

        if (existingEnding.length > 0) {
            console.log(`Battle already ended for session ${finalSessionUuid} with reason: ${existingEnding[0].battle_end_reason}`);
            return res.json({
                success: true,
                message: "Battle was already ended",
                data: {
                    session_id: sessionId,
                    session_uuid: finalSessionUuid,
                    battle_end_reason: existingEnding[0].battle_end_reason,
                    winner_id: existingEnding[0].winner_id
                }
            });
        }

        // 1. Insert record into battle_endings table - use string UUID
        const insertEndingQuery = `
            INSERT INTO battle_endings 
            (session_uuid, winner_id, battle_end_reason)
            VALUES (?, ?, ?)
        `;

        const insertParams = [
            finalSessionUuid, // Use the session UUID string
            winner_id || null,
            battle_end_reason
        ];

        console.log("Insert params:", insertParams);

        const [insertResult] = await connection.query(insertEndingQuery, insertParams);
        console.log("Insert result:", insertResult);

        // 2. Update the battle_sessions table to mark it as inactive
        const updateSessionQuery = `
            UPDATE battle_sessions 
            SET is_active = 0,
                updated_at = CURRENT_TIMESTAMP
            WHERE ${sessionWhereClause}
        `;

        const [result] = await connection.query(updateSessionQuery, [sessionQuery]);
        console.log("Update result:", result);

        // Check if the update was successful
        if (result.affectedRows === 0) {
            console.log(`Failed to update battle session - it may no longer exist or be active`);
            return res.status(404).json({
                success: false,
                message: "Failed to update battle session - it may no longer be active"
            });
        }

        // Log the battle end for debugging
        console.log(`Battle ended: Session ${sessionQuery}, Reason: ${battle_end_reason}, Winner: ${winner_id || 'None'}`);

        res.json({
            success: true,
            message: "Battle ended successfully",
            data: {
                session_id: sessionId,
                session_uuid: finalSessionUuid,
                battle_end_reason,
                winner_id
            }
        });

    } catch (error) {
        console.error('Error ending battle:', error);
        res.status(500).json({
            success: false,
            message: "Failed to end battle",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

export const initializeBattleSession = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const {
            lobby_code,
            host_id,
            guest_id,
            host_username,
            guest_username,
            total_rounds,
            is_active,
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

        // Generate a unique session ID with 'session-' prefix followed by 5 digits
        const sessionUuid = `session-${Math.floor(10000 + Math.random() * 90000)}`;
        console.log(`Generated new session UUID: ${sessionUuid}`);

        // Check if battle session already exists for this lobby
        const [existingSession] = await connection.query(
            `SELECT * FROM battle_sessions 
             WHERE lobby_code = ? AND is_active = true`,
            [lobby_code]
        );

        if (existingSession.length > 0) {
            // Update existing session
            const updateQuery = `
                UPDATE battle_sessions 
                SET host_id = ?,
                    guest_id = ?,
                    host_in_battle = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE lobby_code = ? AND is_active = true
            `;

            await connection.query(updateQuery, [
                host_id,
                guest_id,
                host_in_battle || false,
                lobby_code
            ]);

            // Return updated session data
            const [updatedSession] = await connection.query(
                `SELECT * FROM battle_sessions 
                 WHERE lobby_code = ? AND is_active = true`,
                [lobby_code]
            );

            return res.json({
                success: true,
                data: updatedSession[0]
            });
        }

        // Initialize new battle session
        const query = `
            INSERT INTO battle_sessions 
            (lobby_code, host_id, guest_id, total_rounds, current_turn, is_active, 
             host_in_battle, guest_in_battle, battle_started, session_uuid)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            lobby_code,
            host_id,
            guest_id,
            total_rounds || 30,
            null, // No current turn initially
            is_active || true,
            host_in_battle || false,
            guest_in_battle || false,
            false, // Battle not started until both players are in
            sessionUuid // Add the session UUID
        ];

        const [result] = await connection.query(query, values);

        // Get the newly created session
        const [newSession] = await connection.query(
            `SELECT * FROM battle_sessions WHERE ID = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            data: {
                ...newSession[0],
                session_uuid: sessionUuid
            }
        });

    } catch (error) {
        console.error('Error initializing battle session:', error);
        res.status(500).json({
            success: false,
            message: "Failed to initialize battle session",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

export const updateBattleSession = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const { lobby_code, ...updateData } = req.body;

        if (!lobby_code) {
            return res.status(400).json({
                success: false,
                message: "Missing lobby_code"
            });
        }

        // Build the dynamic update query based on provided fields
        let setClause = '';
        const queryParams = [];

        Object.entries(updateData).forEach(([key, value], index) => {
            setClause += `${key} = ?${index < Object.entries(updateData).length - 1 ? ', ' : ''}`;
            queryParams.push(value);
        });

        if (!setClause) {
            return res.status(400).json({
                success: false,
                message: "No update data provided"
            });
        }

        // Add the lobby_code to parameters
        queryParams.push(lobby_code);

        const query = `
            UPDATE battle_sessions 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE lobby_code = ? AND is_active = true
        `;

        const [result] = await connection.query(query, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Battle session not found or not active"
            });
        }

        // If guest is joining, check if both players are now in battle
        if (updateData.guest_in_battle === true) {
            const [checkSession] = await connection.query(
                `SELECT * FROM battle_sessions
                 WHERE lobby_code = ? AND is_active = true`,
                [lobby_code]
            );

            if (checkSession.length > 0 && checkSession[0].host_in_battle) {
                // Both players are in, update battle_started
                await connection.query(
                    `UPDATE battle_sessions
                     SET battle_started = true, updated_at = CURRENT_TIMESTAMP
                     WHERE lobby_code = ? AND is_active = true`,
                    [lobby_code]
                );
            }
        }

        // Get the updated session data
        const [updatedSession] = await connection.query(
            `SELECT * FROM battle_sessions
             WHERE lobby_code = ? AND is_active = true`,
            [lobby_code]
        );

        res.json({
            success: true,
            message: "Battle session updated successfully",
            data: updatedSession[0]
        });

    } catch (error) {
        console.error('Error updating battle session:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update battle session",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

export const getBattleSessionState = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const { lobby_code } = req.params;

        const query = `
            SELECT * FROM battle_sessions
            WHERE lobby_code = ? AND is_active = true
            ORDER BY created_at DESC LIMIT 1
        `;

        const [sessions] = await connection.query(query, [lobby_code]);

        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active battle session found for this lobby"
            });
        }

        res.json({
            success: true,
            data: sessions[0]
        });

    } catch (error) {
        console.error('Error getting battle session state:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get battle session state",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

// Add this new function to check battle end status
export const getBattleEndStatus = async (req, res) => {
    try {
        const { session_uuid } = req.params;

        if (!session_uuid) {
            return res.status(400).json({
                success: false,
                message: "Missing session UUID"
            });
        }

        console.log(`Checking battle end status for session UUID: ${session_uuid}`);

        // Query the battle_endings table to check if this session has ended
        const query = `
            SELECT be.*, bs.host_id, bs.guest_id
            FROM battle_endings be
            JOIN battle_sessions bs ON be.session_uuid = bs.session_uuid
            WHERE be.session_uuid = ?
        `;

        const [results] = await pool.query(query, [session_uuid]);

        if (results.length === 0) {
            return res.json({
                success: true,
                data: null // Battle hasn't ended yet
            });
        }

        res.json({
            success: true,
            data: results[0]
        });

    } catch (error) {
        console.error('Error checking battle end status:', error);
        res.status(500).json({
            success: false,
            message: "Failed to check battle end status",
            error: error.message
        });
    }
};

// Add new function to check battle end status by numeric session ID
export const getBattleEndStatusById = async (req, res) => {
    try {
        const { session_id } = req.params;

        if (!session_id) {
            return res.status(400).json({
                success: false,
                message: "Missing session ID"
            });
        }

        console.log(`Checking battle end status for session ID: ${session_id}`);

        // Query the battle_endings table to check if this session has ended
        // Join to battle_sessions using numeric ID
        const query = `
            SELECT be.*, bs.host_id, bs.guest_id
            FROM battle_endings be
            JOIN battle_sessions bs ON be.session_uuid = bs.session_uuid
            WHERE bs.ID = ?
        `;

        const [results] = await pool.query(query, [session_id]);

        if (results.length === 0) {
            return res.json({
                success: true,
                data: null // Battle hasn't ended yet
            });
        }

        res.json({
            success: true,
            data: results[0]
        });

    } catch (error) {
        console.error('Error checking battle end status by ID:', error);
        res.status(500).json({
            success: false,
            message: "Failed to check battle end status by ID",
            error: error.message
        });
    }
};

// Add new function to check battle end status by lobby code
export const getBattleEndStatusByLobby = async (req, res) => {
    try {
        const { lobby_code } = req.params;

        if (!lobby_code) {
            return res.status(400).json({
                success: false,
                message: "Missing lobby code"
            });
        }

        console.log(`Checking battle end status for lobby code: ${lobby_code}`);

        // Query the battle_endings table by joining through battle_sessions using lobby_code
        const query = `
            SELECT be.*, bs.host_id, bs.guest_id
            FROM battle_endings be
            JOIN battle_sessions bs ON be.session_uuid = bs.session_uuid
            WHERE bs.lobby_code = ?
            ORDER BY be.created_at DESC LIMIT 1
        `;

        const [results] = await pool.query(query, [lobby_code]);

        if (results.length === 0) {
            return res.json({
                success: true,
                data: null // Battle hasn't ended yet
            });
        }

        res.json({
            success: true,
            data: results[0]
        });

    } catch (error) {
        console.error('Error checking battle end status by lobby code:', error);
        res.status(500).json({
            success: false,
            message: "Failed to check battle end status by lobby code",
            error: error.message
        });
    }
}; 