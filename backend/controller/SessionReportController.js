import { pool } from '../config/db.js';

export const saveSessionReport = async (req, res) => {
  try {
    console.log("=== RECEIVED SESSION REPORT REQUEST ===");
    console.log("Request body:", req.body);

    const {
      session_id,
      study_material_id,
      title,
      summary,
      session_by_user_id,
      session_by_username,
      status,
      ends_at,
      exp_gained,
      coins_gained,
      game_mode,
      correct_count,
      incorrect_count,
      highest_streak,
      time_spent
    } = req.body;

    // Format timestamp for MySQL
    const formattedEndsAt = new Date(ends_at).toISOString().slice(0, 19).replace('T', ' ');

    const query = `
      INSERT INTO session_report (
        session_id,
        study_material_id,
        title,
        summary,
        session_by_user_id,
        session_by_username,
        status,
        ends_at,
        exp_gained,
        coins_gained,
        game_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      session_id,
      study_material_id,
      title || '', // Ensure not null
      summary || '', // Ensure not null
      session_by_user_id,
      session_by_username || '', // Ensure not null
      status || 'completed', // Ensure not null
      formattedEndsAt,
      exp_gained || 0, // Ensure not null
      coins_gained, // Can be null
      game_mode // Can be null
    ];

    console.log("Executing query with values:", values);

    const [result] = await pool.query(query, values);

    console.log("Query result:", result);

    res.json({
      success: true,
      message: 'Session report saved successfully',
      sessionId: session_id,
      result
    });
  } catch (error) {
    console.error("Error saving session report:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Failed to save session report',
      error: error.message,
      details: {
        code: error.code,
        sqlMessage: error.sqlMessage
      }
    });
  }
}; 