import { ImageAnnotatorClient } from "@google-cloud/vision";
import fs from "fs";
import path from "path";
import os from "os";
import multer from "multer";
import { promisify } from "util";
import { exec } from "child_process";

// Promisify exec for async/await
const execAsync = promisify(exec);

// Add these constants at the top of your file
const CONFIG = {
  textDetectionTimeout: 30000, // Timeout for each API call in milliseconds
  retryAttempts: 3, // Number of times to retry failed API calls
};

// Create a Vision client using environment variables
let visionClient;
try {
  // Check if credentials are provided as a JSON string in env var
  if (process.env.GOOGLE_VISION_CREDENTIALS) {
    // Parse credentials from env variable
    const credentials = JSON.parse(process.env.GOOGLE_VISION_CREDENTIALS);
    console.log(
      "Initializing Vision API client with credentials from environment variable"
    );
    visionClient = new ImageAnnotatorClient({ credentials });
  } else {
    // Fall back to default authentication mechanism
    console.log("Initializing Vision API client with default authentication");
    visionClient = new ImageAnnotatorClient();
  }
  console.log("Vision API client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Vision API client:", error);
  throw new Error(
    `Google Vision API client initialization failed: ${error.message}`
  );
}

// Configure temporary storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter to ensure only supported files are accepted
const fileFilter = (req, file, cb) => {
  // Accept images only - no PDFs for now
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Unsupported file type. Only JPEG and PNG files are allowed."),
      false
    );
  }
};

