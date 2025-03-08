import express from 'express';
import {
    createInvitationHandler,
    updateInvitationStatusHandler
} from '../controller/BattleInvitationController.js';

const router = express.Router();

console.log("Setting up battle routes...");

// Create battle invitation
router.post('/pvp-invitation', createInvitationHandler);

// Update battle invitation status
router.put('/invite/status', updateInvitationStatusHandler);

export default router; 