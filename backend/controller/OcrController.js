import { Storage } from "@google-cloud/storage";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import fs from "fs";
import path from "path";
import os from "os";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Configure temporary storage for uploaded files
const upload = multer({ dest: os.tmpdir() });

// Create a Vision client
const visionClient = new ImageAnnotatorClient({
  keyFilename: "./lunar-goal-452311-e6-1af8037708ca.json", // Path to your credentials file
});

const ocrController = {
  // Extract text from uploaded images
  extractTextFromImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Get the file path
      const filePath = req.file.path;

      console.log("Processing file:", req.file.originalname);

      // Read the file
      const imageFile = fs.readFileSync(filePath);

      // Convert the image to a base64 encoded string
      const encodedImage = imageFile.toString("base64");

      // Perform text detection
      const [result] = await visionClient.textDetection({
        image: { content: encodedImage },
      });

      const detections = result.textAnnotations;
      let extractedText = "";

      if (detections && detections.length > 0) {
        // The first result contains the entire extracted text
        extractedText = detections[0].description;
      }

      // Clean up the temporary file
      fs.unlinkSync(filePath);

      // Return the extracted text
      return res.json({
        text: extractedText,
        filename: req.file.originalname,
      });
    } catch (error) {
      console.error("Error extracting text:", error);
      return res.status(500).json({
        error: "Failed to extract text from image",
        details: error.message,
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
1. Identify main concepts, keywords, or technical terms in the text
2. For each identified term, create a definition from the surrounding context
3. The "term" should be concise (1-5 words) capturing the core concept
4. The "definition" should be comprehensive but exclude the term itself
5. If the same concept appears multiple times with different contexts, create separate entries
6. Format your response as a JSON array of term-definition pairs

FORMAT:
[
  {"term": "Keyword1", "definition": "Explanation without repeating the keyword..."},
  {"term": "Keyword2", "definition": "Explanation of this concept..."}
]

EXAMPLE INPUT:
"Machine Learning is a subset of artificial intelligence (AI) that enables systems to learn from data and improve their performance over time without being explicitly programmed."

EXAMPLE OUTPUT:
[{"term": "Machine Learning", "definition": "A subset of artificial intelligence (AI) that enables systems to learn from data and improve their performance over time without being explicitly programmed."}]

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

// Add this new preprocessing function
function preprocessExtractedText(text) {
  // Remove excessive whitespace
  let processed = text.replace(/\s+/g, " ").trim();

  // Fix bullet point formatting
  processed = processed.replace(/•\s*/g, "\n• ");

  // Fix numbered list formatting
  processed = processed.replace(/(\d+)\.\s*/g, "\n$1. ");

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

  return processed;
}

export default ocrController;
