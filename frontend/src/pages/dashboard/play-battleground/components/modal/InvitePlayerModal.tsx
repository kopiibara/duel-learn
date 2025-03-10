import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, Tooltip, Alert, AlertTitle } from "@mui/material";
import CloseIcon from "@mui/icons-material/CancelOutlined";
import InviteFriendList from "../../../../../assets/General/ModalFriendList.png";
import ProfileIcon from "../../../../../assets/profile-picture/kopibara-picture.png";
import axios from "axios";
import { useUser } from "../../../../../contexts/UserContext";
import SocketService from "../../../../../services/socketService";
import { io } from 'socket.io-client';

interface Player {
  firebase_uid: string;
  username: string;
  level: number;
  display_picture: string | null;
}

interface InvitePlayerModalProps {
  open: boolean;
  handleClose: () => void;
  onInviteSuccess: (friend: Player, invitationInfo: any) => void;
  lobbyCode: string;
  inviterName?: string;
  senderId?: string;
  onInvitationAccepted?: (lobbyCode: string) => void;
}

const InvitePlayerModal: React.FC<InvitePlayerModalProps> = ({
  open,
  handleClose,
  onInviteSuccess,
  lobbyCode,
  inviterName,
  senderId,
  onInvitationAccepted,
}) => {
  const [friends, setFriends] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const { user } = useUser();
  const [receivedInvitation, setReceivedInvitation] = useState({
    open: false,
    inviterName: "",
    senderId: "",
    lobbyCode: "",
  });
  const [directSocket, setDirectSocket] = useState<any>(null);

  useEffect(() => {
    console.log(lobbyCode, inviterName, senderId)
    const fetchFriends = async () => {
      if (!user?.firebase_uid || !open) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/lobby/invite-friends/${user.firebase_uid
          }`
        );

        // Map the response data to match the Player interface
        const formattedFriends: Player[] = (response.data as { data: any[] }).data.map(
          (friend: any) => ({
            firebase_uid: friend.firebase_uid,
            username: friend.username,
            level: friend.level || 1,
            display_picture: friend.display_picture,
          })
        );

        setFriends(formattedFriends);
        setError(null);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError("Failed to load friends list");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user?.firebase_uid, open]);

  useEffect(() => {
    if (!user?.firebase_uid || !open) return;

    console.log("🔌 Setting up direct socket connection for invitations");

    // Create direct socket connection similar to DirectSocketDebug
    const newSocket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
      transports: ["websocket"],
      reconnection: true
    });

    newSocket.on('connect', () => {
      console.log(`Direct invitation socket connected: ${newSocket.id}`);
      newSocket.emit('setup', user.firebase_uid);
    });

    // Listen directly for battle invitations
    newSocket.on('battle_invitation', (data) => {
      console.group("🔔 Direct Invitation Received");
      console.log("Raw invitation data:", data);

      // Skip if it's our own invitation
      if (data.senderId === user.firebase_uid) {
        console.log("Ignoring our own invitation");
        console.groupEnd();
        return;
      }

      // Log the complete data structure
      console.log("Complete invitation data structure:", JSON.stringify(data));

      // Set the invitation data with all fields explicitly
      setReceivedInvitation({
        open: true,
        inviterName: data.senderName || "Unknown Player",
        senderId: data.senderId,
        lobbyCode: data.lobbyCode,
      });

      console.log("Invitation state set with complete data");
      console.groupEnd();
    });

    setDirectSocket(newSocket);

    return () => {
      console.log("Cleaning up direct invitation socket");
      newSocket.disconnect();
    };
  }, [user?.firebase_uid, open]);

  useEffect(() => {
    if (!user?.firebase_uid) return;

    const socketService = SocketService.getInstance();

    // Handle receiving invitations
    const handleBattleInvitation = (data: any) => {
      console.group("🔔 Service Invitation Received");
      console.log("Data via SocketService:", data);
      console.groupEnd();

      // We'll let the direct socket handle the actual state update
    };

    // Register the handler
    const removeListener = socketService.on("battle_invitation", handleBattleInvitation);

    return () => {
      if (removeListener) removeListener();
    };
  }, [user?.firebase_uid]);

  const handleInvite = async (friend: any) => {
    if (!user) {
      console.error("Cannot send invitation: User is not logged in");
      return;
    }

    try {
      setInviting(true);

      // Create explicit invitation data
      const invitationData = {
        senderId: user.firebase_uid,
        senderName: user.username || inviterName || "Unknown Player",
        receiverId: friend.firebase_uid,
        lobbyCode: lobbyCode
      };

      console.log("Sending battle invitation with data:", invitationData);

      // Send via SocketService
      const socket = SocketService.getInstance().getSocket();
      if (socket) {
        socket.emit("notify_battle_invitation", invitationData);
        console.log("Invitation sent via SocketService");
      }

      // Also send via direct socket for redundancy
      if (directSocket && directSocket.connected) {
        directSocket.emit("notify_battle_invitation", invitationData);
        console.log("Invitation sent via direct socket");
      }

      // Close the modal and trigger success callback with complete invitation data
      handleClose();
      onInviteSuccess(friend, {
        senderId: invitationData.senderId,
        senderName: invitationData.senderName,
        receiverId: friend.firebase_uid,
        receiverName: friend.username,
        lobbyCode: invitationData.lobbyCode,
        status: "pending"
      });

    } catch (error) {
      console.error("Error inviting player:", error);
    } finally {
      setInviting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <Box className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        {/* Backdrop */}
        <Box className="absolute inset-0" onClick={handleClose}></Box>

        {/* Modal */}
        <div
          className="bg-[#080511] border-[#3B354D] border rounded-[1rem] w-[679px] h-[529px] p-5 sm:p-5 md:p-9 relative flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Tooltip title="Close" enterDelay={100} arrow>
            <IconButton
              onClick={handleClose}
              className="self-end hover:scale-110 transition-all duration-300"
            >
              <CloseIcon className="text-[#6F658D]" fontSize="large" />
            </IconButton>
          </Tooltip>

          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <img src={InviteFriendList} alt="Invite Icon" className="w-16" />
          </div>
          <Typography variant="h6" className="text-white text-center mb-4">
            Invite Friends
          </Typography>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-center mb-4">
              {error}
            </div>
          )}

          {/* Friend List */}
          <div
            className="flex flex-col items-center mt-5 mb-5"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {loading ? (
              <div className="text-white">Loading...</div>
            ) : friends.length === 0 ? (
              <div className="text-white">No friends found</div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.firebase_uid}
                  className="p-3 rounded-md w-[550px] flex justify-between items-center mb-2"
                >
                  <div className="flex items-center">
                    <img
                      src={friend.display_picture || ProfileIcon}
                      alt="Avatar"
                      className="w-14 h-14 rounded-[5px] mr-4 hover:scale-110 transition-all duration-300"
                    />
                    <div>
                      <Typography className="text-white">
                        {friend.username}
                      </Typography>
                      <Typography sx={{ color: "white", fontSize: "0.835rem" }}>
                        LVL {friend.level}
                      </Typography>
                    </div>
                  </div>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#57A64E",
                      "&:disabled": {
                        backgroundColor: "#2E5428",
                        color: "#A0A0A0"
                      }
                    }}
                    disabled={inviting}
                    onClick={() => handleInvite(friend)}
                  >
                    {inviting ? "SENDING..." : "INVITE"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Box>

      {/* Replace InvitationSnackbar with custom implementation */}
      {receivedInvitation.open && (
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
              onClose={() => setReceivedInvitation(prev => ({ ...prev, open: false }))}
              sx={{
                width: "100%",
                minWidth: '300px',
                boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
                border: '2px solid #4D1EE3'
              }}
            >
              <AlertTitle>Battle Invitation</AlertTitle>
              <strong>{receivedInvitation.inviterName}</strong> has invited you to battle!
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => {
                    console.log("Accepting invitation with data:", receivedInvitation);
                    if (onInvitationAccepted) {
                      onInvitationAccepted(receivedInvitation.lobbyCode);
                    }
                    setReceivedInvitation(prev => ({ ...prev, open: false }));
                  }}
                  sx={{ fontWeight: 'bold' }}
                >
                  Accept
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => setReceivedInvitation(prev => ({ ...prev, open: false }))}
                  sx={{ fontWeight: 'bold' }}
                >
                  Decline
                </Button>
              </Box>
            </Alert>
          </div>
        </div>
      )}
    </>
  );
};

export default InvitePlayerModal;