import { pool } from '../config/db.js';
import { Xendit } from 'xendit-node';
import dotenv from 'dotenv';

// Load env variables FIRST
dotenv.config();

// THEN initialize Xendit client
const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });
const { Invoice } = xenditClient;

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
                const plan = event.amount === 99 ? 'monthly' : 'annual';

                // Update user_payment status
                await pool.query(
                    `UPDATE user_payment
                    SET status = 'paid', paid_at = NOW()
                    WHERE xendit_invoice_id = ?`,
                    [event.id]
                );

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

            const amount = plan === 'monthly' ? 99 : 999;

            console.log('Creating invoice with data:', { firebase_uid, email, plan, amount });

            const invoiceParams = {
                externalID: `subscription-${firebase_uid}-${Date.now()}`,
                payerEmail: email,
                description: `Subscription - ${plan}`,
                amount,
                // Add these parameters to avoid potential Xendit API errors
                successRedirectURL: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
                failureRedirectURL: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failed`,
                currency: 'PHP'
            };

            console.log('Invoice params:', invoiceParams);

            const invoice = await Invoice.createInvoice({
                data: invoiceParams
            });

            console.log('Full invoice response:', JSON.stringify(invoice, null, 2));

            // Check invoice structure before accessing properties
            if (!invoice || !invoice.invoice_url) {
                console.error('Invalid invoice response structure:', invoice);
                return res.status(500).json({
                    error: 'Invalid invoice response from Xendit',
                    details: 'The payment gateway returned an unexpected response format'
                });
            }

            console.log('Xendit invoice created:', invoice);

            // Calculate expiration date based on plan
            const expires_at = new Date();
            if (plan === 'monthly') {
                expires_at.setMonth(expires_at.getMonth() + 1);
            } else {
                expires_at.setFullYear(expires_at.getFullYear() + 1);
            }

            // Store invoice ID in your database for tracking
            await pool.query(
                `INSERT INTO user_payment 
                (firebase_uid, username, xendit_invoice_id, amount, plan, payment_method, status, expires_at, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    firebase_uid,
                    username || null,
                    invoice.id,
                    amount,
                    plan,
                    'xendit',
                    'pending',
                    expires_at
                ]
            );

            res.json({
                invoice_url: invoice.invoice_url,
                invoice_id: invoice.id,
                status: 'success'
            });
        } catch (error) {
            console.error('❌ Create invoice failed:', error);
            // Send more detailed error information
            res.status(500).json({
                error: 'Failed to create invoice',
                message: error.message,
                details: error.response?.data || 'Unknown error'
            });
        }
    }
}

export default paymentController;