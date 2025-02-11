const express = require("express");
const router = express.Router();
const studyMaterialController = require("../controller/StudyMaterial");

// Route to save study material
router.post("/save-study-material", studyMaterialController.saveStudyMaterial);

// Route to get study material
router.get("/get-study-material/:studyMaterialId", studyMaterialController.previewStudyMaterial);
router.get("/view-your-study-material/:created_by", studyMaterialController.viewYourStudyMaterial);

// Export the router
module.exports = router;
