import express from 'express';
import { createBattleInvitation, updateBattleInvitationStatus, getHostInfo, updateInvitationStatusByLobbyCode, getInvitationDetails, updateLobbySettings } from '../controller/BattleInvitationController.js';

const router = express.Router();

// Create a new battle invitation
router.post('/invitations-lobby', createBattleInvitation);

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

export default router;