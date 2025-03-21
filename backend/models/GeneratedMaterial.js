import { Model } from 'objection';

class GeneratedMaterial extends Model {
  static get tableName() {
    return 'generated_material';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['study_material_id', 'term', 'definition', 'question_type', 'question', 'answer'],

      properties: {
        id: { type: 'integer' },
        study_material_id: { type: 'string' },
        item_id: { type: ['integer', 'null'] },
        item_number: { type: ['integer', 'null'] },
        term: { type: 'string' },
        definition: { type: 'string' },
        image: { type: ['string', 'null'] },
        question_type: { type: 'string' },
        question: { type: 'string' },
        answer: { type: 'string' },
        choices: { type: ['string', 'null'] },
        game_mode: { type: 'string' }
      }
    };
  }

  // Utility to check if table exists and create if needed
  static async checkTableExists() {
    try {
      const { pool } = await import('../config/db.js');
      
      // Check if table exists
      const [tables] = await pool.query(
        `SHOW TABLES LIKE 'generated_material'`
      );
      
      if (tables.length === 0) {
        console.log("generated_material table does not exist - creating it");
        
        // Create table if it doesn't exist
        await pool.query(`
          CREATE TABLE generated_material (
            id INT AUTO_INCREMENT PRIMARY KEY,
            study_material_id VARCHAR(255) NOT NULL,
            item_id INT,
            item_number INT,
            term VARCHAR(255) NOT NULL,
            definition TEXT NOT NULL,
            image VARCHAR(255),
            question_type VARCHAR(50) NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            choices TEXT,
            game_mode VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (study_material_id),
            INDEX (question_type),
            INDEX (game_mode),
            UNIQUE KEY unique_question (study_material_id, term, question_type, game_mode)
          )
        `);
        
        console.log("generated_material table created successfully");
      } else {
        console.log("generated_material table already exists");
        
        // Check if unique constraint exists and add if missing
        try {
          const [indexCheck] = await pool.query(
            `SHOW INDEX FROM generated_material WHERE Key_name = 'unique_question'`
          );
          
          if (indexCheck.length === 0) {
            console.log("Adding missing unique constraint to generated_material table");
            await pool.query(`
              ALTER TABLE generated_material 
              ADD CONSTRAINT unique_question 
              UNIQUE (study_material_id, term, question_type, game_mode)
            `);
          }
        } catch (alterError) {
          console.error("Error checking or adding unique constraint:", alterError);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error checking or creating table:", error);
      throw error;
    }
  }
}

export default GeneratedMaterial;