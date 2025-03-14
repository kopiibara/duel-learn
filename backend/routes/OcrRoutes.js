import express from "express";
import multer from "multer";
import ocrController from "../controller/OcrController.js";
import os from "os";

const router = express.Router();
const upload = multer({ dest: os.tmpdir() });

// Route for extracting text from images
router.post(
  "/extract-text",
  upload.single("file"),
  ocrController.extractTextFromImage
);

// Add this new route to your existing routes
router.post("/extract-pairs", ocrController.extractTermDefinitionPairs);

export default router;
