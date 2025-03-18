import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      const { term, definition } = req.body;

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
      const { term, definition, numberOfItems = 1 } = req.body;

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
      console.log("Received multiple choice question request");
      const { term, definition, numberOfItems = 1 } = req.body;

      if (!term || !definition) {
        console.log("Missing required parameters");
        return res.status(400).json({ error: "Missing term or definition" });
      }

      // Clean the term by removing any letter prefix
      const cleanedTerm = term.replace(/^[A-D]\.\s+/, "");

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
- The incorrect options should be terms that could be mistaken for "${cleanedTerm}", not terms related to the definition`;

      console.log("Calling OpenAI for multiple choice questions");
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              'You are a helpful AI that generates multiple-choice questions. Create questions where the user must select the correct term that matches a definition. Include the original term as one of the options, and ensure all other options are similar terms that might be confused with the correct answer. The incorrect options should be terms that could be mistaken for the original term, not terms related to the definition. Format the answer as "letter. term" where the letter matches where the term appears in the options.',
          },
          { role: "user", content: prompt },
        ],
      });

      const text = completion.choices[0].message.content;
      console.log("AI response for multiple choice received");

      // Remove any Markdown formatting from the response
      const cleanedText = text.replace(/```json|```/g, "").trim();

      try {
        console.log("Parsing AI response");
        let questions = JSON.parse(cleanedText);

        // Ensure questions is always an array
        if (!Array.isArray(questions)) {
          questions = [questions];
        }

        // Validate and fix the response
        questions = questions.map((q) => {
          if (q.type === "multiple-choice" && q.options) {
            // Find which option contains the original term
            const optionLetter = Object.entries(q.options).find(
              ([_, value]) => value.toLowerCase() === cleanedTerm.toLowerCase()
            )?.[0];
            if (optionLetter) {
              q.answer = `${optionLetter}. ${cleanedTerm}`;
            }

            // Check if options follow similar length/style rule
            const termLength = cleanedTerm.length;
            const termWordCount = cleanedTerm.split(/\s+/).length;

            let isStyleConsistent = true;
            const optionsInfo = Object.entries(q.options).map(
              ([letter, value]) => {
                const optionLength = String(value).length;
                const optionWordCount = String(value).split(/\s+/).length;

                // Check if length or word count differs significantly
                const lengthDiff = Math.abs(optionLength - termLength);
                const wordDiff = Math.abs(optionWordCount - termWordCount);

                if (lengthDiff > termLength * 0.5 || wordDiff > 1) {
                  isStyleConsistent = false;
                }

                return {
                  letter,
                  value,
                  length: optionLength,
                  words: optionWordCount,
                };
              }
            );

            console.log(`Style consistency check for "${cleanedTerm}":`, {
              termLength,
              termWordCount,
              options: optionsInfo,
              isStyleConsistent,
            });

            if (!isStyleConsistent) {
              console.log(
                "WARNING: Options do not follow similar length/style rule"
              );
            }
          }
          return q;
        });

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
      res.status(500).json({
        error: "Failed to generate multiple choice questions",
        details: error.message,
      });
    }
  },
};

export default OpenAIController;
