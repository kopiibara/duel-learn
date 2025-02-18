const express = require("express");
const router = express.Router();
const userController = require("../controller/User");

// Route to save user details
router.post("/sign-up", userController.signUpUser);

// Export the router
module.exports = router;