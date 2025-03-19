import { OpenAI } from "openai";
import dotenv from "dotenv";
import GeneratedMaterial from '../models/GeneratedMaterial.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to store generated questions in the database
const storeGeneratedQuestions = async (studyMaterialId, items, questions, gameMode = "peaceful") => {
  try {
    // Normalize the game mode to ensure consistent format
    // Convert to lowercase and replace spaces with hyphens for consistency
    let normalizedGameMode = gameMode ? gameMode.toLowerCase().replace(/\s+/g, '-') : "peaceful";
    
    // Special handling for "Time Pressured" mode
    if (normalizedGameMode === "time-pressured" || normalizedGameMode === "time-pressure") {
      normalizedGameMode = "time-pressured";
    } else if (normalizedGameMode === "peaceful") {
      normalizedGameMode = "peaceful";
    }
    
    console.log("Game mode normalization in storeGeneratedQuestions:", {
      original: gameMode,
      normalized: normalizedGameMode
    });
    
    console.log("=== STORING GENERATED QUESTIONS - START ===");
    console.log("Parameters received:", {
      studyMaterialId,
      itemsCount: items?.length || 0,
      questionsCount: questions?.length || 0,
      gameMode: normalizedGameMode
    });
    console.log("Study Material ID:", studyMaterialId);
    console.log("Game Mode:", normalizedGameMode);
    console.log("First item:", items[0]);
    console.log("First question:", questions[0]);

    // Validate inputs
    if (!studyMaterialId) {
      console.error("Missing studyMaterialId");
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.error("Invalid or empty items array");
      return;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error("Invalid or empty questions array");
      return;
    }

    // First, check if the table exists
    try {
      await GeneratedMaterial.checkTableExists();
    } catch (tableCheckError) {
      console.error("Error checking table existence:", tableCheckError);
    }

    // Check if questions already exist for this study material and game mode
    let existingQuestions = 0;
    try {
      const result = await GeneratedMaterial.query()
        .where('study_material_id', studyMaterialId)
        .where('game_mode', normalizedGameMode)
        .count('* as count')
        .first();
      
      existingQuestions = result ? parseInt(result.count) : 0;
      console.log(`Found ${existingQuestions} existing questions for study material ${studyMaterialId} with game mode ${normalizedGameMode}`);
    } catch (countError) {
      console.error("Error counting existing questions with Objection:", countError);
    }

    // Always delete existing questions for this study material and game mode
    console.log(`Deleting existing questions for study_material_id: ${studyMaterialId} and game_mode: ${normalizedGameMode}`);
    let deletionSuccessful = false;
    
    try {
      // Try with direct SQL first (more reliable)
      const { pool } = await import('../config/db.js');
      console.log("Executing SQL DELETE query...");
      
      // First, log the existing questions to verify what we're deleting
      const [existingRows] = await pool.query(
        'SELECT COUNT(*) as count, GROUP_CONCAT(id) as ids, GROUP_CONCAT(item_number) as item_numbers FROM generated_material WHERE study_material_id = ? AND game_mode = ?', 
        [studyMaterialId, normalizedGameMode]
      );
      
      if (existingRows && existingRows[0]) {
        console.log(`Found ${existingRows[0].count} existing questions with IDs: ${existingRows[0].ids || 'none'}`);
        console.log(`Existing item_numbers: ${existingRows[0].item_numbers || 'none'}`);
      }
      
      // Now delete them
      const [deleteResult] = await pool.query(
        'DELETE FROM generated_material WHERE study_material_id = ? AND game_mode = ?', 
        [studyMaterialId, normalizedGameMode]
      );
      
      console.log("SQL Delete result:", deleteResult);
      console.log(`Deleted ${deleteResult.affectedRows} rows with SQL`);
      
      // Verify deletion
      const [verifyRows] = await pool.query(
        'SELECT COUNT(*) as count FROM generated_material WHERE study_material_id = ? AND game_mode = ?', 
        [studyMaterialId, normalizedGameMode]
      );
      
      if (verifyRows && verifyRows[0]) {
        console.log(`After deletion: ${verifyRows[0].count} questions remain`);
        if (verifyRows[0].count === 0) {
          deletionSuccessful = true;
        } else {
          console.warn(`⚠️ Deletion may not have been complete. ${verifyRows[0].count} questions remain.`);
        }
      }
    } catch (sqlError) {
      console.error("Error deleting with direct SQL:", sqlError);
      
      // Fallback to Objection if SQL fails
      try {
        console.log("Falling back to Objection.js for deletion...");
        const deleteResult = await GeneratedMaterial.query()
          .delete()
          .where('study_material_id', parseInt(studyMaterialId) || studyMaterialId)
          .where('game_mode', normalizedGameMode);
        console.log("Objection Delete result:", deleteResult);
        deletionSuccessful = true;
      } catch (deleteError) {
        console.error("Error deleting existing questions with Objection:", deleteError);
        // Continue with insertion even if deletion fails
      }
    }
    
    if (!deletionSuccessful) {
      console.warn("⚠️ Failed to delete existing questions. New questions may be duplicated.");
    } else {
      console.log("✅ Successfully deleted existing questions.");
    }

    console.log("Preparing to insert new questions");
    const insertPromises = [];

    // Create a map to track which item_numbers have been used
    const usedItemNumbers = new Map();
    const usedQuestions = new Set();
    const termToItemNumber = new Map(); // Map to track item_number for each term
    const usedNumbers = new Set(); // Track which item_numbers have been used
    
    // First pass: assign item_numbers to terms
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!termToItemNumber.has(item.term)) {
        termToItemNumber.set(item.term, i + 1);
      }
    }
    
    console.log("Term to item_number mapping:", Object.fromEntries(termToItemNumber));
    
    // Insert the questions
    console.log(`Inserting ${questions.length} questions for study material ${studyMaterialId} with game mode ${normalizedGameMode}`);
    
    // Process each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const item = items[i] || items[0]; // Use corresponding item or first item if there's only one
      
      // Get the item_number for this term, or use the index + 1 if not found
      let itemNumber = termToItemNumber.get(item.term) || (i + 1);
      
      // Create a unique key for this question type and term
      const questionTypeKey = `${item.term}-${question.type || 'unknown'}`;
      
      // Skip if we've already processed this exact question type for this term
      if (usedItemNumbers.has(questionTypeKey)) {
        console.log(`Skipping duplicate question for term "${item.term}" of type ${question.type}`);
        continue;
      }
      
      // Mark this question as processed
      usedItemNumbers.set(questionTypeKey, itemNumber);
      
      console.log(`Using item_number ${itemNumber} for term "${item.term}" of type ${question.type || 'unknown'}`);
      
      try {
        // Use direct SQL with REPLACE INTO to ensure uniqueness
        const { pool } = await import('../config/db.js');
        
        // Prepare the question data
        const questionData = {
          study_material_id: studyMaterialId,
          item_id: parseInt(item.id) || itemNumber,
          item_number: itemNumber,
          term: String(item.term),
          definition: String(item.definition),
          question_type: String(question.type || question.questionType),
          question: String(question.question),
          answer: String(question.answer || question.correctAnswer),
          choices: question.options ? JSON.stringify(question.options) : null,
          game_mode: normalizedGameMode
        };
        
        // Use REPLACE INTO to ensure we don't get duplicates
        const replaceQuery = `
          REPLACE INTO generated_material 
          (study_material_id, item_id, item_number, term, definition, question_type, question, answer, choices, game_mode) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const replaceValues = [
          studyMaterialId,
          questionData.item_id,
          itemNumber,
          questionData.term,
          questionData.definition,
          questionData.question_type,
          questionData.question,
          questionData.answer,
          questionData.choices,
          normalizedGameMode
        ];
        
        console.log(`Replacing question for term "${questionData.term}" of type ${questionData.question_type} with item_number ${itemNumber}`);
        
        const [replaceResult] = await pool.execute(replaceQuery, replaceValues);
        console.log(`SQL Replace result:`, replaceResult);
        
      } catch (sqlError) {
        console.error(`Error replacing question with SQL:`, sqlError);
        // Try with Objection as fallback
        try {
          // Prepare the question data
          const questionData = {
            study_material_id: studyMaterialId,
            item_id: parseInt(item.id) || itemNumber,
            item_number: itemNumber,
            term: String(item.term),
            definition: String(item.definition),
            question_type: String(question.type || question.questionType),
            question: String(question.question),
            answer: String(question.answer || question.correctAnswer),
            choices: question.options ? JSON.stringify(question.options) : null,
            game_mode: normalizedGameMode
          };
          
          // First try to delete any existing question with the same key attributes
          await GeneratedMaterial.query()
            .delete()
            .where('study_material_id', studyMaterialId)
            .where('term', questionData.term)
            .where('question_type', questionData.question_type)
            .where('game_mode', normalizedGameMode);
          
          // Then insert the new question
          const result = await GeneratedMaterial.query().insert(questionData);
          console.log(`Successfully inserted question ${itemNumber} with ID ${result.id}`);
        } catch (objectionError) {
          console.error(`Error with Objection fallback:`, objectionError);
          // Continue with the next question even if this one fails
        }
      }
    }
    
    console.log(`Successfully stored ${questions.length} questions for study material ${studyMaterialId}`);
    console.log("=== STORING GENERATED QUESTIONS - COMPLETE ===");
    return true;
  } catch (error) {
    console.error("=== STORING GENERATED QUESTIONS - ERROR ===");
    console.error("Error storing generated questions:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      studyMaterialId,
      itemsCount: items?.length || 0,
      questionsCount: questions?.length || 0,
      gameMode
    });
    throw error;
  }
};

const OpenAIController = {
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
      console.log("Received identification question request");
      const { term, definition, studyMaterialId, itemId, gameMode = "peaceful" } = req.body;
      
      // Normalize the game mode
      let normalizedGameMode = gameMode ? gameMode.toLowerCase().replace(/\s+/g, '-') : "peaceful";
      if (normalizedGameMode === "time-pressured" || normalizedGameMode === "time-pressure") {
        normalizedGameMode = "time-pressured";
      }
      
      console.log("Game mode for identification question:", {
        original: gameMode,
        normalized: normalizedGameMode
      });

      // Clean the term by removing any letter prefix (e.g., "D. AI" becomes "AI")
      const cleanedTerm = term.replace(/^[A-D]\.\s+/, "");

      // For identification, simply return the term and definition in question format
      const result = [
        {
          type: "identification",
          question: definition,
          answer: cleanedTerm,
        },
      ];

      // Store the generated question if studyMaterialId is provided
      if (studyMaterialId) {
        console.log("Checking if questions already exist before storing...");
        
        // Check if questions already exist for this study material
        let existingQuestions = 0;
        try {
          // First try with Objection.js
          const result = await GeneratedMaterial.query()
            .where('study_material_id', studyMaterialId)
            .count('* as count')
            .first();
          
          existingQuestions = result ? parseInt(result.count) : 0;
        } catch (countError) {
          console.error("Error counting existing questions:", countError);
          
          // Try with direct SQL
          try {
            const { pool } = await import('../config/db.js');
            const [rows] = await pool.query(
              'SELECT COUNT(*) as count FROM generated_material WHERE study_material_id = ?', 
              [studyMaterialId]
            );
            existingQuestions = parseInt(rows[0].count);
          } catch (sqlError) {
            console.error("Error counting with SQL:", sqlError);
          }
        }
        
        console.log(`Found ${existingQuestions} existing questions for study material ${studyMaterialId}`);
        
        // Only store if no questions exist
        if (existingQuestions === 0) {
          console.log("Storing identification question with studyMaterialId:", studyMaterialId);
          await storeGeneratedQuestions(studyMaterialId, [{ id: itemId, term: cleanedTerm, definition }], result, normalizedGameMode);
        } else {
          console.log(`Questions already exist for study material ${studyMaterialId}, skipping storage`);
        }
      }

      console.log("Generated identification question:", result);
      res.json(result);
    } catch (error) {
      console.error("Error in generate-identification route:", error);
      res.status(500).json({
        error: "Failed to generate identification question",
        details: error.message,
      });
    }
  },

  generateTrueFalse: async (req, res) => {
    try {
      console.log("Received true/false question request");
      const { term, definition, numberOfItems = 1, studyMaterialId, itemId, gameMode = "peaceful" } = req.body;
      
      // Normalize the game mode
      let normalizedGameMode = gameMode ? gameMode.toLowerCase().replace(/\s+/g, '-') : "peaceful";
      if (normalizedGameMode === "time-pressured" || normalizedGameMode === "time-pressure") {
        normalizedGameMode = "time-pressured";
      }
      
      console.log("Game mode for true/false question:", {
        original: gameMode,
        normalized: normalizedGameMode
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
        console.log("Checking if questions already exist before storing...");
        
        // Check if questions already exist for this study material
        let existingQuestions = 0;
        try {
          // First try with Objection.js
          const result = await GeneratedMaterial.query()
            .where('study_material_id', studyMaterialId)
            .count('* as count')
            .first();
          
          existingQuestions = result ? parseInt(result.count) : 0;
        } catch (countError) {
          console.error("Error counting existing questions:", countError);
          
          // Try with direct SQL
          try {
            const { pool } = await import('../config/db.js');
            const [rows] = await pool.query(
              'SELECT COUNT(*) as count FROM generated_material WHERE study_material_id = ?', 
              [studyMaterialId]
            );
            existingQuestions = parseInt(rows[0].count);
          } catch (sqlError) {
            console.error("Error counting with SQL:", sqlError);
          }
        }
        
        console.log(`Found ${existingQuestions} existing questions for study material ${studyMaterialId}`);
        
        // Only store if no questions exist
        if (existingQuestions === 0) {
          console.log("Storing true/false questions with studyMaterialId:", studyMaterialId);
          await storeGeneratedQuestions(studyMaterialId, [{ id: itemId, term: cleanedTerm, definition }], questions, normalizedGameMode);
        } else {
          console.log(`Questions already exist for study material ${studyMaterialId}, skipping storage`);
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
      console.log("Received multiple choice question request with body:", req.body);
      const { term, definition, numberOfItems = 1, studyMaterialId, itemId, gameMode = "peaceful" } = req.body;
      
      // Normalize the game mode
      let normalizedGameMode = gameMode ? gameMode.toLowerCase().replace(/\s+/g, '-') : "peaceful";
      if (normalizedGameMode === "time-pressured" || normalizedGameMode === "time-pressure") {
        normalizedGameMode = "time-pressured";
      }
      
      console.log("Game mode for multiple choice question:", {
        original: gameMode,
        normalized: normalizedGameMode
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
        questions = questions.map(q => {
          // Ensure the question has the correct type
          q.type = "multiple-choice";
          
          // Clean up options - remove any "similar to..." text
          if (q.options) {
            Object.keys(q.options).forEach(key => {
              // Remove any text like "similar to..." from options
              q.options[key] = q.options[key]
                .replace(/similar to .+/i, '')
                .replace(/\(.+\)/g, '')
                .trim();
            });
          }
          
          return q;
        });

        // After generating and validating questions, store them if studyMaterialId is provided
        if (studyMaterialId) {
          console.log("Checking if questions already exist before storing...");
          
          // Check if questions already exist for this study material
          let existingQuestions = 0;
          try {
            // First try with Objection.js
            const result = await GeneratedMaterial.query()
              .where('study_material_id', studyMaterialId)
              .count('* as count')
              .first();
            
            existingQuestions = result ? parseInt(result.count) : 0;
          } catch (countError) {
            console.error("Error counting existing questions:", countError);
            
            // Try with direct SQL
            try {
              const { pool } = await import('../config/db.js');
              const [rows] = await pool.query(
                'SELECT COUNT(*) as count FROM generated_material WHERE study_material_id = ?', 
                [studyMaterialId]
              );
              existingQuestions = parseInt(rows[0].count);
            } catch (sqlError) {
              console.error("Error counting with SQL:", sqlError);
            }
          }
          
          console.log(`Found ${existingQuestions} existing questions for study material ${studyMaterialId}`);
          
          // Only store if no questions exist
          if (existingQuestions === 0) {
            console.log("Storing questions with studyMaterialId:", studyMaterialId);
            try {
              await storeGeneratedQuestions(studyMaterialId, [{ id: itemId, term: cleanedTerm, definition }], questions, normalizedGameMode);
              console.log("Successfully stored questions");
            } catch (storeError) {
              console.error("Error storing questions:", storeError);
              // Continue with the response even if storage fails
            }
          } else {
            console.log(`Questions already exist for study material ${studyMaterialId}, skipping storage`);
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
        body: req.body
      });
      res.status(500).json({
        error: "Failed to generate multiple choice questions",
        details: error.message,
        stack: error.stack
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
        items
      } = req.body;

      // Normalize the game mode to ensure consistent format
      // Convert to lowercase and replace spaces with hyphens for consistency
      let gameMode = mode ? mode.toLowerCase().replace(/\s+/g, '-') : "peaceful";
      
      // Special handling for "Time Pressured" mode
      if (gameMode === "time-pressured" || gameMode === "time-pressure") {
        gameMode = "time-pressured";
      } else if (gameMode === "peaceful") {
        gameMode = "peaceful";
      }

      console.log("Game mode normalization:", {
        original: mode,
        normalized: gameMode
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
        itemsCount: items?.length || 0
      });

      if (!studyMaterialId) {
        console.error("Missing studyMaterialId in request");
        return res.status(400).json({ 
          success: false,
          error: "Missing studyMaterialId" 
        });
      }

      // Check if we have questions to store
      if (Array.isArray(questions) && questions.length > 0) {
        console.log(`Processing ${questions.length} questions for storage`);
        
        // Always store questions, even if they have itemInfo property
        console.log(`Storing questions to ensure they're updated with each session`);
        
        // Get the material items from the database or use the ones provided
        const providedItems = items || [];
        console.log(`Using ${providedItems.length} provided items`);
        
        // If we don't have items but have questions, create dummy items from the questions
        const processedItems = providedItems.length > 0 ? providedItems : questions.map((q, index) => {
          const item = {
            id: index + 1,
            term: q.correctAnswer || q.answer,
            definition: q.question
          };
          console.log(`Created dummy item ${index + 1}:`, item);
          return item;
        });
        
        console.log(`Processed ${processedItems.length} items for storage`);
        
        // Filter out duplicate questions (same term and question type)
        const uniqueQuestions = [];
        const seenKeys = new Set(); // Track unique term + question_type combinations
        
        console.log("Filtering questions to ensure uniqueness...");
        
        for (const question of questions) {
          const term = question.itemInfo?.term || 
                      (question.correctAnswer || question.answer);
          const questionType = question.type || question.questionType;
          
          // Create a unique key for this term and question type
          const key = `${term}:${questionType}`;
          
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueQuestions.push(question);
            console.log(`✓ Added question for term "${term}" of type ${questionType}`);
          } else {
            console.log(`✗ Filtering out duplicate question for term "${term}" of type ${questionType}`);
          }
        }
        
        console.log(`Filtered questions: ${questions.length} -> ${uniqueQuestions.length}`);
        console.log(`Unique term+type combinations: ${seenKeys.size}`);
        
        // Store the questions
        try {
          console.log("Calling storeGeneratedQuestions with:", {
            studyMaterialId,
            processedItemsCount: processedItems.length,
            questionsCount: uniqueQuestions.length,
            gameMode
          });
          
          await storeGeneratedQuestions(studyMaterialId, processedItems, uniqueQuestions, gameMode);
          console.log(`Successfully stored ${uniqueQuestions.length} questions for study material ${studyMaterialId} with game mode ${gameMode}`);
        } catch (storeError) {
          console.error("Error storing questions from session results:", storeError);
          console.error("Error details:", {
            message: storeError.message,
            stack: storeError.stack
          });
        }
      } else {
        console.log("No questions to store in session results");
      }

      // Here you could also save other session statistics to a different table if needed
      console.log("=== SAVE SESSION RESULTS - COMPLETE ===");
      res.status(200).json({
        success: true,
        message: "Session results saved successfully",
        studyMaterialId
      });
    } catch (error) {
      console.error("=== SAVE SESSION RESULTS - ERROR ===");
      console.error("Error saving session results:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        error: "Failed to save session results",
        details: error.message
      });
    }
  },

  // Function to clear all questions for a study material
  clearQuestions: async (req, res) => {
    try {
      console.log("=== CLEAR QUESTIONS - START ===");
      const { studyMaterialId } = req.params;
      
      if (!studyMaterialId) {
        console.error("Missing studyMaterialId in request");
        return res.status(400).json({ 
          success: false,
          error: "Missing studyMaterialId" 
        });
      }
      
      console.log(`Clearing all questions for study material ${studyMaterialId}`);
      
      // Try with Objection.js first
      try {
        const deleteResult = await GeneratedMaterial.query()
          .delete()
          .where('study_material_id', studyMaterialId);
        
        console.log("Delete result:", deleteResult);
        
        console.log(`Successfully cleared questions for study material ${studyMaterialId}`);
        console.log("=== CLEAR QUESTIONS - COMPLETE ===");
        
        return res.status(200).json({
          success: true,
          message: `Successfully cleared questions for study material ${studyMaterialId}`,
          count: deleteResult
        });
      } catch (objectionError) {
        console.error("Error clearing questions with Objection.js:", objectionError);
        
        // Try with direct SQL
        try {
          const { pool } = await import('../config/db.js');
          
          const deleteQuery = `DELETE FROM generated_material WHERE study_material_id = ?`;
          const [deleteResult] = await pool.execute(deleteQuery, [studyMaterialId]);
          
          console.log("SQL Delete result:", deleteResult);
          console.log(`Successfully cleared questions for study material ${studyMaterialId} using SQL`);
          console.log("=== CLEAR QUESTIONS - COMPLETE ===");
          
          return res.status(200).json({
            success: true,
            message: `Successfully cleared questions for study material ${studyMaterialId}`,
            count: deleteResult.affectedRows
          });
        } catch (sqlError) {
          console.error("Error clearing questions with SQL:", sqlError);
          throw sqlError;
        }
      }
    } catch (error) {
      console.error("=== CLEAR QUESTIONS - ERROR ===");
      console.error("Error clearing questions:", error);
      
      return res.status(500).json({
        success: false,
        error: "Failed to clear questions",
        details: error.message
      });
    }
  }
};

export default OpenAIController;