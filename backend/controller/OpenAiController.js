import { OpenAI } from "openai";
import dotenv from "dotenv";
import GeneratedMaterial from '../models/GeneratedMaterial.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Updated helper function to fetch item_id from study_material_content with corrected column names
const getItemIdFromStudyMaterial = async (studyMaterialId, term, itemNumber) => {
  try {
    const { pool } = await import('../config/db.js');
    
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
      console.log(`✓ EXACT MATCH: Found item_id ${exactTermResults[0].item_id} for term "${term}" in study_material_content`);
      return {
        itemId: exactTermResults[0].item_id,
        itemNumber: exactTermResults[0].item_number
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
      console.log(`✓ CASE-INSENSITIVE MATCH: Found item_id ${caseInsensitiveResults[0].item_id} for term "${term}"`);
      return {
        itemId: caseInsensitiveResults[0].item_id,
        itemNumber: caseInsensitiveResults[0].item_number
      };
    }
    
    // If no match by term, try by item_number
    if (itemNumber) {
      console.log(`No term match for "${term}", trying to match by item_number ${itemNumber}`);
      const [numResults] = await pool.query(
        `SELECT item_id, term FROM study_material_content 
         WHERE study_material_id = ? AND item_number = ? 
         LIMIT 1`,
        [studyMaterialId, itemNumber]
      );
      
      if (numResults && numResults.length > 0) {
        console.log(`✓ ITEM NUMBER MATCH: Found item_id ${numResults[0].item_id} for item_number ${itemNumber}`);
        return {
          itemId: numResults[0].item_id,
          itemNumber: itemNumber
        };
      }
    }
    
    // Log failure and return null if no match found
    console.warn(`❌ NO MATCHING CONTENT FOUND in study_material_content for "${term}" or item_number ${itemNumber}`);
    return null;
  } catch (error) {
    console.error("Error fetching item_id from study_material_content:", error);
    return null;
  }
};

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
    const termToItemNumber = new Map(); // Map to track item_number for each term
    
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
    
    // Add counters for each question type
    const questionTypeCounts = {
      'multiple-choice': 0,
      'identification': 0,
      'true-false': 0,
      'other': 0
    };
    
    // Process each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // Extract item from itemInfo if available
      let item;
      if (question.itemInfo) {
        console.log(`Question ${i+1} has itemInfo property:`, question.itemInfo);
        // Try to match this item with one in the items array
        const matchingItem = items.find(it => it.term === question.itemInfo.term);
        
        if (matchingItem) {
          console.log(`Found matching item for ${question.itemInfo.term}`);
          item = matchingItem;
        } else {
          // Use the itemInfo directly if no match found
          console.log(`Creating item from itemInfo for ${question.itemInfo.term}`);
          item = {
            id: question.itemInfo.itemId || i + 1,
            term: question.itemInfo.term,
            definition: question.itemInfo.definition
          };
        }
      } else {
        // Use the corresponding item from items array
        item = items[i % items.length];
        console.log(`Using item at index ${i % items.length} for question ${i+1}`);
      }
      
      // Ensure item is valid
      if (!item || !item.term) {
        console.error(`Invalid item for question ${i+1}:`, item);
        console.error(`Creating dummy item for question ${i+1}`);
        
        // Create a dummy item from the question
        item = {
          id: i + 1,
          term: question.answer || question.correctAnswer || `Item ${i+1}`,
          definition: question.question || `Definition ${i+1}`
        };
      }
      
      // Get the item_number for this term, or use the index + 1 if not found
      let itemNumber = termToItemNumber.get(item.term) || (i + 1);
      
      // Fetch the actual item_id from study_material_content table with enhanced debugging
      console.log(`\nLooking up content for question ${i+1} with term "${item.term}"`);
      const contentItem = await getItemIdFromStudyMaterial(studyMaterialId, item.term, itemNumber);
      let actualItemId, actualItemNumber;
      
      if (contentItem && contentItem.itemId) {
        actualItemId = contentItem.itemId; // Keep as string, don't parse
        actualItemNumber = contentItem.itemNumber;
        console.log(`✅ SUCCESS: Using actual item_id ${actualItemId} (type: ${typeof actualItemId}) from study_material_content for term "${item.term}"`);
      } else {
        // If lookup fails, make one more attempt with a cleaned version of the term
        const cleanedTerm = item.term.trim().replace(/^[A-Z]\.\s+/, ''); // Remove letter prefixes like "A. "
        if (cleanedTerm !== item.term) {
          console.log(`Trying again with cleaned term: "${cleanedTerm}"`);
          const cleanedContentItem = await getItemIdFromStudyMaterial(studyMaterialId, cleanedTerm, itemNumber);
          
          if (cleanedContentItem && cleanedContentItem.itemId) {
            actualItemId = cleanedContentItem.itemId; // Keep as string
            actualItemNumber = cleanedContentItem.itemNumber;
            console.log(`✅ SUCCESS with cleaned term: Using item_id ${actualItemId} (type: ${typeof actualItemId}) for "${cleanedTerm}"`);
          } else {
            console.warn(`❌ FAILURE: Couldn't find item_id in study_material_content for either "${item.term}" or "${cleanedTerm}"`);
            actualItemId = item.id || String(i + 1); // Ensure string format even for fallback
            actualItemNumber = itemNumber;
          }
        } else {
          console.warn(`❌ FAILURE: Couldn't find item_id in study_material_content for term "${item.term}"`);
          actualItemId = item.id || String(i + 1); // Ensure string format even for fallback
          actualItemNumber = itemNumber;
        }
      }
      
      // Normalize question type - ensure we have consistent field names
      let questionType = '';
      
      // Check for multiple fields that could indicate the question type
      if (question.type) {
        questionType = question.type;
      } else if (question.questionType) {
        questionType = question.questionType;
      } else if (question.question_type) {
        questionType = question.question_type;
      } else {
        // Try to infer the type from available properties
        if (question.options || (question.choices && !Array.isArray(question.choices))) {
          questionType = 'multiple-choice';
        } else if (question.answer === 'true' || question.answer === 'false' || 
                   question.answer === 'True' || question.answer === 'False') {
          questionType = 'true-false';
        } else {
          questionType = 'identification'; // Default to identification if can't determine
        }
      }
      
      // Normalize to our standard types
      if (questionType.includes('multiple') || questionType.includes('choice')) {
        questionType = 'multiple-choice';
      } else if (questionType.includes('true') || questionType.includes('false')) {
        questionType = 'true-false';
      } else if (questionType.includes('identification') || questionType.includes('identify')) {
        questionType = 'identification';
      }
      
      // Ensure question has normalized type properties for consistency
      question.type = questionType;
      question.questionType = questionType;
      question.question_type = questionType;
      
      console.log(`\n[Question ${i+1}/${questions.length}] Processing question of type "${questionType}" for term "${item.term}"`);
      
      // Get the correct answer field based on question type
      let answer = '';
      if (question.answer) {
        answer = question.answer;
      } else if (question.correctAnswer) {
        answer = question.correctAnswer;
      } else {
        console.warn(`⚠️ Question ${i+1} has no answer field! Using term as fallback.`);
        answer = item.term;
      }
      
      // For multiple choice, clean up the answer (remove the prefix letter if any)
      if (questionType === 'multiple-choice' && answer.match(/^[A-D]\.\s+/)) {
        answer = answer.replace(/^[A-D]\.\s+/, '');
      }
      
      console.log(`- Term: "${item.term}"`);
      console.log(`- Question: "${question.question?.substring(0, 50)}..."`);
      console.log(`- Answer: "${answer}"`);
      
      // Create a unique key for this question type and term
      const questionTypeKey = `${item.term}-${questionType}`;
      
      // Skip if we've already processed this exact question type for this term
      if (usedItemNumbers.has(questionTypeKey)) {
        console.log(`Skipping duplicate question for term "${item.term}" of type ${questionType}`);
        continue;
      }
      
      // Mark this question as processed
      usedItemNumbers.set(questionTypeKey, itemNumber);
      
      console.log(`Using item_number ${actualItemNumber} and item_id ${actualItemId} for term "${item.term}" of type ${questionType}`);
      
      try {
        // Use direct SQL with REPLACE INTO to ensure uniqueness
        const { pool } = await import('../config/db.js');
        
        // Process choices for multiple-choice questions
        let choicesJSON = null;
        if (questionType === 'multiple-choice') {
          if (question.options) {
            choicesJSON = JSON.stringify(question.options);
          } else if (question.choices) {
            choicesJSON = typeof question.choices === 'string' ? question.choices : JSON.stringify(question.choices);
          }
        }
        
        // Prepare the question data
        const questionData = {
          study_material_id: studyMaterialId,
          item_id: actualItemId,
          item_number: actualItemNumber,
          term: String(item.term),
          definition: String(item.definition),
          question_type: String(questionType),
          question: String(question.question || ''),
          answer: String(answer),
          choices: choicesJSON,
          game_mode: normalizedGameMode
        };
        
        console.log(`About to store question with: 
          - study_material_id: ${questionData.study_material_id}
          - item_id: ${questionData.item_id}
          - item_number: ${questionData.item_number}
          - term: ${questionData.term}
          - question_type: ${questionData.question_type}
          - game_mode: ${questionData.game_mode}
          - choices: ${questionData.choices ? 'set' : 'null'}`);
        
        // Try INSERT IGNORE first in case REPLACE is causing issues
        const insertQuery = `
          INSERT IGNORE INTO generated_material 
          (study_material_id, item_id, item_number, term, definition, question_type, question, answer, choices, game_mode) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const insertValues = [
          questionData.study_material_id,
          questionData.item_id,
          questionData.item_number,
          questionData.term,
          questionData.definition,
          questionData.question_type,
          questionData.question,
          questionData.answer,
          questionData.choices,
          normalizedGameMode
        ];
        
        console.log(`Executing SQL INSERT for ${questionData.question_type} question...`);
        
        try {
          const [insertResult] = await pool.execute(insertQuery, insertValues);
          console.log(`SQL Insert result for ${questionData.question_type}:`, insertResult);
          
          // If insert did not affect any rows, try direct update
          if (insertResult.affectedRows === 0) {
            console.log(`Insert didn't affect rows, trying update...`);
            
            const updateQuery = `
              UPDATE generated_material 
              SET 
                item_id = ?,
                item_number = ?,
                definition = ?,
                question = ?,
                answer = ?,
                choices = ?
              WHERE 
                study_material_id = ? AND 
                term = ? AND 
                question_type = ? AND 
                game_mode = ?
            `;
            
            const updateValues = [
              questionData.item_id,
              itemNumber,
              questionData.definition,
              questionData.question,
              questionData.answer,
              questionData.choices,
              questionData.study_material_id,
              questionData.term,
              questionData.question_type,
              normalizedGameMode
            ];
            
            const [updateResult] = await pool.execute(updateQuery, updateValues);
            console.log(`SQL Update result for ${questionData.question_type}:`, updateResult);
            
            if (updateResult.affectedRows > 0) {
              console.log(`✅ Updated ${questionData.question_type} question successfully`);
            } else {
              // If neither insert nor update worked, try a direct REPLACE
              console.log(`Update didn't affect rows, trying direct replace...`);
              
              const replaceQuery = `
                REPLACE INTO generated_material 
                (study_material_id, item_id, item_number, term, definition, question_type, question, answer, choices, game_mode) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              
              const [replaceResult] = await pool.execute(replaceQuery, insertValues);
              console.log(`SQL Replace result for ${questionData.question_type}:`, replaceResult);
              
              if (replaceResult.affectedRows > 0) {
                console.log(`✅ Replaced ${questionData.question_type} question successfully (ID: ${replaceResult.insertId})`);
              } else {
                console.error(`❌ All SQL operations failed for ${questionData.question_type} question!`);
              }
            }
          } else {
            console.log(`✅ Inserted ${questionData.question_type} question successfully (ID: ${insertResult.insertId})`);
          }
        } catch (sqlOpError) {
          console.error(`SQL operation error:`, sqlOpError);
          
          // Check for specific error codes
          if (sqlOpError.code === 'ER_DUP_ENTRY') {
            console.log(`Duplicate entry detected, trying direct UPDATE instead...`);
            
            // Try direct update as a fallback
            const updateQuery = `
              UPDATE generated_material 
              SET 
                item_id = ?,
                item_number = ?,
                definition = ?,
                question = ?,
                answer = ?,
                choices = ?
              WHERE 
                study_material_id = ? AND 
                term = ? AND 
                question_type = ? AND 
                game_mode = ?
            `;
            
            const updateValues = [
              questionData.item_id,
              itemNumber,
              questionData.definition,
              questionData.question,
              questionData.answer,
              questionData.choices,
              questionData.study_material_id,
              questionData.term,
              questionData.question_type,
              normalizedGameMode
            ];
            
            try {
              const [updateResult] = await pool.execute(updateQuery, updateValues);
              console.log(`SQL Update fallback result:`, updateResult);
              
              if (updateResult.affectedRows > 0) {
                console.log(`✅ Updated ${questionData.question_type} question successfully as fallback`);
              } else {
                throw new Error(`Update fallback failed too`);
              }
            } catch (updateError) {
              console.error(`Update fallback error:`, updateError);
              throw updateError;
            }       
          } else {
            throw sqlOpError;
          }
        }
        
        // Track successfully stored question types regardless of method
        if (questionType === 'multiple-choice') {
          questionTypeCounts['multiple-choice']++;
        } else if (questionType === 'identification') {
          questionTypeCounts['identification']++;
        } else if (questionType === 'true-false') {
          questionTypeCounts['true-false']++;
        } else {
          questionTypeCounts['other']++;
        }
        
        // Verify the question was stored
        try {
          const [verifyRows] = await pool.query(
            'SELECT * FROM generated_material WHERE study_material_id = ? AND term = ? AND question_type = ? AND game_mode = ? LIMIT 1',
            [questionData.study_material_id, questionData.term, questionData.question_type, normalizedGameMode]
          );
          
          if (verifyRows && verifyRows.length > 0) {
            console.log(`✅ Successfully verified ${questionData.question_type} question was stored. ID: ${verifyRows[0].id}`);
            console.log(`Stored row:`, verifyRows[0]);
          } else {
            console.warn(`⚠️ Could not verify ${questionData.question_type} question was stored!`);
            
            // Try a broader search
            const [broadVerifyRows] = await pool.query(
              'SELECT * FROM generated_material WHERE study_material_id = ? LIMIT 10',
              [questionData.study_material_id]
            );
            
            console.log(`Broader search found ${broadVerifyRows?.length || 0} rows for this study material`);
            
            if (broadVerifyRows && broadVerifyRows.length > 0) {
              console.log(`First few rows from study material:`, broadVerifyRows.slice(0, 3));
            }
            
            // Check table structure
            const [columnsResult] = await pool.query('SHOW COLUMNS FROM generated_material');
            console.log(`Table structure verification:`, columnsResult.map(col => col.Field));
          }
        } catch (verifyError) {
          console.error(`Error verifying question storage:`, verifyError);
        }
      } catch (sqlError) {
        console.error(`Error with SQL operations:`, sqlError);
        console.error(`SQL Error Code:`, sqlError.code);
        console.error(`SQL Error Number:`, sqlError.errno);
        console.error(`SQL State:`, sqlError.sqlState);
        
        // Try with a direct approach - minimal query with only required fields
        try {
          console.log(`Trying minimal SQL approach...`);
          const { pool } = await import('../config/db.js');
          
          const minimalQuery = `
            INSERT INTO generated_material 
            (study_material_id, term, definition, question_type, question, answer, game_mode) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          const minimalValues = [
            studyMaterialId,
            item.term,
            item.definition,
            questionType,
            question.question || '',
            answer,
            normalizedGameMode
          ];
          
          const [minimalResult] = await pool.execute(minimalQuery, minimalValues);
          console.log(`Minimal SQL approach result:`, minimalResult);
          
          if (minimalResult.affectedRows > 0) {
            console.log(`✅ Minimal approach succeeded for ${questionType} question`);
            
            // Update counter
            if (questionType === 'multiple-choice') {
              questionTypeCounts['multiple-choice']++;
            } else if (questionType === 'identification') {
              questionTypeCounts['identification']++;
            } else if (questionType === 'true-false') {
              questionTypeCounts['true-false']++;
            } else {
              questionTypeCounts['other']++;
            }
          }
        } catch (minimalError) {
          console.error(`Even minimal approach failed:`, minimalError);
          
          // Try with Objection as ultimate fallback
          try {
            // Normalize the answer field
            let normalizedAnswer = question.answer || question.correctAnswer || item.term;
            
            // Prepare the question data
            const questionData = {
              study_material_id: studyMaterialId,
              item_id: item.id || String(itemNumber), // Keep as string, don't use parseInt
              item_number: itemNumber,
              term: String(item.term),
              definition: String(item.definition),
              question_type: String(questionType),
              question: String(question.question || ''),
              answer: String(normalizedAnswer),
              choices: questionType === 'multiple-choice' && question.options ? JSON.stringify(question.options) : null,
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
            
            // Update counter
            if (questionType === 'multiple-choice') {
              questionTypeCounts['multiple-choice']++;
            } else if (questionType === 'identification') {
              questionTypeCounts['identification']++;
            } else if (questionType === 'true-false') {
              questionTypeCounts['true-false']++;
            } else {
              questionTypeCounts['other']++;
            }
          } catch (objectionError) {
            console.error(`Error with Objection fallback:`, objectionError);
            // Continue with the next question even if this one fails
          }
        }
      }
    }
    
    // Enhanced log with question type breakdown
    console.log(`\n=== QUESTION STORAGE SUMMARY ===`);
    console.log(`Study Material ID: ${studyMaterialId}`);
    console.log(`Game Mode: ${normalizedGameMode}`);
    console.log(`Total questions processed: ${questions.length}`);
    console.log(`Question types stored:`);
    console.log(`- Multiple Choice: ${questionTypeCounts['multiple-choice']}`);
    console.log(`- Identification: ${questionTypeCounts['identification']}`);
    console.log(`- True/False: ${questionTypeCounts['true-false']}`);
    if (questionTypeCounts['other'] > 0) {
      console.log(`- Other/Unknown: ${questionTypeCounts['other']}`);
    }
    
    console.log(`Successfully stored ${questions.length} questions for study material ${studyMaterialId} with game mode ${normalizedGameMode}`);
    console.log("=== STORING GENERATED QUESTIONS - COMPLETE ===");

    // Add specific check for identification questions
    try {
      const { pool } = await import('../config/db.js');
      
      console.log("=== SPECIFIC IDENTIFICATION QUESTIONS CHECK ===");
      const [idQuestions] = await pool.query(
        "SELECT * FROM generated_material WHERE study_material_id = ? AND question_type = 'identification' AND game_mode = ?",
        [studyMaterialId, normalizedGameMode]
      );
      
      if (idQuestions && idQuestions.length > 0) {
        console.log(`Found ${idQuestions.length} identification questions in database`);
        console.log("First identification question:", idQuestions[0]);
      } else {
        console.error("❌ NO IDENTIFICATION QUESTIONS FOUND IN DATABASE!");
        
        // Try to explain why
        const [allQuestions] = await pool.query(
          "SELECT question_type, COUNT(*) as count FROM generated_material WHERE study_material_id = ? GROUP BY question_type",
          [studyMaterialId]
        );
        
        console.log("Questions by type in database:", allQuestions);
        
        // Check for question_type value issues
        const [valueCheck] = await pool.query(
          "SELECT DISTINCT question_type FROM generated_material"
        );
        
        console.log("All question types in database:", valueCheck.map(row => row.question_type));
        
        // Try a super permissive search
        const [fuzzySearch] = await pool.query(
          "SELECT * FROM generated_material WHERE study_material_id = ? AND question_type LIKE '%ident%'",
          [studyMaterialId]
        );
        
        if (fuzzySearch && fuzzySearch.length > 0) {
          console.log(`Found ${fuzzySearch.length} potential identification questions with fuzzy search`);
          console.log("First fuzzy match:", fuzzySearch[0]);
        }
      }
    } catch (checkError) {
      console.error("Error checking for identification questions:", checkError);
    }

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
      console.log("=== IDENTIFICATION QUESTION GENERATION - START ===");
      console.log("Received identification question request with body:", req.body);
      const { term, definition, studyMaterialId, itemId, itemNumber, gameMode = "peaceful" } = req.body;
      
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
      console.log("Cleaned term for identification:", cleanedTerm);

      // Create the identification question object with EXPLICIT question_type field
      const result = [
        {
          type: "identification",
          questionType: "identification",
          question_type: "identification", // Add this explicit field that matches DB column name
          question: definition,
          answer: cleanedTerm,
        },
      ];

      console.log("Generated identification question object:", JSON.stringify(result, null, 2));

      // Store the generated question if studyMaterialId is provided
      if (studyMaterialId) {
        console.log(`Direct DB insertion for identification question - material ${studyMaterialId}`);
        
        try {
          // Fetch the actual item_id from study_material_content with enhanced debugging
          console.log(`Looking up content for identification question with term "${cleanedTerm}"`);
          const contentItem = await getItemIdFromStudyMaterial(studyMaterialId, cleanedTerm, itemNumber);
          let actualItemId, actualItemNumber;
          
          if (contentItem && contentItem.itemId) {
            actualItemId = contentItem.itemId; // Keep as string
            actualItemNumber = contentItem.itemNumber;
            console.log(`✅ SUCCESS: Using actual item_id ${actualItemId} (type: ${typeof actualItemId}) from study_material_content for term "${cleanedTerm}"`);
          } else {
            console.warn(`❌ FAILURE: Couldn't find item_id in study_material_content for term "${cleanedTerm}"`);
            actualItemId = itemId || "1"; // Ensure string format
            actualItemNumber = itemNumber || 1;
          }
          
          console.log(`Using item_id ${actualItemId} and item_number ${actualItemNumber} for identification question`);
          
          // Direct database insertion to bypass any potential issues with storeGeneratedQuestions
          const { pool } = await import('../config/db.js');
          
          // Attempt direct SQL insertion
          const directInsertQuery = `
            INSERT INTO generated_material 
            (study_material_id, item_id, item_number, term, definition, question_type, question, answer, choices, game_mode) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
            ON DUPLICATE KEY UPDATE 
            question = VALUES(question),
            answer = VALUES(answer),
            updated_at = CURRENT_TIMESTAMP
          `;
          
          const insertParams = [
            studyMaterialId,
            actualItemId,
            actualItemNumber,
            cleanedTerm,
            definition,
            "identification", // Explicitly set as identification
            definition,
            cleanedTerm,
            normalizedGameMode
          ];
          
          console.log("Direct SQL insertion parameters:", insertParams);
          
          const [directInsertResult] = await pool.execute(directInsertQuery, insertParams);
          console.log("Direct insertion result:", directInsertResult);
          
          // Verify the question was actually stored
          const [verifyResult] = await pool.query(
            'SELECT * FROM generated_material WHERE study_material_id = ? AND term = ? AND question_type = ? ORDER BY id DESC LIMIT 1',
            [studyMaterialId, cleanedTerm, "identification"]
          );
          
          if (verifyResult && verifyResult.length > 0) {
            console.log("✅ IDENTIFICATION VERIFICATION SUCCESS - ID:", verifyResult[0].id);
            console.log(verifyResult[0]);
          } else {
            console.error("❌ IDENTIFICATION VERIFICATION FAILED - Question not found in database!");
          }
          
          // Also use the regular storage method as a backup
          const itemObject = { 
            id: itemId || 1, 
            term: cleanedTerm, 
            definition: definition 
          };
          
          await storeGeneratedQuestions(
            studyMaterialId, 
            [itemObject], 
            result, 
            normalizedGameMode
          );
        } catch (dbError) {
          console.error("DATABASE ERROR with identification question:", dbError);
          console.error("SQL Error Code:", dbError.code);
          console.error("SQL Error Number:", dbError.errno);
          console.error("SQL State:", dbError.sqlState);
        }
      } else {
        console.warn("No studyMaterialId provided, identification question will not be stored");
      }

      console.log("=== IDENTIFICATION QUESTION GENERATION - COMPLETE ===");
      res.json(result);
    } catch (error) {
      console.error("=== IDENTIFICATION QUESTION GENERATION - ERROR ===");
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
      const { term, definition, numberOfItems = 1, studyMaterialId, itemId, itemNumber, gameMode = "peaceful" } = req.body;
      
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
        console.log("Storing true/false questions with studyMaterialId:", studyMaterialId);
        try {
          // Check if this specific question type already exists for this material and mode
          const { pool } = await import('../config/db.js');
          const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM generated_material WHERE study_material_id = ? AND game_mode = ? AND question_type = ? AND term = ?', 
            [studyMaterialId, normalizedGameMode, "true-false", cleanedTerm]
          );
          
          const existingCount = parseInt(rows[0].count || '0');
          console.log(`Found ${existingCount} existing true-false questions for this term`);
          
          // Fetch the actual item_id from study_material_content with enhanced debugging
          console.log(`Looking up content for true/false question with term "${cleanedTerm}"`);
          const contentItem = await getItemIdFromStudyMaterial(studyMaterialId, cleanedTerm, itemNumber);
          let actualItemId, actualItemNumber;
          
          if (contentItem && contentItem.itemId) {
            actualItemId = contentItem.itemId; // Keep as string
            actualItemNumber = contentItem.itemNumber;
            console.log(`✅ SUCCESS: Using actual item_id ${actualItemId} (type: ${typeof actualItemId}) from study_material_content for term "${cleanedTerm}"`);
          } else {
            console.warn(`❌ FAILURE: Couldn't find item_id in study_material_content for term "${cleanedTerm}"`);
            actualItemId = itemId || String(1); // Ensure string format
            actualItemNumber = itemNumber || 1;
          }
          
          console.log(`Using item_id ${actualItemId} and item_number ${actualItemNumber} for true/false question`);
          
          // Always store the question, replacing if it exists
          await storeGeneratedQuestions(studyMaterialId, [{ 
            id: actualItemId, 
            term: cleanedTerm, 
            definition,
            item_number: actualItemNumber
          }], questions, normalizedGameMode);
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
      console.log("Received multiple choice question request with body:", req.body);
      const { term, definition, numberOfItems = 1, studyMaterialId, itemId, itemNumber, gameMode = "peaceful" } = req.body;
      
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
          console.log("Storing multiple choice questions with studyMaterialId:", studyMaterialId);
          try {
            // Check if this specific question type already exists for this material and mode
            const { pool } = await import('../config/db.js');
            const [rows] = await pool.query(
              'SELECT COUNT(*) as count FROM generated_material WHERE study_material_id = ? AND game_mode = ? AND question_type = ? AND term = ?', 
              [studyMaterialId, normalizedGameMode, "multiple-choice", cleanedTerm]
            );
            
            const existingCount = parseInt(rows[0].count || '0');
            console.log(`Found ${existingCount} existing multiple-choice questions for this term`);
            
            // Always store the question, replacing if it exists
            await storeGeneratedQuestions(studyMaterialId, [{ id: itemId, term: cleanedTerm, definition }], questions, normalizedGameMode);
            console.log("Successfully stored multiple choice questions");
          } catch (storeError) {
            console.error("Error storing multiple choice questions:", storeError);
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
        
        // Log question types to help with debugging
        const questionTypes = questions.map(q => q.type || q.questionType).filter(Boolean);
        const typeCounts = questionTypes.reduce((acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        
        console.log("Question types in payload:", typeCounts);
        
        // First declaration (keep this one)
        const identificationQuestions = questions.filter(q => 
          q.type === 'identification' || q.questionType === 'identification' || q.question_type === 'identification'
        );
        
        console.log(`Found ${identificationQuestions.length} identification questions in request`);
        if (identificationQuestions.length > 0) {
          console.log("Identification question samples:", identificationQuestions.map(q => ({
            type: q.type,
            questionType: q.questionType,
            question_type: q.question_type,
            term: q.itemInfo?.term || 'unknown',
            question: q.question,
            answer: q.answer || q.correctAnswer
          })));
        }

        // Create items from itemInfo if items are not provided
        const providedItems = items || [];
        const processedItems = providedItems.length > 0 ? providedItems : questions.map((q, index) => {
          // First try to get item from itemInfo
          if (q.itemInfo && q.itemInfo.term && q.itemInfo.definition) {
            console.log(`Creating item from question ${index+1} itemInfo:`, q.itemInfo);
            return {
              id: q.itemInfo.itemId || index + 1,
              term: q.itemInfo.term,
              definition: q.itemInfo.definition
            };
          } else {
            // Fall back to creating from question fields
            const item = {
              id: index + 1,
              term: q.correctAnswer || q.answer || `Item ${index+1}`,
              definition: q.question || `Definition ${index+1}`
            };
            console.log(`Created dummy item ${index+1}:`, item);
            return item;
          }
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
        
        // Right before calling storeGeneratedQuestions, check the items format
        console.log("Items before storage:", items.map(item => ({
          id: item.id,
          term: item.term,
          definition: item.definition
        })));
        
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

        // Change the second declaration to use a different variable name
        const identificationQuestionsForDebug = questions.filter(q => 
          q.type === 'identification' || q.questionType === 'identification'
        );

        if (identificationQuestionsForDebug.length > 0) {
          console.log("=== IDENTIFICATION QUESTION DEBUG ===");
          console.log(`Found ${identificationQuestionsForDebug.length} identification questions`);
          
          // For each identification question, try to store it directly
          for (let i = 0; i < identificationQuestionsForDebug.length; i++) {
            const q = identificationQuestionsForDebug[i];
            
            // Extract all relevant data
            const term = q.itemInfo?.term || q.correctAnswer || q.answer || 'Unknown Term';
            const definition = q.itemInfo?.definition || q.question || 'Unknown Definition';
            const question = q.question || 'Unknown Question';
            const answer = q.correctAnswer || q.answer || term;
            
            console.log(`Identification question ${i+1}:`);
            console.log(` - Term: ${term}`);
            console.log(` - Definition: ${definition}`);
            console.log(` - Question: ${question}`);
            console.log(` - Answer: ${answer}`);
            
            try {
              const { pool } = await import('../config/db.js');
              
              // Fetch the actual item_id from study_material_content with enhanced debugging
              console.log(`Looking up content for identification question ${i+1} with term "${term}"`);
              const contentItem = await getItemIdFromStudyMaterial(studyMaterialId, term, i + 1);
              let actualItemId, actualItemNumber;
              
              if (contentItem && contentItem.itemId) {
                actualItemId = contentItem.itemId; // Keep as string
                actualItemNumber = contentItem.itemNumber;
                console.log(`✅ SUCCESS: Using actual item_id ${actualItemId} (type: ${typeof actualItemId}) from study_material_content for term "${term}"`);
              } else {
                console.warn(`❌ FAILURE: Couldn't find item_id in study_material_content for term "${term}"`);
                actualItemId = q.itemInfo?.itemId || String(i + 1); // Use fallback but ensure it's not study_material_id
                actualItemNumber = q.itemInfo?.itemNumber || i + 1;
                
                // Make sure actualItemId isn't accidentally the study_material_id
                if (actualItemId === studyMaterialId) {
                  console.warn(`⚠️ Detected item_id same as study_material_id. Using fallback ID instead.`);
                  actualItemId = `item_${i + 1}`;
                }
              }
              
              console.log(`Using item_id ${actualItemId} and item_number ${actualItemNumber} for identification question ${i+1}`);
              
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
                'peaceful'
              ];
              
              console.log(`Executing direct insert for identification question ${i+1}...`);
              console.log(`Direct insert values:`, directInsertValues);
              
              try {
                const [directResult] = await pool.execute(directInsertQuery, directInsertValues);
                console.log(`Direct insertion result:`, directResult);
                
                if (directResult.affectedRows > 0) {
                  console.log(`✅ Successfully inserted identification question ${i+1} directly`);
                } else {
                  console.warn(`⚠️ Direct insertion affected 0 rows for identification question ${i+1}`);
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
                    term
                  ];
                  
                  const [updateResult] = await pool.execute(updateQuery, updateValues);
                  console.log(`Update result:`, updateResult);
                  
                  if (updateResult.affectedRows > 0) {
                    console.log(`✅ Successfully updated identification question ${i+1}`);
                  } else {
                    console.warn(`⚠️ Update affected 0 rows for identification question ${i+1}`);
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
                console.log(`✅ Verification found identification question in DB:`, verifyResult[0]);
              } else {
                console.error(`❌ Verification FAILED for identification question ${i+1}`);
              }
            } catch (manualError) {
              console.error(`Critical error with manual insertion:`, manualError);
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
      
      try {
        const { pool } = await import('../config/db.js');
        
        const deleteQuery = `DELETE FROM generated_material WHERE study_material_id = ?`;
        const [deleteResult] = await pool.execute(deleteQuery, [studyMaterialId]);
        
        console.log("SQL Delete result:", deleteResult);
        
        return res.status(200).json({
          success: true,
          message: `Successfully cleared questions for study material ${studyMaterialId}`,
          count: deleteResult.affectedRows
        });
      } catch (sqlError) {
        console.error("Error clearing questions with SQL:", sqlError);
        throw sqlError;
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
  },

  // Add this function to handle clearing generated questions
  clearGeneratedQuestions: async (req, res) => {
    try {
      const { studyMaterialId } = req.params;
      
      console.log("=== CLEAR GENERATED QUESTIONS - START ===");
      console.log("Study Material ID:", studyMaterialId);
      
      // Delete using both study_material_id and game_mode to ensure we clear the right questions
      const deleteQuery = `
        DELETE FROM generated_material 
        WHERE study_material_id = ? 
        AND game_mode = ?
      `;
      
      const [result] = await pool.query(deleteQuery, [studyMaterialId, 'peaceful']);
      
      console.log("Clear operation result:", result);
      
      res.json({ 
        success: true,
        message: 'Successfully cleared existing questions',
        affectedRows: result.affectedRows 
      });
    } catch (error) {
      console.error('=== CLEAR GENERATED QUESTIONS - ERROR ===');
      console.error('Error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to clear existing questions',
        details: error.message 
      });
    }
  },

  // Update the save function to handle duplicates
  saveGeneratedQuestion: async (studyMaterialId, itemId, itemNumber, term, definition, type, question, answer, gameMode) => {
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
        gameMode
      ]);

      return result;
    } catch (error) {
      console.error('Error saving generated question:', error);
      throw error;
    }
  }
};

export default OpenAIController;