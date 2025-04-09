import Paymongo from 'paymongo';
import dotenv from 'dotenv';
import { pool } from '../config/db.js'; // Import your database connection

dotenv.config();

// Initialize the PayMongo client correctly
const paymongoClient = new Paymongo(process.env.PAYMONGO_SECRET_KEY);

const PaymentController = {
    createPayment: async (req, res) => {
        try {
            const { firebase_uid, username, email, plan } = req.body;

            // Determine amount based on subscription plan
            let amount = 0;
            let planName = '';
            let expiryDate = null;
            const now = new Date();

            switch (plan) {
                case 'monthly':
                    amount = 109;
                    planName = 'MONTHLY PLAN';
                    // Set expiry to 1 month from now
                    expiryDate = new Date(now);
                    expiryDate.setMonth(expiryDate.getMonth() + 1);
                    break;
                case 'annual':
                    amount = 1099;
                    planName = 'ANNUAL PLAN';
                    // Set expiry to 1 year from now
                    expiryDate = new Date(now);
                    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                    break;
                case 'free':
                    amount = 0;
                    planName = 'FREE PLAN';
                    // Set expiry to never or some default period
                    expiryDate = null;
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid subscription plan' });
            }

            // If it's a free plan, just insert the record and return success
            if (amount === 0) {
                // Insert record into user_payment table for free plan
                await pool.query(
                    'INSERT INTO user_payment (firebase_uid, username, amount, plan, payment_method, status, created_at, paid_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NULL)',
                    [firebase_uid, username, amount, planName, 'free', 'active']
                );

                return res.status(200).json({
                    success: true,
                    message: 'Free plan selected, no payment required',
                    plan: planName
                });
            }

            // For paid plans, create a payment record with 'pending' status
            const [paymentResult] = await pool.query(
                'INSERT INTO user_payment (firebase_uid, username, amount, plan, payment_method, status, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)',
                [firebase_uid, username, amount, planName, 'paymongo', 'pending', expiryDate ? expiryDate : null]
            );

            const paymentId = paymentResult.insertId;

            // Create a payment link using PayMongo
            const paymentLinkResponse = await paymongoClient.links.create({
                data: {
                    attributes: {
                        amount: amount * 100, // Amount in cents
                        description: `Duel Learn ${planName}`,
                        remarks: JSON.stringify({
                            payment_id: paymentId,
                            firebase_uid,
                            username,
                            email,
                            plan: planName
                        })
                    }
                }
            });

            return res.status(200).json({
                success: true,
                payment_url: paymentLinkResponse.data.attributes.checkout_url,
                amount: amount,
                plan: planName
            });

        } catch (error) {
            console.error('Payment error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to process payment',
                message: error.message
            });
        }
    },

    verifyPayment: async (req, res) => {
        try {
            const { linkId } = req.params;

            // Retrieve payment link using the correct method
            const paymentLink = await paymongoClient.links.retrieve(linkId);

            if (paymentLink.data.attributes.status === 'paid') {
                // Extract metadata from remarks
                const remarks = JSON.parse(paymentLink.data.attributes.remarks || '{}');
                const planName = remarks.plan;
                const amount = paymentLink.data.attributes.amount / 100;

                return res.status(200).json({
                    success: true,
                    message: 'Payment verified',
                    planDetails: {
                        planName,
                        amount
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Payment has not been completed'
                });
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to verify payment',
                message: error.message
            });
        }
    },

    // Update the webhook handler to update payment records
    paymongoWebhook: async (req, res) => {
        try {
            const payload = req.body;

            const eventType = payload.data.attributes.type;
            const resourceData = payload.data.attributes.data;

            console.log(`Received webhook event: ${eventType}`);

            switch (eventType) {
                case 'payment.paid':
                    // Handle successful payment
                    await handleSuccessfulPayment(resourceData);
                    break;

                case 'payment.failed':
                    // Handle failed payment
                    await handleFailedPayment(resourceData);
                    break;

                default:
                    console.log(`Unhandled webhook event type: ${eventType}`);
            }

            return res.status(200).json({ received: true });
        } catch (error) {
            console.error('Webhook processing error:', error);
            return res.status(200).json({
                received: true,
                error: error.message
            });
        }
    }
};

// Helper functions for webhook processing
async function handleSuccessfulPayment(paymentData) {
    try {
        // Extract payment information
        const paymentId = paymentData.id;
        const linkId = paymentData.attributes.payment_intent_id;

        // Fetch the payment link to get the user details from remarks
        const paymentLink = await paymongoClient.links.retrieve(linkId);
        const remarks = JSON.parse(paymentLink.data.attributes.remarks || '{}');

        const { payment_id, firebase_uid, plan } = remarks;

        if (!firebase_uid) {
            console.error('Missing firebase_uid in payment remarks');
            return;
        }

        // Update the payment record in database
        await pool.query(
            'UPDATE user_payment SET status = ?, paid_at = NOW() WHERE id = ?',
            ['active', payment_id]
        );

        console.log(`Successfully processed payment ${paymentId} for user ${firebase_uid}`);
    } catch (error) {
        console.error('Error handling successful payment:', error);
    }
}

async function handleFailedPayment(paymentData) {
    try {
        // Extract payment information
        const paymentId = paymentData.id;
        const linkId = paymentData.attributes.payment_intent_id;

        // Fetch the payment link to get the user details
        const paymentLink = await paymongoClient.links.retrieve(linkId);
        const remarks = JSON.parse(paymentLink.data.attributes.remarks || '{}');

        const { payment_id } = remarks;

        if (payment_id) {
            // Update the payment record status to failed
            await pool.query(
                'UPDATE user_payment SET status = ? WHERE id = ?',
                ['failed', payment_id]
            );
        }

        console.log('Payment failed:', paymentId);
    } catch (error) {
        console.error('Error handling failed payment:', error);
    }
}

async function updateUserSubscription(firebase_uid, plan) {
    // Here you would update your user's subscription status in your database
    // For example:
    // await db.collection('users').doc(firebase_uid).update({
    //     subscription: plan,
    //     subscriptionStatus: 'active',
    //     subscriptionDate: new Date(),
    //     subscriptionExpiry: calculateExpiryDate(plan)
    // });

    console.log(`Updated subscription for user ${firebase_uid} to ${plan}`);
}

export default PaymentController;