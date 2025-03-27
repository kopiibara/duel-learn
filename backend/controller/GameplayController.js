import { pool } from '../config/db.js';


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
            guest_in_battle,
            difficulty_mode,
            study_material_id
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
                    difficulty_mode = ?,
                    study_material_id = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE lobby_code = ? AND is_active = true
            `;

            await connection.query(updateQuery, [
                host_id,
                guest_id,
                host_in_battle || false,
                difficulty_mode || null,
                study_material_id || null,
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
             host_in_battle, guest_in_battle, battle_started, session_uuid,
             difficulty_mode, study_material_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            sessionUuid, // Add the session UUID
            difficulty_mode || null,
            study_material_id || null
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

// Add new function to get battle session with study material details
export const getBattleSessionWithMaterial = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const { lobby_code } = req.params;

        if (!lobby_code) {
            return res.status(400).json({
                success: false,
                message: "Missing lobby code"
            });
        }

        // Query to get session with study material details
        const query = `
            SELECT bs.*, 
                   bs.difficulty_mode, 
                   bs.study_material_id
            FROM battle_sessions bs
            WHERE bs.lobby_code = ? AND bs.is_active = true
            ORDER BY bs.created_at DESC 
            LIMIT 1
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
        console.error('Error getting battle session with material details:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get battle session details",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

export const initializeBattleRounds = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const { session_uuid, round_number } = req.body;

        // Validate required fields
        if (!session_uuid) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: session_uuid"
            });
        }

        // Check if entry already exists for this session
        const [existingRounds] = await connection.query(
            `SELECT * FROM battle_rounds 
             WHERE session_uuid = ?`,
            [session_uuid]
        );

        if (existingRounds.length > 0) {
            return res.json({
                success: true,
                message: "Battle rounds already initialized",
                data: existingRounds[0]
            });
        }

        // Initialize a new entry in battle_rounds
        const query = `
            INSERT INTO battle_rounds 
            (session_uuid, round_number)
            VALUES (?, ?)
        `;

        const [result] = await connection.query(query, [
            session_uuid,
            round_number || null
        ]);

        if (result.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: "Failed to initialize battle rounds"
            });
        }

        res.status(201).json({
            success: true,
            message: "Battle rounds initialized successfully",
            data: {
                session_uuid,
                round_number
            }
        });

    } catch (error) {
        console.error('Error initializing battle rounds:', error);
        res.status(500).json({
            success: false,
            message: "Failed to initialize battle rounds",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

// Add new function to update battle rounds with selected card and switch turns
export const updateBattleRound = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const {
            session_uuid,
            player_type,
            card_id,
            is_correct, // Add this new parameter
            lobby_code
        } = req.body;

        // Validate required fields
        if (!session_uuid || !player_type || !card_id || !lobby_code) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: session_uuid, player_type, card_id, and lobby_code are required"
            });
        }

        // Ensure player_type is valid (host or guest)
        if (player_type !== 'host' && player_type !== 'guest') {
            return res.status(400).json({
                success: false,
                message: "Invalid player_type. Must be 'host' or 'guest'"
            });
        }

        // Get current battle session to determine next player
        const [sessionResult] = await connection.query(
            `SELECT * FROM battle_sessions 
            WHERE session_uuid = ? AND is_active = 1`,
            [session_uuid]
        );

        if (sessionResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Battle session not found or not active"
            });
        }

        const session = sessionResult[0];
        // Determine next player's turn
        const currentTurn = session.current_turn;
        const nextTurn = currentTurn === session.host_id ? session.guest_id : session.host_id;

        // Start a transaction
        await connection.beginTransaction();

        try {
            // Update the battle rounds with selected card and answer result
            const updateField = player_type === 'host' ? 'host_card' : 'guest_card';
            const answerField = player_type === 'host' ? 'host_answer_correct' : 'guest_answer_correct';

            const updateRoundQuery = `
                UPDATE battle_rounds 
                SET ${updateField} = ?,
                    ${answerField} = ?
                WHERE session_uuid = ?
            `;

            await connection.query(updateRoundQuery, [card_id, is_correct, session_uuid]);

            // Update turn in battle_sessions table
            const updateTurnQuery = `
                UPDATE battle_sessions 
                SET current_turn = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE session_uuid = ? AND is_active = 1
            `;

            await connection.query(updateTurnQuery, [nextTurn, session_uuid]);

            // If answer was provided, update battle scores
            if (typeof is_correct !== 'undefined') {
                // Update battle scores based on answer correctness
                const damage_amount = 10; // Default damage amount
                if (!is_correct) {
                    const updateScoreQuery = `
                        UPDATE battle_scores 
                        SET ${player_type}_health = GREATEST(0, ${player_type}_health - ?)
                        WHERE session_uuid = ?
                    `;
                    await connection.query(updateScoreQuery, [damage_amount, session_uuid]);
                }
            }

            // Commit the transaction
            await connection.commit();

            // Get the updated data
            const [updatedRound] = await connection.query(
                `SELECT * FROM battle_rounds WHERE session_uuid = ?`,
                [session_uuid]
            );

            const [updatedSession] = await connection.query(
                `SELECT * FROM battle_sessions WHERE session_uuid = ? AND is_active = 1`,
                [session_uuid]
            );

            const [updatedScores] = await connection.query(
                `SELECT * FROM battle_scores WHERE session_uuid = ?`,
                [session_uuid]
            );

            res.json({
                success: true,
                message: `${player_type} card selection and answer recorded, turn switched to the next player`,
                data: {
                    round: updatedRound[0] || null,
                    session: updatedSession[0] || null,
                    scores: updatedScores[0] || null
                }
            });

        } catch (error) {
            // If anything fails, roll back the transaction
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error updating battle round:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update battle round",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

// Add new function to get the current battle round data
export const getBattleRound = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const { session_uuid } = req.params;

        if (!session_uuid) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: session_uuid"
            });
        }

        // Get battle round data
        const [roundResult] = await connection.query(
            `SELECT * FROM battle_rounds WHERE session_uuid = ?`,
            [session_uuid]
        );

        if (roundResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Battle round not found for this session"
            });
        }

        res.json({
            success: true,
            data: roundResult[0]
        });

    } catch (error) {
        console.error('Error getting battle round data:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get battle round data",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

export const initializeBattleScores = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const { session_uuid, host_health, guest_health } = req.body;

        // Validate required fields
        if (!session_uuid) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: session_uuid"
            });
        }

        // Check if entry already exists for this session
        const [existingScores] = await connection.query(
            `SELECT * FROM battle_scores 
             WHERE session_uuid = ?`,
            [session_uuid]
        );

        if (existingScores.length > 0) {
            return res.json({
                success: true,
                message: "Battle scores already initialized",
                data: existingScores[0]
            });
        }

        // Initialize a new entry in battle_scores
        const query = `
            INSERT INTO battle_scores 
            (session_uuid, host_health, guest_health)
            VALUES (?, ?, ?)
        `;

        const [result] = await connection.query(query, [
            session_uuid,
            host_health || 100,
            guest_health || 100
        ]);

        if (result.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: "Failed to initialize battle scores"
            });
        }

        res.status(201).json({
            success: true,
            message: "Battle scores initialized successfully",
            data: {
                session_uuid,
                host_health: host_health || 100,
                guest_health: guest_health || 100
            }
        });

    } catch (error) {
        console.error('Error initializing battle scores:', error);
        res.status(500).json({
            success: false,
            message: "Failed to initialize battle scores",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

export const getBattleScores = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const { session_uuid } = req.params;

        if (!session_uuid) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: session_uuid"
            });
        }

        // Get battle scores data
        const [scoresResult] = await connection.query(
            `SELECT * FROM battle_scores WHERE session_uuid = ?`,
            [session_uuid]
        );

        if (scoresResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Battle scores not found for this session"
            });
        }

        res.json({
            success: true,
            data: scoresResult[0]
        });

    } catch (error) {
        console.error('Error getting battle scores:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get battle scores",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

// Add new function to update battle scores based on question answers
export const updateBattleScores = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const {
            session_uuid,
            player_type,
            is_correct,
            damage_amount = 10 // Default damage amount when wrong
        } = req.body;

        // Validate required fields
        if (!session_uuid || !player_type) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: session_uuid and player_type are required"
            });
        }

        // Get current battle scores
        const [currentScores] = await connection.query(
            `SELECT * FROM battle_scores WHERE session_uuid = ?`,
            [session_uuid]
        );

        if (currentScores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Battle scores not found for this session"
            });
        }

        // Calculate new health based on answer correctness
        let updateQuery;
        let updateParams;

        if (player_type === 'host') {
            // If host answers incorrectly, reduce host's health
            if (!is_correct) {
                updateQuery = `
                    UPDATE battle_scores 
                    SET host_health = GREATEST(0, host_health - ?)
                    WHERE session_uuid = ?
                `;
                updateParams = [damage_amount, session_uuid];
            }
        } else {
            // If guest answers incorrectly, reduce guest's health
            if (!is_correct) {
                updateQuery = `
                    UPDATE battle_scores 
                    SET guest_health = GREATEST(0, guest_health - ?)
                    WHERE session_uuid = ?
                `;
                updateParams = [damage_amount, session_uuid];
            }
        }

        // Only update if health needs to be reduced
        if (updateQuery && updateParams) {
            await connection.query(updateQuery, updateParams);
        }

        // Get updated scores
        const [updatedScores] = await connection.query(
            `SELECT * FROM battle_scores WHERE session_uuid = ?`,
            [session_uuid]
        );

        res.json({
            success: true,
            message: "Battle scores updated successfully",
            data: updatedScores[0]
        });

    } catch (error) {
        console.error('Error updating battle scores:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update battle scores",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
}; 