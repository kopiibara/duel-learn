import express from "express";
import studyMaterialController from "../controller/StudyMaterialController.js";

const router = express.Router();

// Use studyMaterialController.saveStudyMaterial instead of saveStudyMaterial directly
router.post("/save", studyMaterialController.saveStudyMaterial);
router.post("/update", studyMaterialController.editStudyMaterial);
router.post("/archive/:studyMaterialId", studyMaterialController.archiveStudyMaterial);
router.post("/delete/:studyMaterialId", studyMaterialController.deleteStudyMaterial);
router.post("/restore/:studyMaterialId", studyMaterialController.restoreStudyMaterial);
router.post('/increment-views/:studyMaterialId', studyMaterialController.incrementViews);
router.post("/bookmark", studyMaterialController.bookmarkStudyMaterial);
router.post("/update-creator", studyMaterialController.updateCreatedByUser);
router.post("/update-visibility/:studyMaterialId", studyMaterialController.updateVisibility);

router.get("/get-by-study-material-id/:studyMaterialId", studyMaterialController.getStudyMaterialById);
router.get("/get-by-user/:created_by", studyMaterialController.getStudyMaterialByUser);
router.get("/get-recommended-for-you/:username", studyMaterialController.getRecommendedForYouCards);
router.get('/get-top-picks', studyMaterialController.getTopPicks);
router.get("/get-made-by-friends/:userId", studyMaterialController.getMadeByFriends);
router.get("/discover/:username", studyMaterialController.getNonMatchingTags);
router.get('/check-bookmark-status', studyMaterialController.checkBookmarkStatus);
router.get('/get-bookmarks-by-user/:bookmarked_by_id', studyMaterialController.getBookmarksByUser);


export default router;
