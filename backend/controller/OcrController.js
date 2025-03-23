import { ImageAnnotatorClient } from "@google-cloud/vision";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import multer from "multer";
import { promisify } from "util";
import { exec } from "child_process";
import { PDFDocument } from "pdf-lib";
import { fromPath } from "pdf2pic";
import { createCanvas } from "canvas";
import * as pdfjs from "pdfjs-dist";
import pdfParse from "pdf-parse";
import pdf2pic from "pdf2pic";

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
    console.error("Error processing PDF directly:", error);
    throw error;
  }
}

// Bypass PDF rendering and send individual page snapshots
async function processImageBasedPdfPages(pdfPath) {
  console.log("Processing image-based PDF using direct page extraction");
  let extractedText = "";

  try {
    // Create temporary directory for extracted images
    const tempDir = path.join(os.tmpdir(), `pdf-images-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const tempFiles = [];

    try {
      // Read the PDF file
      const dataBuffer = fs.readFileSync(pdfPath);

      // Try pure pdf2pic approach first (most reliable for image extraction)
      try {
        console.log("Attempting pdf2pic direct extraction...");

        // Configure the conversion
        const options = {
          density: 300,
          saveFilename: "page",
          savePath: tempDir,
          format: "png",
          width: 2000,
          height: 2000,
        };

        // Handle potential errors with pdf2pic
        try {
          // Use direct file path with pdf2pic
          const convert = pdf2pic.fromPath(pdfPath, options);

          // Get page count using PDFDocument from pdf-lib
          const pdfDoc = await PDFDocument.load(dataBuffer);
          const pageCount = pdfDoc.getPageCount();

          console.log(`PDF has ${pageCount} pages, extracting as images`);

          // Process each page
          for (let i = 1; i <= pageCount; i++) {
            console.log(`Converting page ${i} with pdf2pic`);

            try {
              // Convert the page to image - this will fail if GraphicsMagick is not installed
              const result = await convert(i);

              if (result && result.path && fs.existsSync(result.path)) {
                console.log(
                  `Successfully converted page ${i} to ${result.path}`
                );
                tempFiles.push(result.path);

                // Process with OCR
                const pageText = await processImageWithOCR(result.path);
                if (pageText && pageText.trim()) {
                  extractedText += pageText + "\n\n--- Page Break ---\n\n";
                }
              } else {
                console.log(`Failed to convert page ${i} - no result path`);
              }
            } catch (pageError) {
              console.error(`Error converting page ${i}:`, pageError);
            }
          }

          if (extractedText.trim()) {
            return extractedText.trim();
          }
        } catch (pdf2picError) {
          console.error("pdf2pic extraction failed:", pdf2picError);
        }
      } catch (error) {
        console.error("Direct extraction failed:", error);
      }

      // If we get here, try direct Vision API processing as a last resort
      console.log("Attempting direct Vision API processing of PDF...");
      const base64Pdf = dataBuffer.toString("base64");

      const [result] = await visionClient.documentTextDetection({
        image: { content: base64Pdf },
        imageContext: {
          languageHints: ["en", "en-t-i0-handwrit"],
        },
      });

      if (result?.fullTextAnnotation?.text) {
        console.log("Successfully extracted text with direct Vision API call");
        return result.fullTextAnnotation.text;
      }

      console.log("All image-based extraction methods failed");
      return "";
    } finally {
      // Clean up temporary files
      cleanupFiles([...tempFiles, tempDir]);
    }
  } catch (error) {
    console.error("Error in image-based PDF processing:", error);
    return "";
  }
}

// Now update the processPdfWithOCR function with this additional method
async function processPdfWithOCR(pdfPath) {
  console.log(`Processing PDF: ${pdfPath}`);

  // Create temporary directory for storing converted images
  const tempDir = path.join(os.tmpdir(), `pdf-images-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`Created temporary directory: ${tempDir}`);

  const tempFiles = [];
  let allText = "";

  try {
    // First try extracting text directly from PDF
    try {
      console.log("Attempt 0: Trying to extract text directly from PDF...");
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(dataBuffer);

      if (data.text && data.text.trim().length > 0) {
        console.log(
          `Successfully extracted text directly: ${data.text.length} characters`
        );
        return data.text.trim();
      } else {
        console.log("No extractable text found in PDF, continuing with OCR...");
      }
    } catch (parseError) {
      console.error("Error extracting text directly:", parseError.message);
    }

    // Read and parse the PDF document to get page count
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();
    console.log(`PDF has ${pageCount} pages`);

    // Try multiple approaches to extract text
    for (let i = 0; i < pageCount; i++) {
      console.log(`Processing page ${i + 1} of ${pageCount}`);

      try {
        // Extract the specific page from the PDF
        const singlePagePdf = await PDFDocument.create();
        const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i]);
        singlePagePdf.addPage(copiedPage);
        const pdfBytes = await singlePagePdf.save();

        // Create a temporary file for this page
        const pagePdfPath = path.join(tempDir, `page_${i + 1}.pdf`);
        fs.writeFileSync(pagePdfPath, pdfBytes);
        tempFiles.push(pagePdfPath);

        // Method 1 and 2 remain the same...
        // [Your existing code for attempts 1 and 2]

        // If still no text detected, try our pure JavaScript renderer
        if (!pageText) {
          console.log(
            `Attempt 4: Using pure JavaScript PDF renderer for page ${i + 1}`
          );
          try {
            // Convert PDF page to image using our pure JS method
            const pngPath = await convertPdfToImageWithJs(
              pagePdfPath,
              tempDir,
              1
            );
            tempFiles.push(pngPath);

            console.log(`Successfully converted page to image: ${pngPath}`);

            // Process the PNG with OCR
            pageText = await processImageWithOCR(pngPath);
          } catch (jsRenderError) {
            console.error(`Error using JS renderer: ${jsRenderError.message}`);
          }
        }

        // Add the page text to our accumulated text if any was found
        if (pageText && pageText.trim()) {
          console.log(
            `Extracted ${pageText.length} characters from page ${i + 1}`
          );
          console.log(`Text preview: "${pageText.substring(0, 100)}..."`);
          allText += pageText + "\n\n--- Page Break ---\n\n";
        } else {
          console.log(
            `No text detected on page ${i + 1} after multiple attempts`
          );
        }
      } catch (pageError) {
        console.error(`Error processing page ${i + 1}:`, pageError);
      }
    }

    // Your existing fallback code for processing the entire PDF...

    return allText.trim();
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw error;
  } finally {
    // Clean up all temporary files
    console.log("Cleaning up temporary PDF processing files");
    cleanupFiles([...tempFiles, tempDir]);
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
        const stats = fs.statSync(file);

        if (stats.isDirectory()) {
          // Remove directory content first
          const dirContents = fs.readdirSync(file);
          dirContents.forEach((item) => {
            const itemPath = path.join(file, item);
            if (fs.statSync(itemPath).isFile()) {
              fs.unlinkSync(itemPath);
            }
          });

          // Then remove the directory
          fs.rmdirSync(file);
          console.log(`Removed directory: ${file}`);
        } else {
          // Remove file
          fs.unlinkSync(file);
          console.log(`Removed file: ${file}`);
        }
      }
    } catch (error) {
      console.error(`Failed to clean up ${file}:`, error);
    }
  });

  console.log("Cleanup complete");
}

export default ocrController;
