import express from "express";
import studyMaterialController from "../controller/StudyMaterial.js";

const router = express.Router();

// Use studyMaterialController.saveStudyMaterial instead of saveStudyMaterial directly
router.post("/save", studyMaterialController.saveStudyMaterial);
router.get("/get-by-study-material-id/:studyMaterialId", studyMaterialController.getStudyMaterialById);
router.get("/get-by-user/:created_by", studyMaterialController.getStudyMaterialByUser);

export default router;
