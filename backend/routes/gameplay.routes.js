import express from 'express';
import {
    initializeBattle,
    getBattleState,
    playCard,
    getCurrentTurn,
    getBattleStatus,
    updateTurn,
    endBattle,
    initializeBattleSession,
    updateBattleSession,
    getBattleSessionState
} from '../controller/GameplayController.js';

const router = express.Router();

// Initialize a new battle when both players enter
router.post('/battle/initialize', initializeBattle);

// New routes for battle_sessions
router.post('/battle/initialize-session', initializeBattleSession);
router.put('/battle/update-session', updateBattleSession);
router.get('/battle/session-state/:lobby_code', getBattleSessionState);

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

// End the battle
router.post('/battle/end', endBattle);

export default router; 