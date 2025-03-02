import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import moment from "moment";
import admin from "../services/firebaseAdmin.js";

export default {
  signUpUser: async (req, res) => {
    let connection;
    try {
      const { firebase_uid, username, email, password, isSSO, emailVerified } =
        req.body;

      // Hash the password if not SSO
      const hashedPassword = isSSO ? null : await bcrypt.hash(password, 10);

      // Get the current timestamp
      const currentTimestamp = moment().format("YYYY-MM-DD HH:mm:ss");
      // Get a connection from the pool
      connection = await pool.getConnection();

      // Insert the user details into the users table
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

      // Insert the user details into the user_info table
      await connection.execute(
        `INSERT INTO user_info (firebase_uid, username, display_picture, level, exp, coins)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          firebase_uid,
          username,
          null,
          1, // Default level
          0, // Default experience points
          0, // Default coins
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

  updateEmailVerified: async (req, res) => {
    let connection;
    try {
      const { firebase_uid, email_verified, updated_at } = req.body;

      // Convert the updated_at to the desired format
      const sqlTimestamp = moment(updated_at).format("YYYY-MM-DD HH:mm:ss");

      // Get a connection from the pool
      connection = await pool.getConnection();

      // Update the user's email_verified and updated_at in the database
      await connection.execute(
        `UPDATE users SET email_verified = ?, updated_at = ? WHERE firebase_uid = ?;`,
        [email_verified, sqlTimestamp, firebase_uid]
      );

      // Send a success response
      res.status(200).json({
        message: "Email verified status updated successfully",
      });
    } catch (error) {
      console.error("Error updating email verified status:", error);
      res.status(500).json({ error: "Internal server error", details: error });
    } finally {
      if (connection) connection.release();
    }
  },

  fetchUsers: async (req, res) => {
    let connection;
    try {
      // Get a connection from the pool
      connection = await pool.getConnection();

      // Fetch users from SQL
      const [sqlUsers] = await connection.execute('SELECT firebase_uid, username FROM users');

      // Fetch users from Firestore
      const firestoreUsersSnapshot = await admin.firestore().collection('users').get();
      const firestoreUsers = firestoreUsersSnapshot.docs.map(doc => doc.data());

      // Fetch users from Firebase Auth
      const authUsers = await admin.auth().listUsers();
      const firebaseAuthUsers = Array.isArray(authUsers.users) ? authUsers.users.map(user => ({
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
      })) : [];

      // Match users
      const matchedUsers = sqlUsers.map(sqlUser => {
        const firestoreUser = firestoreUsers.find(user => user.firebase_uid === sqlUser.firebase_uid);
        const authUser = firebaseAuthUsers.find(user => user.uid === sqlUser.firebase_uid);
        return {
          firebase_uid: sqlUser.firebase_uid,
          username: sqlUser.username,
          existInSQL: true,
          existInFirestore: !!firestoreUser,
          existInFirebaseAuth: !!authUser,
        };
      });

      // Send the matched users as response
      res.status(200).json({
        message: "Users fetched successfully",
        users: matchedUsers,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    } finally {
      if (connection) connection.release();
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM users');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addUser: async (req, res) => {
    const { email, username } = req.body;
    try {
      const userRecord = await admin.auth().createUser({ email });
      await admin.firestore().collection('users').doc(userRecord.uid).set({ email, username });
      await pool.query('INSERT INTO users (id, email, username) VALUES (?, ?, ?)', [userRecord.uid, email, username]);
      res.status(201).json({ id: userRecord.uid, email, username });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const { email, username } = req.body;
    try {
      await admin.auth().updateUser(id, { email });
      await admin.firestore().collection('users').doc(id).update({ email, username });
      await pool.query('UPDATE users SET email = ?, username = ? WHERE id = ?', [email, username, id]);
      res.json({ id, email, username });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
      // Get a connection from the pool
      connection = await pool.getConnection();

      // Check if the user exists in SQL
      const [sqlUsers] = await connection.execute('SELECT firebase_uid FROM users WHERE firebase_uid = ?', [id]);
      if (sqlUsers.length === 0) {
        return res.status(404).json({ error: "User not found in SQL database" });
      }

      // Check if the user exists in Firestore
      const firestoreUserDoc = await admin.firestore().collection('users').doc(id).get();
      if (!firestoreUserDoc.exists) {
        return res.status(404).json({ error: "User not found in Firestore" });
      }

      // Check if the user exists in Firebase Auth
      try {
        await admin.auth().getUser(id);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          return res.status(404).json({ error: "User not found in Firebase Auth" });
        }
        throw error;
      }

      // Delete user from Firebase Auth
      await admin.auth().deleteUser(id);

      // Delete user from Firestore
      await admin.firestore().collection('users').doc(id).delete();

      // Delete user from SQL
      await connection.execute('DELETE FROM users WHERE firebase_uid = ?', [id]);

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    } finally {
      if (connection) connection.release();
    }
  },

  deleteAllUsers: async (req, res) => {
    try {
      const users = await admin.auth().listUsers();
      const deletePromises = Array.isArray(users.users) ? users.users.map(user => admin.auth().deleteUser(user.uid)) : [];
      await Promise.all(deletePromises);
      await admin.firestore().collection('users').get().then(querySnapshot => {
        querySnapshot.forEach(doc => doc.ref.delete());
      });
      await pool.query('DELETE FROM users');
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};