import express from "express";
import friendController from "../controller/FriendController.js";

const router = express.Router();

router.get("/list/:user", friendController.getUserFriend);

export default router;