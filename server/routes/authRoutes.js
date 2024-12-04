import express from 'express';
import cors from 'cors';
import { test, signUpUser, loginUser, getProfile, checkEmailForgotPassword, getUsernameByEmail, sendForgotPasswordEmail, verifySecurityCode, resetPassword } from '../controllers/authController.js';  // Updated import syntax

const router = express.Router();

router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
);

router.get('/', test);
router.post('/sign-up', signUpUser);
router.post('/login', loginUser);
router.get('/welcome', getProfile);
router.post('/forgot-password', checkEmailForgotPassword);
router.get('/confirmation-account', getUsernameByEmail);
router.post('/confirmation-account', sendForgotPasswordEmail);
router.post('/security-code', verifySecurityCode); 
router.post('/reset-password', resetPassword); 

export default router;