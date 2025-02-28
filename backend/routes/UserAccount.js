import express from "express";
import userController from "../controller/User.js"; // Add .js extension

const router = express.Router();

// Route to save user details
router.post("/sign-up", userController.signUpUser);

// Route to reset password
router.post("/reset-password", userController.resetPassword);

// Route to update email verified status
router.post("/update-email-verified", userController.updateEmailVerified);

// Export the router as default
export default router;
