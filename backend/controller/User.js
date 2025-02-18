const { pool } = require("../config/db.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

module.exports = {
  signUpUser: async (req, res) => {
    let connection;
    try {
      const { firebase_uid, username, email, password, isSSO, emailVerified } = req.body;

      // Hash the password if not SSO
      const hashedPassword = isSSO ? null : await bcrypt.hash(password, 10);

      // Get the current timestamp
      const currentTimestamp = new Date();

      // Get a connection from the pool
      connection = await pool.getConnection();

      // Insert the user details into the database
      await connection.execute(
        `INSERT INTO users (firebase_uid, username, email, password_hash, created_at, display_picture, full_name, email_verified, isSSO)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [firebase_uid, username, email, hashedPassword, currentTimestamp, null, null, emailVerified, isSSO]
      );

      // Send a success response
      res.status(201).json({
        message: "User signed up successfully",
        firebase_uid,
      });
    } catch (error) {
      console.error("Error signing up user:", error);
      res.status(500).json({ error: "Internal server error", details: error });
    } finally {
      if (connection) connection.release();
    }
  },
};