import express from "express";
import PaymentController from "../controller/PaymentController.js";

const router = express.Router();

router.post("/create-payment", PaymentController.createPayment);
router.post("/create-checkout-session", PaymentController.createCheckoutSession);
router.get("/verify-payment/:paymentIntentId", PaymentController.verifyPayment);
router.post("/webhook", PaymentController.paymongoWebhook);
router.get("/verify-payment-by-id/:paymentId", PaymentController.verifyPaymentById);
router.get("/user-subscription/:firebase_uid", PaymentController.getUserSubscription);

export default router;