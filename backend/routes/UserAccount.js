import express from "express";
import userController from "../controller/User.js"; // Add .js extension

const router = express.Router();

// Route to save user details
router.post("/sign-up", userController.signUpUser);

// Route to reset password
router.post("/reset-password", userController.resetPassword);

// Route to update email verified status
router.post("/update-email-verified", userController.updateEmailVerified);

// Route to get all users
router.get("/", userController.getAllUsers);

// Route to add a new user
router.post("/", userController.addUser);

// Route to update a user
router.put("/:id", userController.updateUser);

// Route to delete a user
router.delete("/:id", userController.deleteUser);

// Route to delete all users
router.delete("/", userController.deleteAllUsers);

// Route to fetch users
router.get("/admin/admin-dashboard/fetch-users", userController.fetchUsers);

// Route to update user details
router.post("/update-user-details", userController.updateUserDetails);

// Export the router as default
export default router;
