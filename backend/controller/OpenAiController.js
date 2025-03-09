import { OpenAI } from "openai";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
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
                    message: "Please provide at least one item with term and definition"
                });
            }

            const prompt = `Generate an overview that will cater the topic of the following details of the study material:  
            Tags: ${tags ? tags.join(', ') : 'No tags'}  
            Items: ${items.map(item => `${item.term}: ${item.definition}`).join('\n')}  
            
            Make it so that it will gather the attention of the user that will read this overview and will make them interested to read the full study material.
            
            Rules:  
            1. Make it fun, clear, and catchy.  
            2. Highlight the main idea in a cool way.  
            3. Use simple, engaging language that grabs attention!`;

            console.log("Calling OpenAI API...");

            try {
                const completion = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an AI that generates concise, accurate summaries of educational content.'
                        },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 50 // Limit response length
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
                    note: "Generated as fallback due to API error"
                });
            }
        } catch (error) {
            console.error("Error in generate-summary route:", error);
            res.status(500).json({
                error: "Failed to generate summary",
                message: "An error occurred while generating the summary",
                details: error.message
            });
        }
    }
};

export default OpenAIController;