import express from 'express';
import OpenAIController from '../controller/OpenAiController.js';
const router = express.Router();



router.get('/status', (req, res) => {
    const apiKeyExists = !!process.env.OPENAI_API_KEY;
    const apiKeyFirstChars = apiKeyExists ?
        `${process.env.OPENAI_API_KEY.substring(0, 3)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 3)}` :
        'not set';

    res.json({
        status: 'OpenAI API routes are configured',
        apiKeyConfigured: apiKeyExists,
        apiKeyHint: apiKeyFirstChars,
        routesAvailable: ['/api/openai/generate-summary (POST)', '/api/openai/status (GET)'],
        serverTime: new Date().toISOString()
    });
});

// Get friends list for lobby
router.post('/generate-summary', OpenAIController.generateSummary);

export default router;