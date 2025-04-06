import { Model } from 'objection';

class GeneratedMaterial extends Model {
  static get tableName() {
    return 'generated_material';
  }

  
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['study_material_id', 'term', 'definition', 'question_type', 'question', 'answer', 'game_mode'],

      properties: {
        id: { type: 'integer' },
        study_material_id: { type: 'string' },
        item_id: { type: ['string', 'null'] },
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
        
        // Create table with updated unique constraint to include item_number
        await pool.query(`
          CREATE TABLE generated_material (
            id INT AUTO_INCREMENT PRIMARY KEY,
            study_material_id VARCHAR(255) NOT NULL,
            item_id VARCHAR(255),
            item_number INT,
            term VARCHAR(255) NOT NULL,
            definition TEXT NOT NULL,
            image VARCHAR(255),
            question_type VARCHAR(50) NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            choices TEXT DEFAULT NULL,
            game_mode VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (study_material_id),
            INDEX (question_type),
            INDEX (game_mode),
            UNIQUE KEY unique_question (study_material_id, item_number, question_type, game_mode)
          )
        `);
        
        console.log("generated_material table created successfully");
      } else {
        // Update the unique constraint to include item_number
        try {
          await pool.query(`
            ALTER TABLE generated_material 
            DROP INDEX unique_question
          `);
        } catch (error) {
          // Ignore error if constraint doesn't exist
        }

        try {
          await pool.query(`
            ALTER TABLE generated_material 
            ADD CONSTRAINT unique_question 
            UNIQUE (study_material_id, item_number, question_type, game_mode)
          `);
          console.log("Updated unique constraint for generated_material table");
        } catch (error) {
          console.error("Error adding unique constraint:", error);
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