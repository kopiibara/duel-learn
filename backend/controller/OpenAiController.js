import { OpenAI } from "openai";
import dotenv from "dotenv";
import GeneratedMaterial from "../models/GeneratedMaterial.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add this at the top of the file, after the openai initialization
let answerDistribution = { A: 0, B: 0, C: 0, D: 0 };
let trueFalseDistribution = { True: 0, False: 0 };

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

    // If we got here, try to look up all items for this study material to see what's available
    const [allItems] = await pool.query(
      `SELECT item_id, item_number, term FROM study_material_content 
       WHERE study_material_id = ? 
       LIMIT 20`,
      [studyMaterialId]
    );

    if (allItems && allItems.length > 0) {
      console.log(
        `Found ${allItems.length} total items for study material ${studyMaterialId}:`
      );
      allItems.forEach((item) => {
        console.log(
          `- Item ${item.item_number}: ID=${item.item_id}, Term="${item.term}"`
        );
      });

      // Try to find a match by position/index
      if (itemNumber && itemNumber <= allItems.length) {
        const indexMatch = allItems[itemNumber - 1];
        console.log(
          `Using item at position ${itemNumber}: ID=${indexMatch.item_id}, Term="${indexMatch.term}"`
        );
        return {
          itemId: indexMatch.item_id,
          itemNumber: indexMatch.item_number,
        };
      }
    } else {
      console.log(
        `No items found at all for study material ${studyMaterialId}`
      );
    }

    // Log failure and return null if no match found
    console.warn(
      `❌ NO MATCHING CONTENT FOUND in study_material_content for "${term}" or item_number ${itemNumber}`
    );

    // Fallback to using the itemNumber as the ID if all else fails
    console.log(`FALLBACK: Using item_number ${itemNumber} as item_id`);
    return {
      itemId: itemNumber.toString(),
      itemNumber: itemNumber,
    };
  } catch (error) {
    console.error("Error fetching item_id from study_material_content:", error);
    // Fallback to using the itemNumber as the ID
    return {
      itemId: itemNumber?.toString() || "0",
      itemNumber: itemNumber || 0,
    };
  }
};

