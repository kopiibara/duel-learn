import express from 'express';
import ManaController from '../controller/ManaController.js';

const router = express.Router();

router.post('/reduce', ManaController.userManaReduction);
router.post('/replenish', ManaController.replenishMana);

// Change this to GET method to match our frontend implementation
router.get('/:firebase_uid', ManaController.getUserMana);

export default router;