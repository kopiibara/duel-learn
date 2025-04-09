import express from "express";
import PaymentController from "../controller/PaymentController.js";

const router = express.Router();

router.post("/create-payment", PaymentController.createPayment);
router.get("/verify-payment/:paymentIntentId", PaymentController.verifyPayment);
router.post("/webhook", PaymentController.paymongoWebhook);

export default router;