import express from 'express';
import { getFriendsList } from '../controller/LobbyController.js';

const router = express.Router();

// Get friends list for lobby
router.get('/invite-friends/:firebase_uid', getFriendsList);

export default router;