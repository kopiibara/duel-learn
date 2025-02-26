import express from "express";
import friendController from "../controller/FriendController.js";

const router = express.Router();

router.get("/info/:firebase_uid", friendController.getUserInfo);
router.post("/request", friendController.sendFriendRequest);


export default router;