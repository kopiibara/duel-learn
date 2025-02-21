const express = require("express");
const router = express.Router();
const userController = require("../controller/User");

// Route to save user details
router.post("/sign-up", userController.signUpUser);

// Route to reset password
router.post("/reset-password", userController.resetPassword);

// Export the router
module.exports = router;