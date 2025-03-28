import express from "express";
import userInfo from "../controller/UserInfo.js";

const router = express.Router();

router.get("/details/:firebase_uid", userInfo.getUserInfo);


router.post("/update-level", userInfo.updateLevel);

// Add a new endpoint for fetching user profile data
router.get("/profile/:userId", userInfo.getUserProfileById);

export default router;