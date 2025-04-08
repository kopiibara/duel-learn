import express from 'express';
import paymentController from '../controller/PaymentController.js';

const router = express.Router();

// Payment routes
router.post('/webhook/xendit', paymentController.webhookXendit);
router.post('/create-invoice', paymentController.createInvoice);
router.get('/invoice/:payment_id', paymentController.getInvoice);
router.get('/latest/:firebase_uid', paymentController.getLatestPayment);

export default router;