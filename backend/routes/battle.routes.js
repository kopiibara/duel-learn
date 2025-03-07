import express from 'express';
import { createInvitation, updateInvitationStatus } from '../controller/BattleInvitationController.js';

const router = express.Router();

console.log("Setting up battle routes...");

// Create battle invitation
router.post('/pvp-invitation', async (req, res) => {
    console.log("Hit pvp-invitation endpoint");
    try {
        const { senderId, receiverId, lobbyCode } = req.body;
        console.log("Received invitation request:", { senderId, receiverId, lobbyCode }); // Debug log

        const result = await createInvitation({ senderId, receiverId, lobbyCode });

        if (result) {
            res.status(200).json({ success: true, message: 'Invitation sent successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to send invitation' });
        }
    } catch (error) {
        console.error('Error creating invitation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update battle invitation status
router.put('/invite/status', async (req, res) => {
    try {
        const { senderId, receiverId, lobbyCode, status } = req.body;
        const result = await updateInvitationStatus({
            senderId,
            receiverId,
            lobbyCode,
            status
        });

        if (result) {
            res.status(200).json({ success: true, message: 'Status updated successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to update status' });
        }
    } catch (error) {
        console.error('Error updating invitation status:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router; 