// Helper function to store generated questions in the database
const storeGeneratedQuestions = async (
  studyMaterialId,
  itemId,
  itemNumber,
  term,
  definition,
  question,
  gameMode = "peaceful"
) => {
  console.log("=== STORING GENERATED QUESTION ===");
  console.log(`Study Material ID: ${studyMaterialId}`);
  console.log(`Item ID: ${itemId}, Item Number: ${itemNumber}`);
  console.log(`Term: ${term}, Definition: ${definition}`);
  console.log(`Question Type: ${question.type || question.questionType}`);
  console.log(`Game Mode: ${gameMode}`);

  const normalizedGameMode = gameMode.toLowerCase().trim();

  try {
    const { pool } = await import("../config/db.js");

    // Determine the question type
    const questionType = question.type || question.questionType;

    // First delete any existing question for this study material, item, and question type
    const deleteQuery = `
      DELETE FROM generated_material 
      WHERE study_material_id = ? 
      AND item_id = ? 
      AND item_number = ? 
      AND question_type = ? 
      AND game_mode = ?
    `;

    const deleteParams = [
      studyMaterialId,
      itemId,
      itemNumber,
      questionType,
      normalizedGameMode,
    ];

    // Execute the delete to remove any existing questions
    const [deleteResult] = await pool.query(deleteQuery, deleteParams);
    if (deleteResult.affectedRows > 0) {
      console.log(
        `Deleted ${deleteResult.affectedRows} existing ${questionType} questions for study material ID ${studyMaterialId}, item ID ${itemId}`
      );
    }

    // Process question data based on type
    let questionText = question.question;
    let choicesJSON = null;
    let answer = question.answer || question.correctAnswer;

    // Handle choices for multiple-choice questions
    if (
      (questionType === "multiple-choice" ||
        questionType === "Multiple Choice") &&
      question.options
    ) {
      choicesJSON = JSON.stringify(question.options);
    }

    // Insert the question
    const insertQuery = `
      INSERT INTO generated_material 
      (study_material_id, item_id, item_number, term, definition, 
       question_type, question, answer, choices, game_mode) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      studyMaterialId,
      itemId,
      itemNumber,
      term,
      definition,
      questionType,
      questionText,
      answer,
      choicesJSON,
      normalizedGameMode,
    ];

    console.log("Inserting question with values:", values);

    const [result] = await pool.query(insertQuery, values);
    console.log(`✅ Question stored successfully, ID: ${result.insertId}`);

    return true;
  } catch (error) {
    console.error("Error in storeGeneratedQuestions:", error);
    throw error;
  }
};

// Update the clearQuestionsForMaterial function
const clearQuestionsForMaterial = async (studyMaterialId, gameMode) => {
  try {
    const { pool } = await import("../config/db.js");

    console.log(
      `Clearing existing questions for study material ${studyMaterialId} and game mode ${gameMode}`
    );

    const [existingQuestions] = await pool.query(
      "SELECT id, item_number FROM generated_material WHERE study_material_id = ? AND game_mode = ?",
      [studyMaterialId, gameMode]
    );

    if (existingQuestions.length > 0) {
      const deleteQuery = `
        DELETE FROM generated_material 
        WHERE study_material_id = ? AND game_mode = ?
      `;

      const [result] = await pool.execute(deleteQuery, [
        studyMaterialId,
        gameMode,
      ]);
      console.log(`Cleared ${result.affectedRows} existing questions`);
    }

    return true;
  } catch (error) {
    console.error("Error clearing questions:", error);
    throw error;
  }
};

// Add this helper function at the top of the file
const getBalancedAnswerPosition = (currentDistribution, totalQuestions) => {
  // Initialize distribution if not provided
  const distribution = currentDistribution || { A: 0, B: 0, C: 0, D: 0 };

  // Calculate target distribution (roughly equal)
  const targetPerOption = Math.ceil(totalQuestions / 4);

  // Get available options that haven't exceeded target distribution
  const availableOptions = Object.entries(distribution)
    .filter(([_, count]) => count < targetPerOption)
    .map(([letter]) => letter);

  // If no available options, reset distribution
  if (availableOptions.length === 0) {
    return ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];
  }

  // Randomly select from available options
  return availableOptions[Math.floor(Math.random() * availableOptions.length)];
};

// Add this helper function near getBalancedAnswerPosition
const getBalancedTrueFalseAnswer = (currentDistribution, totalQuestions) => {
  // Initialize distribution if not provided
  const distribution = currentDistribution || { True: 0, False: 0 };

  // Calculate target distribution (roughly equal)
  const targetPerOption = Math.ceil(totalQuestions / 2);

  // Get available options that haven't exceeded target distribution
  const availableOptions = Object.entries(distribution)
    .filter(([_, count]) => count < targetPerOption)
    .map(([answer]) => answer);

  // If no available options, reset distribution and pick randomly
  if (availableOptions.length === 0) {
    return Math.random() < 0.5 ? "True" : "False";
  }

  // Randomly select from available options
  return availableOptions[Math.floor(Math.random() * availableOptions.length)];
};

// Helper functions for question generation
const generateTrueFalseQuestionHelper = async (term, definition, context) => {
  try {
    const prompt = `
      Create a true/false question about the following term and its definition:
      Term: ${term}
      Definition: ${definition}

      Requirements:
      1. The question must incorporate both the term AND its definition
      2. If creating a false statement, modify the relationship between the term and definition
      3. Make the question challenging but clear
      4. Ensure the question tests understanding of both the term and its meaning
      5. Avoid overly simple questions that only test the term without its definition

      Format:
      Return a JSON object with:
      {
        "question": "your question here",
        "answer": "True" or "False",
        "explanation": "brief explanation of why the answer is true or false"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI that generates educational true/false questions. Always return valid JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const response = completion.choices[0].message.content;
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Invalid response format from OpenAI");
    }

    // Validate the response has required fields
    if (!parsedResponse.question || !parsedResponse.answer) {
      throw new Error("Missing required fields in OpenAI response");
    }

    return {
      success: true,
      data: {
        type: "true-false",
        questionType: "true-false",
        question: parsedResponse.question,
        answer: parsedResponse.answer,
        correctAnswer: parsedResponse.answer,
        explanation: parsedResponse.explanation || ""
      }
    };
  } catch (error) {
    console.error("Error generating true/false question:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

const generateMultipleChoiceQuestionHelper = async (term, definition, context) => {
  try {
    const prompt = `
      Create a multiple-choice question about the following term and its definition:
      Term: ${term}
      Definition: ${definition}

      Requirements:
      1. The question must test understanding of the definition by asking which term it defines
      2. The question should be in the format: "Which term is defined as [definition]?"
      3. Generate EXACTLY 3 plausible but incorrect terms that are similar to "${term}" in length and style
      4. The term "${term}" MUST be one of the choices and MUST be the correct answer
      5. The incorrect options should be similar enough to create doubt but clearly wrong
      6. Do not create new terms that aren't related to the subject matter

      Format:
      Return a JSON object with:
      {
        "question": "Which term is defined as [definition]?",
        "options": ["${term}", "incorrect1", "incorrect2", "incorrect3"],
        "correctAnswer": "${term}",
        "explanation": "brief explanation of why this is the correct answer"
      }

      Note: The options array MUST include "${term}" as one of the choices, and it MUST be the correct answer.
      The other options should be similar to "${term}" in style and length to make them plausible distractors.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI that generates educational multiple-choice questions. Always return valid JSON. Always include the exact term as one of the options and as the correct answer."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Invalid response format from OpenAI");
    }

    // Validate the response has required fields
    if (!parsedResponse.question || !parsedResponse.options || !parsedResponse.correctAnswer) {
      throw new Error("Missing required fields in OpenAI response");
    }

    // Validate options array
    if (!Array.isArray(parsedResponse.options) || parsedResponse.options.length !== 4) {
      throw new Error("Invalid options format in OpenAI response");
    }

    // Validate that the term is included in the options and is the correct answer
    if (!parsedResponse.options.includes(term)) {
      console.log("Term not found in options, fixing the options array");
      // Replace a random option with the term if it's not included
      const randomIndex = Math.floor(Math.random() * 4);
      parsedResponse.options[randomIndex] = term;
    }

    // Ensure the correct answer is the term
    parsedResponse.correctAnswer = term;

    // Shuffle the options to randomize the position of the correct answer
    const shuffledOptions = [...parsedResponse.options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    return {
      success: true,
      data: {
        type: "multiple-choice",
        questionType: "multiple-choice",
        question: parsedResponse.question,
        options: shuffledOptions,
        answer: term,
        correctAnswer: term,
        explanation: parsedResponse.explanation || ""
      }
    };
  } catch (error) {
    console.error("Error generating multiple-choice question:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

const generateIdentificationQuestionHelper = async (term, definition, context) => {
  try {
    const prompt = `
      Create an identification question about the following term and its definition:
      Term: ${term}
      Definition: ${definition}

      Requirements:
      1. The question must test understanding of both the term AND its definition
      2. Make the question clear and specific
      3. Ensure the answer can be derived from understanding the term and definition
      4. The answer should be the term itself

      Format:
      Return a JSON object with:
      {
        "question": "your question here",
        "answer": "${term}",
        "explanation": "brief explanation of why this is the correct answer"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI that generates educational identification questions. Always return valid JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const response = completion.choices[0].message.content;
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Invalid response format from OpenAI");
    }

    // Validate the response has required fields
    if (!parsedResponse.question || !parsedResponse.answer) {
      throw new Error("Missing required fields in OpenAI response");
    }

    return {
      success: true,
      data: {
        type: "identification",
        questionType: "identification",
        question: parsedResponse.question,
        answer: parsedResponse.answer,
        correctAnswer: parsedResponse.answer,
        explanation: parsedResponse.explanation || ""
      }
    };
  } catch (error) {
    console.error("Error generating identification question:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Route handlers that use the helper functions
const generateTrueFalse = async (req, res) => {
  try {
    const { term, definition } = req.body;
    const result = await generateTrueFalseQuestionHelper(term, definition, req.body);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const generateMultipleChoice = async (req, res) => {
  try {
    const { term, definition } = req.body;
    const result = await generateMultipleChoiceQuestionHelper(term, definition, req.body);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const generateIdentification = async (req, res) => {
  try {
    const { term, definition } = req.body;
    const result = await generateIdentificationQuestionHelper(term, definition, req.body);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
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

  generateTrueFalse,
  generateMultipleChoice,
  generateIdentification,

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
          error: "Game mode is required",
        });
      }

      // Normalize game mode to lowercase for consistent storage
      const normalizedGameMode = gameMode.toLowerCase().trim();

      console.log(
        `Clearing questions for study material ${studyMaterialId} in ${normalizedGameMode} mode`
      );

      // Use direct database connection with the pool
      const { pool } = await import("../config/db.js");

      // Get count of existing questions first
      const [countResult] = await pool.query(
        "SELECT COUNT(*) as count FROM generated_material WHERE study_material_id = ? AND game_mode = ?",
        [studyMaterialId, normalizedGameMode]
      );

      const questionCount = countResult[0]?.count || 0;
      console.log(`Found ${questionCount} questions to delete`);

      // Delete questions for specific study material AND game mode
      const [deleteResult] = await pool.query(
        "DELETE FROM generated_material WHERE study_material_id = ? AND game_mode = ?",
        [studyMaterialId, normalizedGameMode]
      );

      console.log(
        `Cleared ${deleteResult.affectedRows} questions for ${normalizedGameMode} mode`
      );

      return res.json({
        success: true,
        message: `Successfully cleared questions for study material ${studyMaterialId}`,
        count: deleteResult.affectedRows,
      });
    } catch (error) {
      console.error("Error clearing questions:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to clear questions",
        details: error.message,
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

  // Helper functions for direct calls
  generateTrueFalseQuestion: generateTrueFalseQuestionHelper,
  generateMultipleChoiceQuestion: generateMultipleChoiceQuestionHelper,
  generateIdentificationQuestion: generateIdentificationQuestionHelper
};
