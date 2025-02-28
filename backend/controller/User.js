import manilacurrentTimestamp from "../utils/CurrentTimestamp.js";
import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import moment from "moment";

export default {
  signUpUser: async (req, res) => {
    let connection;
    try {
      const { firebase_uid, username, email, password, isSSO, emailVerified } =
        req.body;

      // Hash the password if not SSO
      const hashedPassword = isSSO ? null : await bcrypt.hash(password, 10);

      // Get the current timestamp
      const currentTimestamp = manilacurrentTimestamp;

      // Get a connection from the pool
      connection = await pool.getConnection();

      // Insert the user details into the database
      await connection.execute(
        `INSERT INTO users (firebase_uid, username, email, password_hash, created_at, updated_at, display_picture, full_name, email_verified, isSSO)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          firebase_uid,
          username,
          email,
          hashedPassword,
          currentTimestamp,
          currentTimestamp,
          null,
          null,
          emailVerified,
          isSSO,
        ]
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

  resetPassword: async (req, res) => {
    let connection;
    try {
      const { firebase_uid, password_hash, updated_at } = req.body;

      // Convert the updated_at to the desired format
      const sqlTimestamp = moment(updated_at).format("YYYY-MM-DD HH:mm:ss");

      // Get a connection from the pool
      connection = await pool.getConnection();

      // Update the user's password hash and updated_at in the database
      await connection.execute(
        `UPDATE users SET password_hash = ?, updated_at = ? WHERE firebase_uid = ?;`,
        [password_hash, sqlTimestamp, firebase_uid]
      );

      // Send a success response
      res.status(200).json({
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Internal server error", details: error });
    } finally {
      if (connection) connection.release();
    }
  },


};
