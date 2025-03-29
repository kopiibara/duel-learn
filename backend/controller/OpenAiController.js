import { OpenAI } from "openai";
import dotenv from "dotenv";
import GeneratedMaterial from "../models/GeneratedMaterial.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Updated helper function to fetch item_id from study_material_content with corrected column names
const getItemIdFromStudyMaterial = async (
  studyMaterialId,
  term,
  itemNumber
) => {
  try {
    const { pool } = await import("../config/db.js");

    console.log(`=== FETCHING ITEM ID FOR "${term}" ===`);
    console.log(`- Study Material ID: ${studyMaterialId}`);
    console.log(`- Term: "${term}"`);
    console.log(`- Item Number: ${itemNumber}`);

    // Try exact term match
    const [exactTermResults] = await pool.query(
      `SELECT item_id, item_number FROM study_material_content 
       WHERE study_material_id = ? AND term = ? 
       LIMIT 1`,
      [studyMaterialId, term]
    );

    if (exactTermResults && exactTermResults.length > 0) {
      console.log(
        `✓ EXACT MATCH: Found item_id ${exactTermResults[0].item_id} for term "${term}" in study_material_content`
      );
      return {
        itemId: exactTermResults[0].item_id,
        itemNumber: exactTermResults[0].item_number,
      };
    }

    // If no exact match, try case-insensitive match
    console.log(`No exact match for "${term}", trying case-insensitive match`);
    const [caseInsensitiveResults] = await pool.query(
      `SELECT item_id, item_number, term FROM study_material_content 
       WHERE study_material_id = ? AND LOWER(term) = LOWER(?) 
       LIMIT 1`,
      [studyMaterialId, term]
    );

    if (caseInsensitiveResults && caseInsensitiveResults.length > 0) {
      console.log(
        `✓ CASE-INSENSITIVE MATCH: Found item_id ${caseInsensitiveResults[0].item_id} for term "${term}"`
      );
      return {
        itemId: caseInsensitiveResults[0].item_id,
        itemNumber: caseInsensitiveResults[0].item_number,
      };
    }

    // If no match by term, try by item_number
    if (itemNumber) {
      console.log(
        `No term match for "${term}", trying to match by item_number ${itemNumber}`
      );
      const [numResults] = await pool.query(
        `SELECT item_id, term FROM study_material_content 
         WHERE study_material_id = ? AND item_number = ? 
         LIMIT 1`,
        [studyMaterialId, itemNumber]
      );

      if (numResults && numResults.length > 0) {
        console.log(
          `✓ ITEM NUMBER MATCH: Found item_id ${numResults[0].item_id} for item_number ${itemNumber}`
        );
        return {
          itemId: numResults[0].item_id,
          itemNumber: itemNumber,
        };
      }
    }

    // Log failure and return null if no match found
    console.warn(
      `❌ NO MATCHING CONTENT FOUND in study_material_content for "${term}" or item_number ${itemNumber}`
    );
    return null;
  } catch (error) {
    console.error("Error fetching item_id from study_material_content:", error);
    return null;
  }
};

