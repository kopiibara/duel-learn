import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// PayMongo API details
const PAYMONGO_URL = 'https://api.paymongo.com/v1';
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

// Your webhook URL - update with your actual domain
const WEBHOOK_URL = process.env.PAYMONGO_WEBHOOK_URL || 'https://duel-learn-production.up.railway.app/api/payment/webhook';

async function registerWebhook() {
    try {
        console.log('Registering webhook at URL:', WEBHOOK_URL);
        console.log('Using API key:', PAYMONGO_SECRET_KEY ? 'Available' : 'Missing');

        const response = await axios.post(
            `${PAYMONGO_URL}/webhooks`,
            {
                data: {
                    attributes: {
                        url: WEBHOOK_URL,
                        events: ['payment.paid', 'payment.failed']
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Webhook registered successfully:');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Failed to register webhook:');
        console.error(error.response?.data || error.message);
        throw error;
    }
}

// Check if this file is being run directly (ES Module version)
if (import.meta.url.startsWith('file:')) {
    const modulePath = new URL(import.meta.url).pathname;
    const executedPath = process.argv[1];

    if (modulePath === executedPath || modulePath.replace(/\\/g, '/') === executedPath.replace(/\\/g, '/')) {
        registerWebhook()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    }
}

export default registerWebhook;