// Use the enhanced multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Helper function to process an image with OCR
async function processImageWithOCR(imagePath) {
  try {
    console.log(`Processing image: ${imagePath}`);

    // Verify file exists and check file size
    if (!fs.existsSync(imagePath)) {
      console.error(`Image file not found: ${imagePath}`);
      throw new Error(`Image file not found: ${imagePath}`);
    }

    const stats = fs.statSync(imagePath);
    console.log(`Image file size: ${stats.size} bytes`);

    if (stats.size === 0) {
      console.error(`Image file is empty: ${imagePath}`);
      throw new Error(`Image file is empty: ${imagePath}`);
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    console.log(
      `Successfully read image file, buffer length: ${imageBuffer.length} bytes`
    );

    // Convert to base64
    const encodedImage = imageBuffer.toString("base64");
    console.log(
      `Converted image to base64, length: ${encodedImage.length} chars`
    );

    // Process with Vision API
    console.log(`Sending image to Vision API for text detection...`);
    const [result] = await visionClient.textDetection({
      image: { content: encodedImage },
      imageContext: {
        languageHints: ["en-t-i0-handwrit"], // Include handwriting recognition
      },
    });

    // Check if textAnnotations exists and has content
    if (!result.textAnnotations || result.textAnnotations.length === 0) {
      console.log(
        `No text annotations found in API response for ${path.basename(
          imagePath
        )}`
      );
      return "";
    }

    // Extract text
    let extractedText = result.textAnnotations[0].description;
    console.log(`Extracted ${extractedText.length} characters from image`);
    console.log(`Text preview: "${extractedText.substring(0, 100)}..."`);

    return extractedText;
  } catch (error) {
    console.error(`Error processing image:`, error);
    throw error;
  }
}

// Main controller with improved logging
const ocrController = {
  extractTextFromImage: async (req, res) => {
    try {
      console.log("=== OCR PROCESS START ===");
      console.log(
        `Request received, files:`,
        req.file ? `${req.file.originalname} (${req.file.mimetype})` : "None"
      );

      if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;
      const fileType = req.file.mimetype;
      const fileName = req.file.originalname;

      console.log(`Processing file: ${fileName}`);
      console.log(`File type: ${fileType}`);
      console.log(`File path: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        console.error(`File not found at path: ${filePath}`);
        return res.status(400).json({
          error: "File not found",
          details: "The uploaded file could not be located",
          path: filePath,
        });
      }

      let extractedText = "";

      try {
        // Check if it's a PDF - for now, return a friendly error
        if (fileType === "application/pdf") {
          console.log("Detected PDF file - PDF processing not supported yet");
          return res.status(422).json({
            error: "PDF Processing Not Available",
            details:
              "PDF processing is currently under development. Please convert your PDF to JPG or PNG and try again.",
          });
        } else {
          console.log(`Processing image file (${fileType})...`);
          extractedText = await processImageWithOCR(filePath);
        }

        // Check if any text was extracted
        if (!extractedText) {
          console.log("No text could be extracted from the document");
          return res.status(422).json({
            error: "No text found",
            details:
              "No recognizable text could be extracted from the document",
            fileType: fileType,
          });
        }

        console.log(`Extracted text length: ${extractedText.length}`);
        console.log(`First 100 chars: "${extractedText.substring(0, 100)}..."`);

        // Clean up the original uploaded file
        try {
          fs.unlinkSync(filePath);
          console.log("Original file deleted successfully");
        } catch (cleanupError) {
          console.error("Error deleting original file:", cleanupError);
        }

        console.log("=== OCR PROCESS COMPLETE ===");

        // Return the extracted text
        return res.json({
          text: extractedText,
          filename: fileName,
          fileType: fileType,
        });
      } catch (processingError) {
        console.error("Processing error:", processingError);

        // Try to clean up the file even if processing failed
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupError) {
          console.error(
            "Error cleaning up after processing failure:",
            cleanupError
          );
        }

        return res.status(422).json({
          error: `Image Processing Failed`,
          details: processingError.message,
        });
      }
    } catch (error) {
      console.error("=== OCR PROCESS FAILED ===");
      console.error("Unhandled error in OCR process:", error);
      return res.status(500).json({
        error: "Text Extraction Failed",
        details: error.message,
        fileType: req.file ? req.file.mimetype : "unknown",
      });
    }
  },

  // Extract term-definition pairs from OCR text
  extractTermDefinitionPairs: async (req, res) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      // Preprocess the text to improve structure
      const preprocessedText = preprocessExtractedText(text);
      console.log(
        "Preprocessed text:",
        preprocessedText.substring(0, 200) + "..."
      );

      // Import OpenAI with proper error handling
      console.log("Importing OpenAI...");
      let openaiModule;
      try {
        openaiModule = await import("../config/openai.js");
        if (!openaiModule.openai) {
          throw new Error("OpenAI client not initialized");
        }
      } catch (importError) {
        console.error("OpenAI import error:", importError);
        return res.status(500).json({
          error: "Failed to initialize AI services",
          details: importError.message,
        });
      }

      const { openai } = openaiModule;

      // Updated prompt as suggested
      const prompt = `
Analyze this educational text and create flashcard-style term-definition pairs:

TEXT:
${preprocessedText}

INSTRUCTIONS:
1. ONLY extract terms that have clearly designated definitions in the text. Do not create or infer definitions for terms that don't have them explicitly stated.
2. A term must have an EXPLICIT definition directly following it - usually after a colon, dash, or on the next line with clear indentation.
3. Headers, titles, section names, or category labels are NOT terms with definitions - ignore these completely.
4. If a term appears as a list item without a definition, DO NOT include it.
5. Extract one term with its complete corresponding definition. If a term appears with different contexts/definitions, create separate entries for each definition.
6. Ignore section headers, titles, or topic markers that aren't actual defined terms with associated definitions.
7. Use the EXACT definition as provided in the text - do not paraphrase, summarize, or modify the extracted definitions.
8. Only include terms that have substantive definitions. Skip terms with vague or incomplete explanations.
9. Format your response as a JSON array of term-definition pairs.

FORMAT:
[
  {"term": "Term1", "definition": "The exact and complete definition as found in the text..."},
  {"term": "Term2", "definition": "The exact and complete definition as found in the text..."}
]

EXAMPLE INPUT:
"4 Number Systems
Binary - (NO DEFINITION)
Decimal - (NO DEFINITION)
Octal - (NO DEFINITION)"

EXAMPLE OUTPUT:
{No need to return anything}.

RESPONSE FORMAT: Return ONLY the JSON array with no additional text.
`;

      console.log("Sending request to OpenAI...");

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
      });

      // Parse the AI response
      const content = response.choices[0].message.content.trim();
      console.log("AI response received:", content.substring(0, 100) + "...");

      // After receiving the response, add this debug log
      console.log("FULL RAW RESPONSE:", content);

      try {
        // Parse the response as JSON
        const jsonResponse = JSON.parse(content);
        console.log(
          "Parsed JSON response type:",
          typeof jsonResponse,
          Array.isArray(jsonResponse)
        );

        // Check if we have the expected array structure
        if (Array.isArray(jsonResponse)) {
          // Direct array format - most likely case
          return res.json({ pairs: jsonResponse });
        } else if (Array.isArray(jsonResponse.pairs)) {
          // Object with pairs property
          return res.json({ pairs: jsonResponse.pairs });
        } else {
          // Log the full response structure for debugging
          console.log(
            "Unexpected response structure:",
            JSON.stringify(jsonResponse)
          );

          // Check if there's any array property we can use
          for (const key in jsonResponse) {
            if (Array.isArray(jsonResponse[key])) {
              return res.json({ pairs: jsonResponse[key] });
            }
          }

          throw new Error(
            "Unexpected response structure: " + JSON.stringify(jsonResponse)
          );
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        console.log("Raw content:", content);

        // NEW FALLBACK PARSING - more aggressive approach
        try {
          // Look for anything that resembles a JSON array with term and definition
          const simplifiedContent = content.replace(/\s+/g, " ").trim();

          // Match just the array part using regex
          const arrayMatch = simplifiedContent.match(/\[\s*\{.*?\}\s*\]/s);
          if (arrayMatch) {
            const extractedArray = arrayMatch[0];
            console.log("Extracted array part:", extractedArray);

            // Try to parse just that part
            const parsed = JSON.parse(extractedArray);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return res.json({ pairs: parsed });
            }
          }

          // If the text has term/definition pattern, manually construct JSON
          if (
            simplifiedContent.includes('"term"') &&
            simplifiedContent.includes('"definition"')
          ) {
            const pairsRegex =
              /"term"\s*:\s*"([^"]*)"\s*,\s*"definition"\s*:\s*"([^"]*)"/g;
            const pairs = [];
            let match;

            while ((match = pairsRegex.exec(simplifiedContent)) !== null) {
              pairs.push({
                term: match[1],
                definition: match[2],
              });
            }

            if (pairs.length > 0) {
              return res.json({ pairs });
            }
          }
        } catch (fallbackError) {
          console.error("Fallback parsing also failed:", fallbackError);
        }

        // Existing fallback logic...
        return res.json({
          pairs: [{ term: "Sample Term", definition: "Sample Definition" }],
          notice: "AI response could not be parsed, showing sample data",
        });
      }
    } catch (error) {
      console.error("Error in term extraction:", error);
      return res.status(500).json({
        error: "Failed to extract term-definition pairs",
        details: error.message,
      });
    }
  },
};

// Preprocessing function
function preprocessExtractedText(text) {
  // Remove excessive whitespace
  let processed = text.replace(/\s+/g, " ").trim();

  // Fix bullet point formatting
  processed = processed.replace(/•\s*/g, "\n• ");

  // Fix dash formatting (often used in definitions)
  processed = processed.replace(/\s-\s/g, " - ");

  // Fix arrow formatting (often used in handwritten notes)
  processed = processed.replace(/\s?→\s?/g, " - ");
  processed = processed.replace(/\s?->\s?/g, " - ");

  // Try to identify potential terms (capitalized phrases at beginning of lines)
  const lines = processed.split("\n");
  const structuredLines = lines.map((line) => {
    // If line starts with a capitalized word(s) followed by lowercase, add a line break after
    if (/^[A-Z][A-Za-z\s]+[a-z]\s+[a-z]/.test(line)) {
      const match = line.match(/^([A-Z][A-Za-z\s]+?[a-z])\s+([a-z].*)/);
      if (match) {
        return `${match[1]}\n${match[2]}`;
      }
    }
    return line;
  });

  // Rejoin and ensure proper spacing around bullet points
  processed = structuredLines.join("\n");

  // Handle terms with colons
  processed = processed.replace(/([^:]+):\s*/g, "$1\n");

  // Better handle numbered or bulleted lists which are common in notes
  processed = processed.replace(/(\d+[\.\)]) /g, "\n$1 ");

  // Better detect section headers (often all caps or numbered)
  processed = processed.replace(/^([0-9]+\.\s+[A-Z\s]+)$/gm, "\n$1\n");

  return processed;
}

// Helper function to clean up files
function cleanupFiles(files) {
  files.forEach((file) => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (error) {
      console.error(`Failed to clean up file ${file}:`, error);
    }
  });
}

export default ocrController;
