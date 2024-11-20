import express from 'express';
import cors from 'cors';
import { test, signUpUser, loginUser, getProfile } from '../controllers/authController.js';  // Updated import syntax

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

export default router;
