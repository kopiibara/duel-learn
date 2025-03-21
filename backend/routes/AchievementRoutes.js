import express from "express";
import achievementController from "../controller/AchievementController.js";

const router = express.Router();

router.get("/user-study-material-count/:user_uid", achievementController.getUserCreatedStudyMaterial);

export default router;