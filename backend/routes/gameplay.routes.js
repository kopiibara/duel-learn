import express from 'express';
import {
    endBattle,
    initializeBattleSession,
    updateBattleSession,
    getBattleSessionState,
    getBattleEndStatus,
    getBattleEndStatusById,
    getBattleEndStatusByLobby,
    getBattleSessionWithMaterial,
    initializeBattleRounds,
    updateBattleRound,
    getBattleRound,
    initializeBattleScores,
    getBattleScores,
    updateBattleScores,
    getActiveCardEffects,
    consumeCardEffect,
    checkCardBlockingEffects
} from '../controller/GameplayController.js';

const router = express.Router();


// New routes for battle_sessions
router.post('/battle/initialize-session', initializeBattleSession);
router.put('/battle/update-session', updateBattleSession);
router.get('/battle/session-state/:lobby_code', getBattleSessionState);
router.get('/battle/session-with-material/:lobby_code', getBattleSessionWithMaterial);

// Battle rounds
router.post('/battle/initialize-rounds', initializeBattleRounds);
router.put('/battle/update-round', updateBattleRound);
router.get('/battle/round/:session_uuid', getBattleRound);

// Card effects
router.get('/battle/card-effects/:session_uuid/:player_type', getActiveCardEffects);
router.post('/battle/consume-card-effect', consumeCardEffect);
router.get('/battle/card-blocking-effects/:session_uuid/:player_type', checkCardBlockingEffects);

// Battle scores
router.post('/battle/initialize-scores', initializeBattleScores);
router.get('/battle/scores/:session_uuid', getBattleScores);
router.put('/battle/update-scores', updateBattleScores);

// End the battle
router.post('/battle/end', endBattle);

// Check battle end status - several ways to query
router.get('/battle/end-status/:session_uuid', getBattleEndStatus);
router.get('/battle/end-status-by-id/:session_id', getBattleEndStatusById);
router.get('/battle/end-status-by-lobby/:lobby_code', getBattleEndStatusByLobby);

export default router; 