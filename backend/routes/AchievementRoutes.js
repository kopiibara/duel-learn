import express from "express";
import achievementController from "../controller/AchievementController.js";

const router = express.Router();

router.get("/get-achievements", achievementController.getAchievement);
router.get("/user-study-material-count/:user_uid", achievementController.getUserCreatedStudyMaterial);
router.get("/check-mystic-elder/:firebase_uid", achievementController.checkMysticElderAchievement);

export default router;