const { pool, connectDB } = require("../config/db.js");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");

module.exports = {

    //to save study material
    saveStudyMaterial: async (req, res) => {
        try {
            let studyMaterialId = req.body.studyMaterialId || uuidv4();

            const {
                title,
                tags,
                totalItems,
                terms,
                images = [],
                definitions,
                visibility = 0,
                createdBy,
                totalView = 1,
            } = req.body;

            console.log("Generated Study Material ID:", studyMaterialId);

            const currentTimestamp = moment()
                .tz("Asia/Manila")
                .format("YYYY-MM-DD HH:mm:ss");

            const connection = await pool.getConnection();

            await connection.execute(
                `INSERT INTO study_material (study_material_id, title, tags, images, total_items, terms, definitions, visibility, created_by, total_views, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
                    currentTimestamp,
                ]
            );

            connection.release();

            res.status(201).json({
                message: "Study material saved successfully",
                studyMaterialId,
            });
        } catch (error) {
            console.error("Error saving study material:", error);
            res.status(500).json({ error: "Internal server error", details: error });
        }
    },

    //to preview the saved material
    previewStudyMaterial: async (req, res) => {
        try {
            const { studyMaterialId } = req.params;

            if (!studyMaterialId) {  // Change from `id` to `studyMaterialId`
                return res.status(400).json({ error: "Missing studyMaterialId" });
            }

            const connection = await pool.getConnection();

            const [rows] = await connection.execute(
                `SELECT study_material_id, title, tags, images, total_items, terms, definitions, visibility, created_by, total_views, created_at
             FROM study_material WHERE study_material_id = ?;`,
                [studyMaterialId]
            );

            connection.release();

            if (rows.length === 0) {
                return res.status(404).json({ message: "Study material not found" });
            }

            return res.status(200).json({
                message: "Study material fetched successfully",
                data: rows[0],
            });
        } catch (error) {
            console.error("Error fetching study material:", error);
            return res
                .status(500)
                .json({ error: "Internal server error", details: error });
        }
    },


    //to view the saved material by user
    viewYourStudyMaterial: async (req, res) => {
        try {
            const { created_by } = req.params;

            if (!created_by) {
                return res.status(400).json({ error: "Missing created_by" });
            }

            const connection = await pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT study_material_id, title, tags, total_items, visibility, total_views, created_by, created_at
                     FROM study_material WHERE created_by = ?;`,
                [created_by]
            );
            connection.release();

            if (rows.length === 0) {
                return res.status(404).json({ message: "No study materials found" });
            }

            const parsedRows = rows.map((item) => ({
                ...item,
                tags: JSON.parse(item.tags || "[]"),
                images: Buffer.isBuffer(item.images) ? [] : JSON.parse(item.images || "[]"),
            }));

            return res.status(200).json({
                message: "Study materials fetched successfully",
                data: parsedRows,
            });
        } catch (error) {
            console.error("Error fetching study material:", error);
            return res.status(500).json({ error: "Internal server error", details: error });
        }
    },


};
