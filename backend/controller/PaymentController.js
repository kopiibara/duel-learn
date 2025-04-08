import { pool } from '../config/db.js';
import { Xendit } from 'xendit-node';
import dotenv from 'dotenv';

// Load env variables FIRST
dotenv.config();

// THEN initialize Xendit client
const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });
const { Invoice, PaymentRequests } = xenditClient;

const paymentController = {
    webhookXendit: async (req, res) => {
        const token = req.headers['x-callback-token'];
        if (token !== process.env.XENDIT_WEBHOOK_TOKEN) return res.sendStatus(403);

        const event = req.body;

        if (event.status === 'PAID' && event.external_id.startsWith('subscription-')) {
            try {
                // Extract user ID from external_id (format: subscription-{firebase_uid}-{timestamp})
                const firebase_uid = event.external_id.split('-')[1];

                // Determine plan based on amount
                const plan = event.amount === 9900 ? 'monthly' : 'annual';

                // Update user_payment status
                await pool.query(
                    `UPDATE user_payment
                    SET status = 'paid', paid_at = NOW()
                    WHERE xendit_invoice_id = ?`,
                    [event.id]
                );

                // Generate invoice after payment is confirmed
                await generateInvoiceForUser(firebase_uid, event.id, plan, event.amount);

                console.log('✅ Payment confirmed for user', firebase_uid);
                res.sendStatus(200);
            } catch (error) {
                console.error('❌ Error processing webhook:', error);
                res.status(500).send('Internal Server Error');
            }
        } else {
            // Handle other event types or statuses if needed
            res.sendStatus(200);
        }
    },

    createInvoice: async (req, res) => {
        try {
            const { firebase_uid, email, plan, username } = req.body;

            // Validate required fields
            if (!firebase_uid || !email || !plan) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    details: 'firebase_uid, email, and plan are required'
                });
            }

            const amount = plan === 'monthly' ? 9900 : 99900;
            const externalID = `subscription-${firebase_uid}-${Date.now()}`;

            console.log('Creating payment request with data:', { firebase_uid, email, plan, amount });

            // Create payment request using the new approach
            const paymentRequestParams = {
                externalID,
                amount,
                payerEmail: email,
                description: `Subscription - ${plan}`,
                currency: 'PHP',
                successRedirectURL: `${process.env.FRONTEND_URL}/payment-success?payment=success`,
                failureRedirectURL: `${process.env.FRONTEND_URL}/payment-failure?payment=failed`,
            };

            console.log('Payment request params:', paymentRequestParams);

            // Use PaymentRequests instead of Invoice
            const paymentRequest = await PaymentRequests.createPaymentRequest(paymentRequestParams);

            console.log('Full payment response:', JSON.stringify(paymentRequest, null, 2));

            // Check payment request structure
            if (!paymentRequest || !paymentRequest.payment_url) {
                console.error('Invalid payment response structure:', paymentRequest);
                return res.status(500).json({
                    error: 'Invalid payment response from Xendit',
                    details: 'The payment gateway returned an unexpected response format'
                });
            }

            console.log('Xendit payment created:', paymentRequest);

            // Calculate expiration date based on plan
            const expires_at = new Date();
            if (plan === 'monthly') {
                expires_at.setMonth(expires_at.getMonth() + 1);
            } else {
                expires_at.setFullYear(expires_at.getFullYear() + 1);
            }

            // Store payment ID in your database for tracking
            await pool.query(
                `INSERT INTO user_payment 
                (firebase_uid, username, xendit_invoice_id, amount, plan, payment_method, status, expires_at, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    firebase_uid,
                    username || null,
                    paymentRequest.id,
                    amount,
                    plan,
                    'xendit',
                    'pending',
                    expires_at
                ]
            );

            res.json({
                invoice_url: paymentRequest.payment_url,
                invoice_id: paymentRequest.id,
                status: 'success'
            });
        } catch (error) {
            console.error('❌ Create payment failed:', error);

            const errorDetails = error.response?.errors ||
                error.rawResponse?.errors || [];

            const specificErrors = Array.isArray(errorDetails) ?
                errorDetails.map(e => `${e.path || ''}: ${e.message || ''}`).join(', ') :
                'Unknown validation error';

            res.status(500).json({
                error: 'Failed to create payment',
                message: error.message,
                details: specificErrors || error.errorMessage || 'Unknown error'
            });
        }
    },

    // New endpoint to get invoice by payment ID
    getInvoice: async (req, res) => {
        try {
            const { payment_id } = req.params;

            // Fetch invoice from database
            const [invoice] = await pool.query(
                `SELECT * FROM user_invoices 
                 WHERE payment_id = ?`,
                [payment_id]
            );

            if (!invoice || invoice.length === 0) {
                return res.status(404).json({
                    error: 'Invoice not found',
                    details: 'No invoice found for this payment ID'
                });
            }

            res.json({
                invoice_url: invoice[0].invoice_url,
                invoice_id: invoice[0].id,
                status: 'success'
            });
        } catch (error) {
            console.error('❌ Error fetching invoice:', error);
            res.status(500).json({
                error: 'Failed to fetch invoice',
                message: error.message
            });
        }
    },

    getLatestPayment: async (req, res) => {
        try {
            const { firebase_uid } = req.params;

            // Fetch the latest payment for this user
            const [payment] = await pool.query(
                `SELECT xendit_invoice_id AS payment_id
                 FROM user_payment 
                 WHERE firebase_uid = ? 
                 ORDER BY created_at DESC 
                 LIMIT 1`,
                [firebase_uid]
            );

            if (!payment || payment.length === 0) {
                return res.status(404).json({
                    error: 'No payment found',
                    details: 'No payment records found for this user'
                });
            }

            res.json({
                payment_id: payment[0].payment_id,
                status: 'success'
            });
        } catch (error) {
            console.error('❌ Error fetching payment:', error);
            res.status(500).json({
                error: 'Failed to fetch payment details',
                message: error.message
            });
        }
    }
};

// Helper function to generate invoice after payment
async function generateInvoiceForUser(firebase_uid, payment_id, plan, amount) {
    try {
        // Get user details from database
        const [user] = await pool.query(
            `SELECT * FROM users WHERE firebase_uid = ?`,
            [firebase_uid]
        );

        if (!user || user.length === 0) {
            console.error('User not found for invoice generation');
            return;
        }

        // Create invoice data
        const invoiceNumber = `INV-${Date.now()}`;
        const invoiceDate = new Date().toISOString().split('T')[0];

        // Format amount for display (convert from cents)
        const formattedAmount = (amount / 100).toFixed(2);

        // Store invoice in database (you'll need to create this table)
        await pool.query(
            `INSERT INTO user_invoices 
            (firebase_uid, payment_id, invoice_number, amount, plan, created_at) 
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [
                firebase_uid,
                payment_id,
                invoiceNumber,
                amount,
                plan
            ]
        );

        console.log(`✅ Invoice ${invoiceNumber} generated for user ${firebase_uid}`);

        // In a real implementation, you would:
        // 1. Generate a PDF invoice
        // 2. Store it in a cloud storage
        // 3. Send it by email to the user
        // 4. Update the database with the invoice URL
    } catch (error) {
        console.error('❌ Error generating invoice:', error);
    }
}

export default paymentController;