// Helper function to store generated questions in the database
const storeGeneratedQuestions = async (studyMaterialId, items, questions, gameMode = "peaceful") => {
  console.log("=== STORING GENERATED QUESTIONS - START ===");
  console.log(`Questions to store: ${questions.length}`);
  console.log(`Items available: ${items.length}`);

  const normalizedGameMode = gameMode.toLowerCase().trim();

  try {
    // Clear existing questions only once at the start
    await clearQuestionsForMaterial(studyMaterialId, normalizedGameMode);

    // Generate a question for each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // Use the same question template but with different items
      const questionTemplate = questions[0]; // Use the first question as template

      try {
        const { pool } = await import('../config/db.js');

        console.log(`Processing item ${i + 1}/${items.length}:`, {
          item_number: item.item_number,
          term: item.term
        });

        // Process choices for multiple-choice questions
        let choicesJSON = null;
        if (questionTemplate.type === 'multiple-choice' && questionTemplate.options) {
          choicesJSON = JSON.stringify(questionTemplate.options);
        }

        const insertQuery = `
          INSERT INTO generated_material 
          (study_material_id, item_id, item_number, term, definition, 
           question_type, question, answer, choices, game_mode) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const insertValues = [
          studyMaterialId,
          item.id,
          item.item_number,
          item.term,
          item.definition,
          questionTemplate.type,
          `Which term is defined as: ${item.definition}`,
          item.term,
          choicesJSON,
          normalizedGameMode
        ];

        const [result] = await pool.execute(insertQuery, insertValues);
        console.log(`✅ Stored question ${i + 1} successfully (ID: ${result.insertId})`);

      } catch (error) {
        console.error(`Error storing question for item ${i + 1}:`, error);
      }
    }

    // Verify storage
    const { pool } = await import('../config/db.js');
    const [storedQuestions] = await pool.query(
      'SELECT * FROM generated_material WHERE study_material_id = ? AND game_mode = ?',
      [studyMaterialId, normalizedGameMode]
    );

    console.log(`\n=== QUESTION STORAGE SUMMARY ===`);
    console.log(`Items processed: ${items.length}`);
    console.log(`Questions actually stored: ${storedQuestions.length}`);

    return true;
  } catch (error) {
    console.error("Error in storeGeneratedQuestions:", error);
    throw error;
  }
};

// Update the clearQuestionsForMaterial function
const clearQuestionsForMaterial = async (studyMaterialId, gameMode) => {
  try {
    const { pool } = await import('../config/db.js');

    console.log(`Clearing existing questions for study material ${studyMaterialId} and game mode ${gameMode}`);

    const [existingQuestions] = await pool.query(
      'SELECT id, item_number FROM generated_material WHERE study_material_id = ? AND game_mode = ?',
      [studyMaterialId, gameMode]
    );

    if (existingQuestions.length > 0) {
      const deleteQuery = `
        DELETE FROM generated_material 
        WHERE study_material_id = ? AND game_mode = ?
      `;

      const [result] = await pool.execute(deleteQuery, [studyMaterialId, gameMode]);
      console.log(`Cleared ${result.affectedRows} existing questions`);
    }

    return true;
  } catch (error) {
    console.error("Error clearing questions:", error);
    throw error;
  }
};

export const OpenAiController = {
  generateSummary: async (req, res) => {
    try {
      const { tags, items } = req.body;

      console.log("Received summary generation request with data:", {
        tagCount: tags?.length || 0,
        itemCount: items?.length || 0,
      });

      if (!items || !Array.isArray(items) || items.length === 0) {
        console.log("Invalid items data received:", items);
        return res.status(400).json({
          error: "Invalid items data",
          message: "Please provide at least one item with term and definition",
        });
      }

      const prompt = `Generate an overview that will cater the topic of the following details of the study material:  
            Tags: ${tags ? tags.join(", ") : "No tags"}  
            Items: ${items
          .map((item) => `${item.term}: ${item.definition}`)
          .join("\n")}  
            
            Make it so that it will gather the attention of the user that will read this overview and will make them interested to read the full study material.
            
            Rules:  
            1. Make it concise, clear, and professional.  
            2. Highlight the main idea in a cool way.  
            3. Use simple and engaging language`;

      console.log("Calling OpenAI API...");

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an AI that generates concise, accurate summaries of educational content.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 50, // Limit response length
        });

        const summary = completion.choices[0].message.content.trim();
        console.log("Generated summary:", summary);

        res.json({ summary });
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError.message);

        // Fallback: generate a simple summary if OpenAI fails
        let fallbackSummary = "";
        if (tags && tags.length > 0) {
          fallbackSummary = `Study guide on ${tags[0]}`;
        } else if (items && items.length > 0) {
          fallbackSummary = `Notes on ${items[0].term}`;
        } else {
          fallbackSummary = "Study material collection";
        }

        console.log("Using fallback summary:", fallbackSummary);
        res.json({
          summary: fallbackSummary,
          note: "Generated as fallback due to API error",
        });
      }
    } catch (error) {
      console.error("Error in generate-summary route:", error);
      res.status(500).json({
        error: "Failed to generate summary",
        message: "An error occurred while generating the summary",
        details: error.message,
      });
    }
  },

  generateIdentification: async (req, res) => {
    try {
      console.log("=== IDENTIFICATION QUESTION GENERATION - START ===");
      console.log(
        "Received identification question request with body:",
        req.body
      );
      const {
        term,
        definition,
        studyMaterialId,
        itemId,
        itemNumber,
        gameMode = "peaceful",
      } = req.body;

      // Normalize the game mode
      let normalizedGameMode = gameMode
        ? gameMode.toLowerCase().replace(/\s+/g, "-")
        : "peaceful";
      if (
        normalizedGameMode === "time-pressured" ||
        normalizedGameMode === "time-pressure"
      ) {
        normalizedGameMode = "time-pressured";
      }

      console.log("Game mode for identification question:", {
        original: gameMode,
        normalized: normalizedGameMode,
      });

      // Clean the term
      const cleanedTerm = term.replace(/^[A-D]\.\s+/, "");

      try {
        const { pool } = await import('../config/db.js');

        // Direct database insertion with empty string for choices
        const directInsertQuery = `
            INSERT INTO generated_material 
            (study_material_id, item_id, item_number, term, definition, question_type, question, answer, choices, game_mode) 
          VALUES (?, ?, ?, ?, ?, 'identification', ?, ?, '', ?)
            ON DUPLICATE KEY UPDATE 
            question = VALUES(question),
            answer = VALUES(answer),
            updated_at = CURRENT_TIMESTAMP
          `;

        const insertParams = [
          studyMaterialId,
          itemId || '1',
          itemNumber || 1,
          cleanedTerm,
          definition,
          definition,
          cleanedTerm,
          normalizedGameMode,
        ];

        const [directInsertResult] = await pool.execute(directInsertQuery, insertParams);
        console.log("Direct insertion result:", directInsertResult);

        // Create the response object
        const result = [{
          type: "identification",
          questionType: "identification",
          question_type: "identification",
          question: definition,
          answer: cleanedTerm,
          itemInfo: {
            term: cleanedTerm,
            definition: definition,
            itemId: itemId || '1',
            itemNumber: itemNumber || 1
          }
        }];

        console.log("=== IDENTIFICATION QUESTION GENERATION - COMPLETE ===");
        res.json(result);
      } catch (dbError) {
        console.error("DATABASE ERROR with identification question:", dbError);
        throw dbError;
      }
    } catch (error) {
      console.error("=== IDENTIFICATION QUESTION GENERATION - ERROR ===");
      console.error("Error in generate-identification route:", error);
      res.status(500).json({
        error: "Failed to generate identification question",
        details: error.message
      });
    }
  },

  generateTrueFalse: async (req, res) => {
    try {
      console.log("Received true/false question request");
      const {
        term,
        definition,
        numberOfItems = 1,
        studyMaterialId,
        itemId,
        itemNumber,
        gameMode = "peaceful",
      } = req.body;

      // Normalize the game mode
      let normalizedGameMode = gameMode
        ? gameMode.toLowerCase().replace(/\s+/g, "-")
        : "peaceful";
      if (
        normalizedGameMode === "time-pressured" ||
        normalizedGameMode === "time-pressure"
      ) {
        normalizedGameMode = "time-pressured";
      }

      console.log("Game mode for true/false question:", {
        original: gameMode,
        normalized: normalizedGameMode,
      });

      // Clean the term by removing any letter prefix
      const cleanedTerm = term.replace(/^[A-D]\.\s+/, "");

      const prompt = `Generate ${numberOfItems} true/false question(s) based on this term and definition:
Term: "${cleanedTerm}"
Definition: "${definition}"
Rules:
1. Use the definition to create statement(s) that can be true or false
2. The statement(s) should be clear and unambiguous
3. The answer should be either "True" or "False"
Format the response exactly as JSON:
[
  {
    "type": "true-false",
    "question": "(statement based on the definition)",
    "answer": "(True or False)"
  }
]
If generating multiple questions, include them all in the array.`;

      console.log("Calling OpenAI for true/false questions");
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI that generates true/false questions. Create clear statements that can be definitively answered as True or False based on the given term and definition.",
          },
          { role: "user", content: prompt },
        ],
      });

      const text = completion.choices[0].message.content;
      console.log("AI response for true/false received");

      // Parse and validate the response
      const cleanedText = text.replace(/```json|```/g, "").trim();
      let questions = JSON.parse(cleanedText);

      // Ensure it's in array format
      questions = Array.isArray(questions) ? questions : [questions];

      // Store the generated questions if studyMaterialId is provided
      if (studyMaterialId) {
        console.log(
          "Storing true/false questions with studyMaterialId:",
          studyMaterialId
        );
        try {
          // Check if this specific question type already exists for this material and mode
          const { pool } = await import("../config/db.js");
          const [rows] = await pool.query(
            "SELECT COUNT(*) as count FROM generated_material WHERE study_material_id = ? AND game_mode = ? AND question_type = ? AND term = ?",
            [studyMaterialId, normalizedGameMode, "true-false", cleanedTerm]
          );

          const existingCount = parseInt(rows[0].count || "0");
          console.log(
            `Found ${existingCount} existing true-false questions for this term`
          );

          // Fetch the actual item_id from study_material_content with enhanced debugging
          console.log(
            `Looking up content for true/false question with term "${cleanedTerm}"`
          );
          const contentItem = await getItemIdFromStudyMaterial(
            studyMaterialId,
            cleanedTerm,
            itemNumber
          );
          let actualItemId, actualItemNumber;

          if (contentItem && contentItem.itemId) {
            actualItemId = contentItem.itemId; // Keep as string
            actualItemNumber = contentItem.itemNumber;
            console.log(
              `✅ SUCCESS: Using actual item_id ${actualItemId} (type: ${typeof actualItemId}) from study_material_content for term "${cleanedTerm}"`
            );
          } else {
            console.warn(
              `❌ FAILURE: Couldn't find item_id in study_material_content for term "${cleanedTerm}"`
            );
            actualItemId = itemId || String(1); // Ensure string format
            actualItemNumber = itemNumber || 1;
          }

          console.log(
            `Using item_id ${actualItemId} and item_number ${actualItemNumber} for true/false question`
          );

          // Always store the question, replacing if it exists
          await storeGeneratedQuestions(
            studyMaterialId,
            [
              {
                id: actualItemId,
                term: cleanedTerm,
                definition,
                item_number: actualItemNumber,
              },
            ],
            questions,
            normalizedGameMode
          );
          console.log("Successfully stored true/false questions");
        } catch (storeError) {
          console.error("Error storing true/false questions:", storeError);
        }
      }

      console.log("Sending true/false questions:", questions);
      res.json(questions);
    } catch (error) {
      console.error("Error in generate-true-false route:", error);
      res.status(500).json({
        error: "Failed to generate true/false question",
        details: error.message,
      });
    }
  },

  generateMultipleChoice: async (req, res) => {
    try {
      console.log(
        "Received multiple choice question request with body:",
        req.body
      );
      const {
        term,
        definition,
        numberOfItems = 1,
        studyMaterialId,
        itemId,
        itemNumber,
        gameMode = "peaceful",
      } = req.body;

      // Normalize the game mode
      let normalizedGameMode = gameMode
        ? gameMode.toLowerCase().replace(/\s+/g, "-")
        : "peaceful";
      if (
        normalizedGameMode === "time-pressured" ||
        normalizedGameMode === "time-pressure"
      ) {
        normalizedGameMode = "time-pressured";
      }

      console.log("Game mode for multiple choice question:", {
        original: gameMode,
        normalized: normalizedGameMode,
      });

      // Validate required parameters
      if (!term || !definition) {
        console.log("Missing required parameters:", { term, definition });
        return res.status(400).json({ error: "Missing term or definition" });
      }

      if (!studyMaterialId) {
        console.log("Missing studyMaterialId");
        return res.status(400).json({ error: "Missing studyMaterialId" });
      }

      // Clean the term by removing any letter prefix
      const cleanedTerm = term.replace(/^[A-D]\.\s+/, "");
      console.log("Cleaned term:", cleanedTerm);

      // Updated prompt to generate similar options to the term
      const prompt = `Generate ${numberOfItems} multiple choice questions based on this term and definition:
Term: "${cleanedTerm}"
Definition: "${definition}"

Rules for generating the question:
1. The question should ask which term matches the definition
2. Generate 3 plausible but incorrect options that are similar to the original term "${cleanedTerm}"
3. The original term MUST be one of the options
4. Options must be complete words or phrases, NEVER single letters
5. Each option should be similar in nature to the original term "${cleanedTerm}"
6. CRITICAL: All options MUST be of similar length and style to the original term "${cleanedTerm}"
7. IMPORTANT: The incorrect options should be terms that someone might confuse with "${cleanedTerm}", NOT terms related to the definition
8. The options should be in the same category or domain as "${cleanedTerm}"
9. DO NOT include phrases like "similar to..." in the options

Format the response exactly as JSON array:
[
  {
    "type": "multiple-choice",
    "question": "Which term is defined as: ${definition}",
    "options": {
      "A": "(first option - similar to ${cleanedTerm})",
      "B": "(second option - similar to ${cleanedTerm})",
      "C": "(third option - similar to ${cleanedTerm})",
      "D": "(fourth option - similar to ${cleanedTerm})"
    },
    "answer": "(letter). ${cleanedTerm}"
  }
]
If generating multiple questions, include them all in the array.

Important:
- The answer format must be "letter. term" where letter matches where the term appears in options
- Never use single letters or numbers as options
- Keep options similar to the original term in style and meaning
- The original term must appear exactly as provided in one of the options
- Make sure all options are plausible alternatives that someone might confuse with the correct term
- The incorrect options should be terms that could be mistaken for "${cleanedTerm}", not terms related to the definition
- Do not include explanatory text like "similar to..." in the options`;

      console.log("Calling OpenAI for multiple choice questions");
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              'You are a helpful AI that generates multiple-choice questions. Create questions where the user must select the correct term that matches a definition. Include the original term as one of the options, and ensure all other options are similar terms that might be confused with the correct answer. The incorrect options should be terms that could be mistaken for the original term, not terms related to the definition. Format the answer as "letter. term" where the letter matches where the term appears in the options. DO NOT include phrases like "similar to..." in the options.',
          },
          { role: "user", content: prompt },
        ],
      });

      const text = completion.choices[0].message.content;
      console.log("AI response for multiple choice received:", text);

      // Remove any Markdown formatting from the response
      const cleanedText = text.replace(/```json|```/g, "").trim();
      console.log("Cleaned AI response:", cleanedText);

      try {
        console.log("Parsing AI response");
        let questions = JSON.parse(cleanedText);

        // Ensure questions is always an array
        if (!Array.isArray(questions)) {
          questions = [questions];
        }

        // Process and clean up the questions
        questions = questions.map((q) => {
          // Ensure the question has the correct type
          q.type = "multiple-choice";

          // Clean up options - remove any "similar to..." text
          if (q.options) {
            Object.keys(q.options).forEach((key) => {
              // Remove any text like "similar to..." from options
              q.options[key] = q.options[key]
                .replace(/similar to .+/i, "")
                .replace(/\(.+\)/g, "")
                .trim();
            });
          }

          return q;
        });

        // In the generateMultipleChoice function, update the storage section:
        if (studyMaterialId) {
          console.log(
            "Storing multiple choice questions with studyMaterialId:",
            studyMaterialId
          );
          try {
            const { pool } = await import('../config/db.js');

            // Get all items for this study material
            const [allItems] = await pool.query(
              'SELECT * FROM study_material_content WHERE study_material_id = ? ORDER BY item_number',
              [studyMaterialId]
            );

            console.log(`Found ${allItems.length} items for study material`);

            // Create an array of items with the same length as questions
            const itemsToStore = allItems.map(item => ({
              id: item.item_id,
              term: item.term,
              definition: item.definition,
              item_number: item.item_number
            }));

            // Store all questions with their corresponding items
            await storeGeneratedQuestions(studyMaterialId, itemsToStore, questions, normalizedGameMode);
            console.log("Successfully stored multiple choice questions");
          } catch (storeError) {
            console.error(
              "Error storing multiple choice questions:",
              storeError
            );
          }
        }

        console.log("Sending multiple choice questions:", questions);
        res.json(questions);
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", cleanedText);
        console.error("Parse error:", parseError);
        res.status(500).json({
          error: "Failed to parse questions",
          rawResponse: cleanedText,
          parseError: parseError.message,
        });
      }
    } catch (error) {
      console.error("Error in generate-multiple-choice route:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        body: req.body,
      });
      res.status(500).json({
        error: "Failed to generate multiple choice questions",
        details: error.message,
        stack: error.stack,
      });
    }
  },

  // New method for cross-referencing definitions
  crossReferenceDefinition: async (req, res) => {
    try {
      console.log("Received cross-reference request");
      const { term, definition } = req.body;

      if (!term || !definition) {
        console.log("Missing required parameters");
        return res.status(400).json({
          error: "Missing required parameters",
          message: "Both term and definition are required",
        });
      }

      // Validate definition has enough content to check
      if (definition.trim().split(/\s+/).length < 5) {
        console.log("Definition too short for meaningful cross-reference");
        return res.status(400).json({
          error: "Definition too vague",
          message:
            "Please provide a more detailed definition for effective fact-checking",
        });
      }

      console.log(`Cross-referencing term: "${term}" with definition`);

      const prompt = `Please fact-check this definition for the term "${term}" with a very lenient approach:
      
Definition: "${definition}"

Instructions:
1. Be EXTREMELY lenient - focus ONLY on definitively incorrect facts, not style or completeness.
2. Accept different ways to express a concept as valid.
3. Only flag individual words or short phrases that are factually wrong (e.g., in "dog is a plant that walks," only flag "plant").
4. Do not suggest rewriting the entire definition - ONLY identify specific incorrect words and their replacements.
5. Ignore minor issues, stylistic differences, or incomplete information.
6. Make sure the definition doesn't include the term itself - if it does, flag this circular reference.

Respond with JSON in this exact format:
{
  "isAccurate": boolean,
  "accuracyScore": number (0-100),
  "assessment": "brief assessment, mention it's just checking for definitively wrong facts",
  "incorrectParts": ["specific word/phrase that is wrong", "another specific word/phrase"] (empty array if nothing is definitively wrong),
  "suggestedCorrections": ["replacement for first part", "replacement for second part"] (empty array if nothing to correct)
}

Assessment criteria:
- "Accurate" (70-100): Definition doesn't contain any definitively incorrect facts
- "Inaccurate" (<70): Definition contains at least one definitively wrong statement

Important: 
- SPECIFIC WORDS ONLY - Do not flag whole sentences, only the exact words that need changing
- Different phrasings, styles, or levels of detail are all acceptable
- Focus only on factual correctness, not completeness
- If the definition is technically incomplete but not wrong, still mark it as accurate
- If the definition is too vague to assess, set isAccurate to null
- If the definition contains the term itself (e.g., "A dog is a dog that..."), flag this circular reference`;

      console.log("Calling OpenAI for cross-reference assessment");
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an extremely lenient fact-checker who only flags definitively incorrect information. You focus on specific words or short phrases that are factually wrong rather than suggesting rewrites. For example, if a definition says 'dog is a plant that walks,' you would only flag the word 'plant' and suggest 'animal' as a replacement. Accept many different ways of expressing concepts and assume the user knows what they're doing unless something is clearly incorrect.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2, // Lower temperature for more consistent identification of incorrect parts
      });

      const text = completion.choices[0].message.content;
      console.log("AI response for cross-reference received");

      // Remove any Markdown formatting from the response and parse JSON
      const cleanedText = text.replace(/```json|```/g, "").trim();

      try {
        console.log("Parsing AI response");
        const assessment = JSON.parse(cleanedText);

        // If the definition is too vague for assessment
        if (assessment.isAccurate === null) {
          return res.status(400).json({
            error: "Definition too vague",
            message:
              assessment.assessment ||
              "The definition lacks sufficient detail for assessment",
          });
        }

        console.log("Cross-reference assessment:", assessment);
        res.json(assessment);
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        res.status(500).json({
          error: "Failed to process AI response",
          message: "The AI response could not be properly interpreted",
        });
      }
    } catch (error) {
      console.error("Error in cross-reference-definition route:", error);
      res.status(500).json({
        error: "Failed to cross-reference definition",
        message: "An error occurred during the cross-reference process",
        details: error.message,
      });
    }
  },

  // New function to save session results and ensure questions are stored
  saveSessionResults: async (req, res) => {
    try {
      console.log("=== SAVE SESSION RESULTS - START ===");
      console.log("Received session results request body:", req.body);

      const {
        studyMaterialId,
        timeSpent,
        correctCount,
        incorrectCount,
        mode,
        highestStreak,
        masteredCount,
        unmasteredCount,
        questions,
        items,
      } = req.body;

      // Normalize the game mode to ensure consistent format
      // Convert to lowercase and replace spaces with hyphens for consistency
      let gameMode = mode
        ? mode.toLowerCase().replace(/\s+/g, "-")
        : "peaceful";

      // Special handling for "Time Pressured" mode
      if (gameMode === "time-pressured" || gameMode === "time-pressure") {
        gameMode = "time-pressured";
      } else if (gameMode === "peaceful") {
        gameMode = "peaceful";
      }

      console.log("Game mode normalization:", {
        original: mode,
        normalized: gameMode,
      });

      console.log("Extracted data:", {
        studyMaterialId,
        timeSpent,
        correctCount,
        incorrectCount,
        mode,
        gameMode,
        highestStreak,
        masteredCount,
        unmasteredCount,
        questionsCount: questions?.length || 0,
        itemsCount: items?.length || 0,
      });

      if (!studyMaterialId) {
        console.error("Missing studyMaterialId in request");
        return res.status(400).json({
          success: false,
          error: "Missing studyMaterialId",
        });
      }

      // Check if we have questions to store
      if (Array.isArray(questions) && questions.length > 0) {
        console.log(`Processing ${questions.length} questions for storage`);

        // Log question types to help with debugging
        const questionTypes = questions
          .map((q) => q.type || q.questionType)
          .filter(Boolean);
        const typeCounts = questionTypes.reduce((acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        console.log("Question types in payload:", typeCounts);

        // First declaration (keep this one)
        const identificationQuestions = questions.filter(
          (q) =>
            q.type === "identification" ||
            q.questionType === "identification" ||
            q.question_type === "identification"
        );

        console.log(
          `Found ${identificationQuestions.length} identification questions in request`
        );
        if (identificationQuestions.length > 0) {
          console.log(
            "Identification question samples:",
            identificationQuestions.map((q) => ({
              type: q.type,
              questionType: q.questionType,
              question_type: q.question_type,
              term: q.itemInfo?.term || "unknown",
              question: q.question,
              answer: q.answer || q.correctAnswer,
            }))
          );
        }

        // Create items from itemInfo if items are not provided
        const providedItems = items || [];
        const processedItems =
          providedItems.length > 0
            ? providedItems
            : questions.map((q, index) => {
              // First try to get item from itemInfo
              if (q.itemInfo && q.itemInfo.term && q.itemInfo.definition) {
                console.log(
                  `Creating item from question ${index + 1} itemInfo:`,
                  q.itemInfo
                );
                return {
                  id: q.itemInfo.itemId || index + 1,
                  term: q.itemInfo.term,
                  definition: q.itemInfo.definition,
                };
              } else {
                // Fall back to creating from question fields
                const item = {
                  id: index + 1,
                  term: q.correctAnswer || q.answer || `Item ${index + 1}`,
                  definition: q.question || `Definition ${index + 1}`,
                };
                console.log(`Created dummy item ${index + 1}:`, item);
                return item;
              }
            });

        console.log(`Processed ${processedItems.length} items for storage`);

        // Filter out duplicate questions (same term and question type)
        const uniqueQuestions = [];
        const seenKeys = new Set(); // Track unique term + question_type combinations

        console.log("Filtering questions to ensure uniqueness...");

        for (const question of questions) {
          const term =
            question.itemInfo?.term ||
            question.correctAnswer ||
            question.answer;
          const questionType = question.type || question.questionType;

          // Create a unique key for this term and question type
          const key = `${term}:${questionType}`;

          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueQuestions.push(question);
            console.log(
              `✓ Added question for term "${term}" of type ${questionType}`
            );
          } else {
            console.log(
              `✗ Filtering out duplicate question for term "${term}" of type ${questionType}`
            );
          }
        }

        console.log(
          `Filtered questions: ${questions.length} -> ${uniqueQuestions.length}`
        );
        console.log(`Unique term+type combinations: ${seenKeys.size}`);

        // Right before calling storeGeneratedQuestions, check the items format
        console.log(
          "Items before storage:",
          items.map((item) => ({
            id: item.id,
            term: item.term,
            definition: item.definition,
          }))
        );

        // Store the questions
        try {
          console.log("Calling storeGeneratedQuestions with:", {
            studyMaterialId,
            processedItemsCount: processedItems.length,
            questionsCount: uniqueQuestions.length,
            gameMode,
          });

          await storeGeneratedQuestions(
            studyMaterialId,
            processedItems,
            uniqueQuestions,
            gameMode
          );
          console.log(
            `Successfully stored ${uniqueQuestions.length} questions for study material ${studyMaterialId} with game mode ${gameMode}`
          );
        } catch (storeError) {
          console.error(
            "Error storing questions from session results:",
            storeError
          );
          console.error("Error details:", {
            message: storeError.message,
            stack: storeError.stack,
          });
        }

        // Change the second declaration to use a different variable name
        const identificationQuestionsForDebug = questions.filter(
          (q) =>
            q.type === "identification" || q.questionType === "identification"
        );

        if (identificationQuestionsForDebug.length > 0) {
          console.log("=== IDENTIFICATION QUESTION DEBUG ===");
          console.log(
            `Found ${identificationQuestionsForDebug.length} identification questions`
          );

          // For each identification question, try to store it directly
          for (let i = 0; i < identificationQuestionsForDebug.length; i++) {
            const q = identificationQuestionsForDebug[i];

            // Extract all relevant data
            const term =
              q.itemInfo?.term || q.correctAnswer || q.answer || "Unknown Term";
            const definition =
              q.itemInfo?.definition || q.question || "Unknown Definition";
            const question = q.question || "Unknown Question";
            const answer = q.correctAnswer || q.answer || term;

            console.log(`Identification question ${i + 1}:`);
            console.log(` - Term: ${term}`);
            console.log(` - Definition: ${definition}`);
            console.log(` - Question: ${question}`);
            console.log(` - Answer: ${answer}`);

            try {
              const { pool } = await import("../config/db.js");

              // Fetch the actual item_id from study_material_content with enhanced debugging
              console.log(
                `Looking up content for identification question ${i + 1
                } with term "${term}"`
              );
              const contentItem = await getItemIdFromStudyMaterial(
                studyMaterialId,
                term,
                i + 1
              );
              let actualItemId, actualItemNumber;

              if (contentItem && contentItem.itemId) {
                actualItemId = contentItem.itemId; // Keep as string
                actualItemNumber = contentItem.itemNumber;
                console.log(
                  `✅ SUCCESS: Using actual item_id ${actualItemId} (type: ${typeof actualItemId}) from study_material_content for term "${term}"`
                );
              } else {
                console.warn(
                  `❌ FAILURE: Couldn't find item_id in study_material_content for term "${term}"`
                );
                actualItemId = q.itemInfo?.itemId || String(i + 1); // Use fallback but ensure it's not study_material_id
                actualItemNumber = q.itemInfo?.itemNumber || i + 1;

                // Make sure actualItemId isn't accidentally the study_material_id
                if (actualItemId === studyMaterialId) {
                  console.warn(
                    `⚠️ Detected item_id same as study_material_id. Using fallback ID instead.`
                  );
                  actualItemId = `item_${i + 1}`;
                }
              }

              console.log(
                `Using item_id ${actualItemId} and item_number ${actualItemNumber} for identification question ${i + 1
                }`
              );

              // Try simple manual insertion
              const directInsertQuery = `
                INSERT INTO generated_material 
                (study_material_id, item_id, item_number, term, definition, question_type, question, answer, game_mode) 
                VALUES (?, ?, ?, ?, ?, 'identification', ?, ?, ?)
              `;

              const directInsertValues = [
                studyMaterialId,
                actualItemId, // Use the properly fetched item_id
                actualItemNumber,
                term,
                definition,
                question,
                answer,
                "peaceful",
              ];

              console.log(
                `Executing direct insert for identification question ${i + 1
                }...`
              );
              console.log(`Direct insert values:`, directInsertValues);

              try {
                const [directResult] = await pool.execute(
                  directInsertQuery,
                  directInsertValues
                );
                console.log(`Direct insertion result:`, directResult);

                if (directResult.affectedRows > 0) {
                  console.log(
                    `✅ Successfully inserted identification question ${i + 1
                    } directly`
                  );
                } else {
                  console.warn(
                    `⚠️ Direct insertion affected 0 rows for identification question ${i + 1
                    }`
                  );
                }
              } catch (directError) {
                console.error(`❌ Error with direct insertion:`, directError);

                // Try update if insert failed
                try {
                  const updateQuery = `
                    UPDATE generated_material 
                    SET definition = ?, question = ?, answer = ?
                    WHERE study_material_id = ? AND term = ? AND question_type = 'identification' AND game_mode = 'peaceful'
                  `;

                  const updateValues = [
                    definition,
                    question,
                    answer,
                    studyMaterialId,
                    term,
                  ];

                  const [updateResult] = await pool.execute(
                    updateQuery,
                    updateValues
                  );
                  console.log(`Update result:`, updateResult);

                  if (updateResult.affectedRows > 0) {
                    console.log(
                      `✅ Successfully updated identification question ${i + 1}`
                    );
                  } else {
                    console.warn(
                      `⚠️ Update affected 0 rows for identification question ${i + 1
                      }`
                    );
                  }
                } catch (updateError) {
                  console.error(`❌ Error with update:`, updateError);
                }
              }

              // Verify by query
              const [verifyResult] = await pool.query(
                `SELECT * FROM generated_material WHERE study_material_id = ? AND term = ? AND question_type = 'identification'`,
                [studyMaterialId, term]
              );

              if (verifyResult && verifyResult.length > 0) {
                console.log(
                  `✅ Verification found identification question in DB:`,
                  verifyResult[0]
                );
              } else {
                console.error(
                  `❌ Verification FAILED for identification question ${i + 1}`
                );
              }
            } catch (manualError) {
              console.error(
                `Critical error with manual insertion:`,
                manualError
              );
            }
          }
        }
      } else {
        console.log("No questions to store in session results");
      }

      // Here you could also save other session statistics to a different table if needed
      console.log("=== SAVE SESSION RESULTS - COMPLETE ===");
      res.status(200).json({
        success: true,
        message: "Session results saved successfully",
        studyMaterialId,
      });
    } catch (error) {
      console.error("=== SAVE SESSION RESULTS - ERROR ===");
      console.error("Error saving session results:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({
        success: false,
        error: "Failed to save session results",
        details: error.message,
      });
    }
  },

  // Function to clear all questions for a study material
  clearQuestionsForMaterial: async (req, res) => {
    try {
      const studyMaterialId = req.params.studyMaterialId;
      const gameMode = req.query.gameMode;

      if (!gameMode) {
        return res.status(400).json({
          success: false,
          error: 'Game mode is required'
        });
      }

      console.log(`Clearing questions for study material ${studyMaterialId} in ${gameMode} mode`);

      // Delete questions for specific study material AND game mode
      const result = await GeneratedMaterial.query()
        .delete()
        .where({
          study_material_id: studyMaterialId,
          game_mode: gameMode
        });

      console.log(`Cleared ${result} questions for ${gameMode} mode`);

      return res.json({
        success: true,
        message: `Successfully cleared questions for study material ${studyMaterialId}`,
        count: result
      });
    } catch (error) {
      console.error('Error clearing questions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to clear questions'
      });
    }
  },

  // Update the save function to handle duplicates
  saveGeneratedQuestion: async (
    studyMaterialId,
    itemId,
    itemNumber,
    term,
    definition,
    type,
    question,
    answer,
    gameMode
  ) => {
    try {
      // First try to delete any existing question with the same key combination
      const deleteQuery = `
        DELETE FROM generated_material 
        WHERE study_material_id = ? 
        AND term = ? 
        AND question_type = ? 
        AND game_mode = ?
      `;

      await pool.query(deleteQuery, [studyMaterialId, term, type, gameMode]);

      // Then insert the new question
      const insertQuery = `
        INSERT INTO generated_material 
        (study_material_id, item_id, item_number, term, definition, question_type, question, answer, game_mode) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.query(insertQuery, [
        studyMaterialId,
        itemId,
        itemNumber,
        term,
        definition,
        type,
        question,
        answer,
        gameMode,
      ]);

      return result;
    } catch (error) {
      console.error("Error saving generated question:", error);
      throw error;
    }
  },
};