import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import SocketService from '../services/socketService';
import InvitationSnackbar from './InvitationSnackbar';

const InvitationTester: React.FC = () => {
    const { user } = useUser();
    const [socket, setSocket] = useState<any>(null);
    const [invitation, setInvitation] = useState({
        open: false,
        inviterName: '',
        senderId: '',
        lobbyCode: '',
    });

    useEffect(() => {
        if (!user?.firebase_uid) return;

        console.log("Initializing test socket for user:", user.firebase_uid);
        const socketService = SocketService.getInstance();
        const newSocket = socketService.connect(user.firebase_uid);
        setSocket(newSocket);

        // Only listen for battle invitations
        const handleInvitation = (data: any) => {
            console.log("TEST COMPONENT: Battle invitation received!", data);

            // Always create a new object to ensure state update
            setInvitation({
                open: true,
                inviterName: data.senderName || 'Unknown',
                senderId: data.senderId,
                lobbyCode: data.lobbyCode,
            });
        };

        newSocket.on('battle_invitation', handleInvitation);

        return () => {
            newSocket.off('battle_invitation', handleInvitation);
        };
    }, [user?.firebase_uid]);

    const handleClose = () => {
        setInvitation({ ...invitation, open: false });
    };

    const handleAccept = () => {
        console.log('Invitation accepted in test component');
        setInvitation({ ...invitation, open: false });
    };

    const handleDecline = () => {
        console.log('Invitation declined in test component');
        setInvitation({ ...invitation, open: false });
    };

    const testSendToSpecificUser = () => {
        const targetUserId = "QkbQ6duVorhhNC2nDjiVGQce4wv2";

        if (!user?.firebase_uid) {
            console.error("You must be logged in to send an invitation");
            return;
        }

        console.log(`Sending test invitation to specific user: ${targetUserId}`);

        // Prepare the invitation data
        const invitationData = {
            senderId: user.firebase_uid,
            senderName: user.username || "Test Sender",
            receiverId: targetUserId,
            lobbyCode: "DEBUG-" + Math.floor(Math.random() * 10000),
        };

        // Send via socket service
        SocketService.getInstance().sendBattleInvitation(invitationData);

        // Show confirmation
        alert(`Test invitation sent to user ID: ${targetUserId}`);
    };

    return (
        <>
            <InvitationSnackbar
                open={invitation.open}
                inviterName={invitation.inviterName}
                onClose={handleClose}
                onAccept={handleAccept}
                onDecline={handleDecline}
            />

            <div style={{
                position: 'fixed',
                bottom: 150,
                right: 20,
                zIndex: 9995,
                background: '#333',
                padding: '10px',
                borderRadius: '5px'
            }}>
                <div>Invitation Test Component Active</div>
                <div>User ID: {user?.firebase_uid || 'Not logged in'}</div>
                <div>Socket Connected: {socket ? 'Yes' : 'No'}</div>
                <button
                    onClick={() => {
                        setInvitation({
                            open: true,
                            inviterName: 'Test User',
                            senderId: 'test-id',
                            lobbyCode: 'TEST123',
                        });
                    }}
                    style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        background: '#4D1EE3',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                    }}
                >
                    Show Test Invitation
                </button>
                <button
                    onClick={testSendToSpecificUser}
                    style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        background: '#FF5722',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        display: 'block',
                        width: '100%'
                    }}
                >
                    Send to QkbQ6duV...
                </button>
            </div>
        </>
    );
};

export default InvitationTester; 