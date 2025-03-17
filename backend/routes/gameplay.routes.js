import express from 'express';
import {
    initializeBattle,
    getBattleState,
    playCard,
    getCurrentTurn,
    getBattleStatus,
    updateTurn
} from '../controller/GameplayController.js';

const router = express.Router();

// Initialize a new battle when both players enter
router.post('/battle/initialize', initializeBattle);

// Get current battle state
router.get('/battle/state/:lobby_code', getBattleState);

// Play a card
router.post('/battle/play-card', playCard);

// Get current turn
router.get('/battle/turn/:lobby_code', getCurrentTurn);

// Get battle status (active, ended, etc)
router.get('/battle/status/:lobby_code', getBattleStatus);

// Update the current turn
router.put('/battle/update-turn', updateTurn);

export default router; 