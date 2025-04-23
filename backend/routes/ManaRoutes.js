import express from 'express';
import ManaController from '../controller/ManaController.js';

const router = express.Router();

router.post('/reduce', ManaController.userManaReduction);
router.post('/replenish', ManaController.replenishMana);

// Add new route for detailed mana information first (more specific route)
router.get('/details/:firebase_uid', ManaController.getManaDetails);

// Then the more general route
router.get('/:firebase_uid', ManaController.getUserMana);

export default router;