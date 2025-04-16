import express from "express";
import achievementController from "../controller/AchievementController.js";

const router = express.Router();

router.get("/get-achievements", achievementController.getAchievement);
router.get("/user-study-material-count/:user_uid", achievementController.getUserCreatedStudyMaterial);
router.get("/check-mystic-elder/:firebase_uid", achievementController.checkMysticElderAchievement);
router.get("/check-wisdom-collector/:firebase_uid", achievementController.checkWisdomCollectorAchievement);
router.get("/check-arcane-scholar/:firebase_uid", achievementController.checkArcaneScholarAchievement);
router.get("/user-longest-streak/:firebase_uid", achievementController.getUserLongestStreak);
router.get("/user-total-pvp-matches/:firebase_uid", achievementController.getUserTotalPvPMatches);
router.get("/user-total-pvp-wins/:firebase_uid", achievementController.getUserTotalPvPWins);

export default router;