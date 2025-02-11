// routes/study-materials/route.ts
import express, { Request, Response } from "express";
import { pool } from "../../config/databaseConnection"; // Import MySQL connection
import { v4 as uuidv4 } from "uuid";
import moment from "moment-timezone";

const router = express.Router();

router.post("/save-study-material", async (req: Request, res: Response) => {
  try {
    const {
      studyMaterialId = uuidv4(),
      title,
      tags,
      totalItems,
      terms,
      images = [], // Default to empty array if not provided
      definitions,
      visibility = 0,
      createdBy,
      totalView = 1,
    } = req.body;

    // Log the incoming request body
    console.log("Received request body:", req.body);

    const currentTimestamp = moment()
      .tz("Asia/Manila")
      .format("YYYY-MM-DD HH:mm:ss"); // Philippines Time (UTC +8)
    // Philippines Time (UTC +8)

    const connection = await pool.getConnection();

    // Insert the data including created_at timestamp
    await connection.execute(
      `INSERT INTO study_material (study_material_id, title, tags, images, total_items, terms, definitions, visibility, created_by, total_views, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studyMaterialId,
        title,
        JSON.stringify(tags),
        JSON.stringify(images),
        totalItems,
        JSON.stringify(terms),
        JSON.stringify(definitions),
        visibility,
        createdBy,
        totalView,
        currentTimestamp, // created_at timestamp
      ]
    );

    connection.release();

    res.status(201).json({ message: "Study material saved successfully" });
  } catch (error) {
    console.error("Error saving study material:", error);
    res.status(500).json({ error: "Internal server error", details: error });
  }
});

router.get(
  "/get-study-material/preview",
  async (req: Request, res: Response) => {
    try {
      // Get the connection from the pool
      const connection = await pool.getConnection();

      // Query to fetch all study materials
      const [rows] = await connection.execute(
        `SELECT study_material_id, title, tags, images, total_items, terms, definitions, visibility, created_by, total_views, created_at
       FROM study_material WHERE  `
      );

      // Release the connection back to the pool
      connection.release();

      // Send the retrieved data as a response
      res.status(200).json({
        message: "Study materials fetched successfully",
        data: rows,
      });
    } catch (error) {
      console.error("Error fetching study materials:", error);
      res.status(500).json({ error: "Internal server error", details: error });
    }
  }
);

export default router;
