import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, Box, Button, Snackbar } from "@mui/material";

const InvitationLobbySnackbar: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [socket, setSocket] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [invitation, setInvitation] = useState({
        open: false,
        inviterName: "",
        lobbyCode: "",
        senderId: ""
    });
    const [declineNotification, setDeclineNotification] = useState({
        open: false,
        receiverId: "",
        message: ""
    });

    useEffect(() => {
        if (!user?.firebase_uid) return;

        // Create direct socket connection
        const newSocket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            log(`Direct socket connected: ${newSocket.id}`);
            // Setup user immediately after connection
            newSocket.emit('setup', user.firebase_uid);
        });

        newSocket.on('connected', (data) => {
            log(`Server confirmed connection: ${JSON.stringify(data)}`);
        });

        // Listen for battle invitations with enhanced logging
        newSocket.on('battle_invitation', (data) => {
            log(`⚠️ INVITATION RECEIVED: ${JSON.stringify(data)}`);
            console.group('Battle Invitation Received');
            console.log('Raw data:', data);
            console.log('Current user:', user.firebase_uid);
            console.groupEnd();

            // Skip if it's our own invitation
            if (data.senderId === user.firebase_uid) {
                log("Ignoring our own invitation");
                return;
            }

            // Validate required fields
            if (!data.senderId || !data.senderName || !data.lobbyCode) {
                log("Missing required invitation data");
                return;
            }

            // Set invitation state for the snackbar
            setInvitation({
                open: true,
                inviterName: data.senderName || "Unknown Player",
                lobbyCode: data.lobbyCode,
                senderId: data.senderId
            });

            log(`Invitation set with lobbyCode: ${data.lobbyCode}, senderId: ${data.senderId}`);
        });

        // Add listener for declined invitations
        newSocket.on('battle_invitation_declined', (data) => {
            log(`⚠️ INVITATION DECLINED: ${JSON.stringify(data)}`);

            setDeclineNotification({
                open: true,
                receiverId: data.receiverId,
                message: `Your battle invitation was declined`
            });

            // Auto close after 5 seconds
            setTimeout(() => {
                setDeclineNotification(prev => ({ ...prev, open: false }));
            }, 5000);
        });

        newSocket.on('disconnect', () => {
            log('Socket disconnected');
        });

        newSocket.on('connect_error', (error) => {
            log(`Socket connection error: ${error.message}`);
        });

        setSocket(newSocket);

        // Cleanup function
        return () => {
            log('Cleaning up socket connection');
            if (newSocket) {
                newSocket.off('battle_invitation');
                newSocket.off('battle_invitation_declined');
                newSocket.disconnect();
            }
        };
    }, [user?.firebase_uid]);

    const log = (message: string) => {
        console.log(`[InvitationSnackbar] ${message}`);
        setLogs((prev) => [message, ...prev].slice(0, 10));
    };

    const handleAcceptInvitation = () => {
        log(`Accepting invitation to lobby: ${invitation.lobbyCode}`);
        console.log("Accepting invitation:", invitation);

        if (socket) {
            socket.emit("accept_battle_invitation", {
                senderId: invitation.senderId,
                receiverId: user?.firebase_uid,
                lobbyCode: invitation.lobbyCode,
            });
        }

        // Navigate to the lobby with enhanced state information
        navigate(`/dashboard/pvp-lobby/${invitation.lobbyCode}`, {
            state: {
                isGuest: true,
                lobbyCode: invitation.lobbyCode,
                selectedMaterial: { title: "Loading host's material..." },
                invitedPlayer: {
                    firebase_uid: invitation.senderId,
                    username: invitation.inviterName,
                    level: 1,
                    display_picture: null,
                }
            },
        });

        // Close the invitation
        setInvitation(prev => ({ ...prev, open: false }));
    };

    const handleDeclineInvitation = () => {
        log(`Declining invitation from: ${invitation.senderId}`);

        if (socket) {
            socket.emit("decline_battle_invitation", {
                senderId: invitation.senderId,
                receiverId: user?.firebase_uid,
                receiverName: user?.username || "Player",
                lobbyCode: invitation.lobbyCode,
            });

            log("Decline notification sent to sender");
        }

        // Close the invitation
        setInvitation(prev => ({ ...prev, open: false }));
    };

    // Debug panel for development
    const showDebugPanel = false; // Set to true to show debug panel

    return (
        <>
            {showDebugPanel && (
                <div style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    width: 300,
                    background: '#000',
                    color: '#0f0',
                    padding: 10,
                    borderRadius: 5,
                    zIndex: 9998,
                    fontFamily: 'monospace',
                    fontSize: 12
                }}>
                    <div>Battle Invitation Handler</div>
                    <div>User: {user?.firebase_uid || 'Not logged in'}</div>
                    <div>Socket: {socket?.connected ? 'Connected' : 'Disconnected'}</div>
                    <div style={{ marginTop: 10 }}>
                        <strong>Event Log:</strong>
                        {logs.map((entry, i) => (
                            <div key={i} style={{ marginTop: 5, wordBreak: 'break-all' }}>
                                {entry}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Invitation Alert */}
            {invitation.open && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 10000,
                    pointerEvents: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '16px'
                }}>
                    <div style={{
                        width: 'fit-content',
                        pointerEvents: 'auto'
                    }}>
                        <Alert
                            severity="info"
                            onClose={handleDeclineInvitation}
                            sx={{
                                width: "100%",
                                minWidth: '300px',
                                boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
                                border: '2px solid #4D1EE3'
                            }}
                        >
                            <AlertTitle>Battle Invitation</AlertTitle>
                            <strong>{invitation.inviterName}</strong> has invited you to battle!
                            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={handleAcceptInvitation}
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    Accept
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={handleDeclineInvitation}
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    Decline
                                </Button>
                            </Box>
                        </Alert>
                    </div>
                </div>
            )}

            {/* Decline Notification */}
            <Snackbar
                open={declineNotification.open}
                autoHideDuration={5000}
                onClose={() => setDeclineNotification(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="info"
                    onClose={() => setDeclineNotification(prev => ({ ...prev, open: false }))}
                    sx={{
                        boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
                        border: '2px solid #E4384C'
                    }}
                >
                    <AlertTitle>Invitation Declined</AlertTitle>
                    {declineNotification.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default InvitationLobbySnackbar; 