import express from 'express';
import { createBattleInvitation, updateBattleInvitationStatus, getHostInfo, updateInvitationStatusByLobbyCode, getInvitationDetails, updateLobbySettings, updatePlayerReadyState, getReadyState, getLobbySettings, updateBattleStatus, getBattleStatus, updateDifficulty, getDifficulty, createInitialBattleLobby } from '../controller/BattleInvitationController.js';

const router = express.Router();

// Create a new battle invitation
router.post('/invitations-lobby', createBattleInvitation);

// Create an initial battle lobby without a guest player
router.post('/initial-lobby', createInitialBattleLobby);

// Update battle invitation status
router.put('/invitations-lobby/:id/status', updateBattleInvitationStatus);

// Get host information
router.get('/invitations-lobby/host/:sender_id', getHostInfo);

// Update invitation status by lobby code
router.put('/invitations-lobby/status/update', updateInvitationStatusByLobbyCode);

// Add this new route
router.get('/invitations-lobby/details/:lobby_code/:sender_id/:receiver_id', getInvitationDetails);

// Update lobby settings
router.put('/invitations-lobby/settings', updateLobbySettings);

// Add these new routes
router.put('/invitations-lobby/ready-state', updatePlayerReadyState);
router.get('/invitations-lobby/ready-state/:lobby_code', getReadyState);

// Add this new route for fetching lobby settings
router.get('/invitations-lobby/settings/:lobby_code', getLobbySettings);

// Add these new routes for battle status
router.put('/invitations-lobby/battle-status', updateBattleStatus);
router.get('/invitations-lobby/battle-status/:lobby_code', getBattleStatus);

// Add these new routes for difficulty settings
router.put('/invitations-lobby/difficulty', updateDifficulty);
router.get('/invitations-lobby/difficulty/:lobby_code', getDifficulty);

export default router;