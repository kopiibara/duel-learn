import admin from "../../services/firebaseAdmin.js";
import { pool } from "../../config/db.js";

const AdminController = {
  /**
   * Fetch all users with their existence status in different systems
   */
  fetchUsers: async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      
      // Get users from Firebase Auth
      const authUsers = await admin.auth().listUsers();
      
      // Get users from Firestore
      const firestoreUsersSnapshot = await admin.firestore().collection('users').get();
      const firestoreUsers = firestoreUsersSnapshot.docs.map(doc => doc.data());
      
      // Get users from SQL
      const [sqlUsers] = await connection.execute('SELECT firebase_uid, username, email FROM users');
      
      // Create a map of all unique user IDs
      const userMap = new Map();
      
      // Add Firebase Auth users
      authUsers.users.forEach(user => {
        userMap.set(user.uid, {
          firebase_uid: user.uid,
          username: user.displayName || null,
          email: user.email || null,
          existInSQL: false,
          existInFirebaseAuth: true,
          existInFirestore: false
        });
      });
      
      // Add Firestore users
      firestoreUsers.forEach(user => {
        if (userMap.has(user.firebase_uid)) {
          const existingUser = userMap.get(user.firebase_uid);
          existingUser.existInFirestore = true;
          existingUser.username = existingUser.username || user.username;
          existingUser.email = existingUser.email || user.email;
        } else {
          userMap.set(user.firebase_uid, {
            firebase_uid: user.firebase_uid,
            username: user.username || null,
            email: user.email || null,
            existInSQL: false,
            existInFirebaseAuth: false,
            existInFirestore: true
          });
        }
      });
      
      // Add SQL users
      sqlUsers.forEach(user => {
        if (userMap.has(user.firebase_uid)) {
          const existingUser = userMap.get(user.firebase_uid);
          existingUser.existInSQL = true;
          existingUser.username = existingUser.username || user.username;
          existingUser.email = existingUser.email || user.email;
        } else {
          userMap.set(user.firebase_uid, {
            firebase_uid: user.firebase_uid,
            username: user.username || null,
            email: user.email || null,
            existInSQL: true,
            existInFirebaseAuth: false,
            existInFirestore: false
          });
        }
      });
      
      // Convert map to array
      const users = Array.from(userMap.values());
      
      res.status(200).json({
        success: true,
        users,
        message: `Successfully fetched ${users.length} users`,
        severity: 'info'
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch users. Please try again later.',
        severity: 'error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      if (connection) connection.release();
    }
  },

  /**
   * Delete a user by admin
   */
  deleteUserByAdmin: async (req, res) => {
    const { id } = req.params;
    let connection;
    
    try {
      connection = await pool.getConnection();
      
      // Start a transaction
      await connection.beginTransaction();
      
      // Delete from SQL database
      const [result] = await connection.execute(
        'DELETE FROM users WHERE firebase_uid = ?',
        [id]
      );
      
      // Delete from Firebase Auth
      try {
        await admin.auth().deleteUser(id);
      } catch (firebaseError) {
        console.warn(`User not found in Firebase Auth: ${id}`, firebaseError);
        // We continue since the user might only exist in SQL
      }
      
      // Delete from Firestore
      try {
        await admin.firestore().collection('users').doc(id).delete();
      } catch (firestoreError) {
        console.warn(`User not found in Firestore: ${id}`, firestoreError);
        // We continue since the user might only exist in SQL/Firebase Auth
      }
      
      // Commit the transaction
      await connection.commit();
      
      res.status(200).json({
        success: true,
        message: `User ${id} has been successfully deleted`,
        severity: 'success'
      });
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      
      // Rollback the transaction if there was an error
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error('Error during rollback:', rollbackError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: `Failed to delete user ${id}. Please try again.`,
        severity: 'error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      if (connection) connection.release();
    }
  },

  /**
   * Delete all users (dangerous operation)
   */
  deleteAllUsers: async (req, res) => {
    let connection;
    
    try {
      connection = await pool.getConnection();
      
      // Confirm this is what the admin wants to do
      const { confirm } = req.body;
      if (confirm !== 'DELETE_ALL_USERS') {
        return res.status(400).json({
          success: false,
          message: 'This operation requires confirmation. Please provide the confirm field with value "DELETE_ALL_USERS"',
          severity: 'warning'
        });
      }
      
      // Start a transaction
      await connection.beginTransaction();
      
      // Delete all from SQL database
      await connection.execute('DELETE FROM users');
      
      // For Firebase, we'd need to iteratively delete users
      // This is a simplified example - in production you'd use a batch approach
      const listUsersResult = await admin.auth().listUsers();
      const deletePromises = listUsersResult.users.map(userRecord => 
        admin.auth().deleteUser(userRecord.uid)
      );
      await Promise.all(deletePromises);
      
      // Delete all users from Firestore
      const batch = admin.firestore().batch();
      const snapshot = await admin.firestore().collection('users').get();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      // Commit the transaction
      await connection.commit();
      
      res.status(200).json({
        success: true,
        message: 'All users have been deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting all users:', error);
      
      // Rollback the transaction if there was an error
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error('Error during rollback:', rollbackError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete all users. Operation has been rolled back.',
        severity: 'error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      if (connection) connection.release();
    }
  }
};

export default AdminController; 