import { ImageAnnotatorClient } from "@google-cloud/vision";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import multer from "multer";
import { promisify } from "util";
import { exec } from "child_process";
import pdfParse from "pdf-parse";
import sharp from "sharp";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
// Promisify exec for async/await
const execAsync = promisify(exec);

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add these constants at the top of your file
const CONFIG = {
  textDetectionTimeout: 30000, // Timeout for each API call in milliseconds
  retryAttempts: 3, // Number of times to retry failed API calls
};

// Create a Vision client using environment variables
let visionClient;
try {
  // Check if base64 credentials are provided
  if (process.env.GOOGLE_VISION_CREDENTIALS_BASE64) {
    try {
      console.log("Using base64 encoded credentials for Google Vision API");
      const credentials = JSON.parse(
        Buffer.from(process.env.GOOGLE_VISION_CREDENTIALS_BASE64, 'base64').toString('utf8')
      );
      visionClient = new ImageAnnotatorClient({ credentials });
      console.log("Successfully initialized Vision API client with base64 credentials");
    } catch (parseError) {
      console.error("Failed to parse base64 credentials:", parseError);
      throw new Error(`Failed to parse base64 credentials: ${parseError.message}`);
    }
  }
  // Check if credentials are provided as a JSON string in env var
  else if (process.env.GOOGLE_VISION_CREDENTIALS) {
    try {
      // Only try to parse if it starts with '{' (looks like JSON)
      if (process.env.GOOGLE_VISION_CREDENTIALS.trim().startsWith("{")) {
        const credentials = JSON.parse(process.env.GOOGLE_VISION_CREDENTIALS);
        console.log(
          "Initializing Vision API client with credentials from environment variable"
        );
        visionClient = new ImageAnnotatorClient({ credentials });
      } else {
        // Treat as a file path
        console.log("Using credentials file path from environment variable");
        visionClient = new ImageAnnotatorClient({
          keyFilename: process.env.GOOGLE_VISION_CREDENTIALS,
        });
      }
    } catch (parseError) {
      console.error(
        "Failed to parse credentials from environment variable:",
        parseError
      );
      throw new Error(`Failed to use credentials from environment variable: ${parseError.message}`);
    }
  } else {
    // No credentials available
    throw new Error(
      "No Google Vision credentials found. Please set GOOGLE_VISION_CREDENTIALS_BASE64 environment variable."
    );
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
  // Accept images and PDFs now
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Only JPEG, PNG, and PDF files are allowed."
      ),
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

// Fix the initPdfJs function to properly handle worker
async function initPdfJs() {
  try {
    // Properly disable worker - don't try to import it
    pdfjs.GlobalWorkerOptions.workerSrc = null;
    console.log("PDF.js initialized with worker disabled");
  } catch (error) {
    console.error("Failed to initialize PDF.js:", error);
  }
}

async function convertPdfToImageWithJs(pdfPath, outputDir, pageNumber) {
  try {
    await initPdfJs();

    console.log(`Converting PDF page ${pageNumber} to image using PDF.js`);

    // Read PDF file
    const data = new Uint8Array(fs.readFileSync(pdfPath));

    // Load the PDF document
    console.log(`Loading PDF document...`);
    const pdfDoc = await pdfjs.getDocument({
      data,
      disableFontFace: true,
      nativeImageDecoderSupport: "none",
    }).promise;

    console.log(`PDF loaded successfully. Getting page ${pageNumber}...`);

    // Get the page
    const page = await pdfDoc.getPage(pageNumber);

    // Calculate dimensions with high resolution for better OCR
    const scale = 2.0; // Higher scale = better quality but larger file
    const viewport = page.getViewport({ scale });
    const dimensions = {
      width: Math.floor(viewport.width),
      height: Math.floor(viewport.height),
    };

    console.log(
      `Creating canvas with dimensions ${dimensions.width}x${dimensions.height}`
    );

    // Create canvas with the right dimensions
    const canvas = createCanvas(dimensions.width, dimensions.height);
    const context = canvas.getContext("2d");

    // Set white background (improves OCR quality)
    context.fillStyle = "white";
    context.fillRect(0, 0, dimensions.width, dimensions.height);

    // Render PDF page to canvas
    console.log("Rendering PDF page to canvas...");
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      background: "white",
    };

    await page.render(renderContext).promise;
    console.log("PDF page rendered successfully");

    // Output path for the image
    const outputPath = path.join(outputDir, `page_${pageNumber}.png`);

    // Write canvas to file with high quality
    const buffer = canvas.toBuffer("image/png", {
      compressionLevel: 0, // 0 = no compression (best quality)
      filters: canvas.PNG_FILTER_NONE,
    });

    fs.writeFileSync(outputPath, buffer);
    console.log(`Image saved successfully at ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error(`Error in convertPdfToImageWithJs:`, error);
    throw error;
  }
}

// Add a fallback PDF to image converter that works differently
async function convertPdfToImageAlternative(pdfPath, outputDir, pageNumber) {
  try {
    console.log(
      `Using alternative PDF to image conversion for page ${pageNumber}`
    );

    // Save with unique name to avoid conflicts
    const outputPath = path.join(outputDir, `alt_page_${pageNumber}.png`);

    // Use pdf2pic directly without GM dependency
    const convert = pdf2pic.fromPath(pdfPath, {
      density: 300, // Higher DPI for better quality
      savePath: outputDir, // Save location
      saveFilename: `alt_page_${pageNumber}`,
      format: "png", // Output format
      width: 2000, // Width constraint
      height: 2000, // Height constraint
    });

    // Convert the specific page
    const result = await convert(pageNumber);
    console.log(
      `Alternative conversion result:`,
      result.size ? "Success" : "Failed"
    );

    return result.path || outputPath;
  } catch (error) {
    console.error(`Error in alternative PDF conversion:`, error);
    throw error;
  }
}

// PDF processing without external dependencies
async function processPdfDirectlyWithVision(pdfPath) {
  console.log(`Processing PDF directly with Vision API: ${pdfPath}`);

  try {
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64Pdf = pdfBuffer.toString("base64");

    // Send to Vision API directly - it can handle PDFs
    const [result] = await visionClient.documentTextDetection({
      image: { content: base64Pdf },
      imageContext: {
        languageHints: ["en", "en-t-i0-handwrit"],
      },
    });

    if (result && result.fullTextAnnotation && result.fullTextAnnotation.text) {
      const extractedText = result.fullTextAnnotation.text;
      console.log(
        `Successfully extracted ${extractedText.length} characters from PDF`
      );
      return extractedText;
    } else {
      console.log("No text found in PDF using direct method");
      return "";
    }
  } catch (error) {
    console.error(`Error processing PDF:`, error);
    return ""; // Return empty string instead of throwing
  }
}

// Main controller with improved logging
const ocrController = {
  // New method to handle multiple images and PDFs
  extractTextFromMultipleImages: async (req, res) => {
    try {
      console.log("=== MULTIPLE FILES OCR PROCESS START ===");
      console.log(
        `Request received, files:`,
        req.files ? `${req.files.length} files` : "None"
      );

      if (!req.files || req.files.length === 0) {
        console.log("No files uploaded");
        return res.status(400).json({ error: "No files uploaded" });
      }

      if (req.files.length > CONFIG.maxImages) {
        console.log(`Too many files: ${req.files.length}`);
        return res.status(400).json({
          error: `Maximum ${CONFIG.maxImages} files allowed`,
        });
      }

      // Process each file sequentially and collect all text
      const tempFiles = [];
      let allExtractedText = "";
      let processedCount = 0;
      let errorCount = 0;

      // Process each file one by one
      for (let i = 0; i < req.files.length; i++) {
        try {
          const file = req.files[i];
          const filePath = file.path;
          const fileName = file.originalname;
          const fileType = file.mimetype;

          console.log(
            `Processing file ${i + 1} of ${req.files.length
            }: ${fileName} (${fileType})`
          );

          if (!fs.existsSync(filePath)) {
            console.error(`File not found at path: ${filePath}`);
            errorCount++;
            continue; // Skip this file and continue with others
          }

          let extractedText = "";

          // Handle PDF files differently than images
          if (fileType === "application/pdf") {
            console.log(`Detected PDF file: ${fileName}`);
            extractedText = await processPdfWithOCR(filePath);
          } else {
            // Handle image files
            console.log(`Detected image file: ${fileName}`);
            // Preprocess the image
            console.log("Preprocessing image for better OCR results...");
            const preprocessedImagePath = await preprocessImage(filePath);
            tempFiles.push(preprocessedImagePath);

            // Extract text from the preprocessed image
            extractedText = await processImageWithOCR(preprocessedImagePath);
          }

          if (extractedText && extractedText.trim()) {
            processedCount++;
            // Add page marker and the extracted text
            allExtractedText += `\n\n--- File ${i + 1
              }: ${fileName} ---\n\n${extractedText}`;
            console.log(
              `Successfully extracted ${extractedText.length
              } characters from file ${i + 1}`
            );
          } else {
            console.log(`No text extracted from file ${i + 1}`);
            errorCount++;
          }
        } catch (processingError) {
          console.error(`Error processing file ${i + 1}:`, processingError);
          errorCount++;
        }
      }

      // Check if any text was extracted
      if (!allExtractedText || allExtractedText.trim() === "") {
        console.log("No text could be extracted from any of the files");
        return res.status(422).json({
          error: "No text found",
          details: "No recognizable text could be extracted from the files",
        });
      }

      // Add a summary of the extraction process
      const summary = `\n\n=== Extraction Summary ===\nSuccessfully processed ${processedCount} of ${req.files.length
        } files${errorCount > 0 ? ` (${errorCount} files had issues)` : ""}\n`;

      allExtractedText = summary + allExtractedText;

      console.log(
        `Extracted text from all files, total length: ${allExtractedText.length}`
      );

      // Clean up temporary files
      cleanupFiles([...tempFiles, ...req.files.map((f) => f.path)]);

      return res.status(200).json({
        text: allExtractedText.trim(),
        fileCount: req.files.length,
        successCount: processedCount,
        errorCount: errorCount,
      });
    } catch (error) {
      console.error("Error processing files:", error);
      return res.status(500).json({
        error: "An error occurred while processing the files",
        details: error.message || "Unknown error during OCR processing",
      });
    }
  },

  // Add the old methods with a redirect for compatibility
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
        // Check if it's a PDF - now we'll process it
        if (fileType === "application/pdf") {
          console.log(
            "Detected PDF file - Converting to images and processing"
          );
          extractedText = await processPdfWithOCR(filePath);
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
          error: `Document Processing Failed`,
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

export default ocrController;