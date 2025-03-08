import React, { useEffect, useRef, useState } from "react";
import { Button, Box, Alert, AlertTitle, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SocketService from "../services/socketService";
import { useUser } from "../contexts/UserContext";

interface InvitationSnackbarProps {
  open: boolean;
  inviterName: string;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  lobbyCode: string;
  senderId: string;
}

const InvitationSnackbar: React.FC<InvitationSnackbarProps> = ({
  open,
  inviterName,
  onClose,
  onAccept,
  onDecline,
  lobbyCode = "",
  senderId = "",
}) => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const snackbarRef = useRef<HTMLDivElement>(null);
  const [accepting, setAccepting] = useState(false);

  // Check if we're ready to accept invitations
  const userReady = !loading && user?.firebase_uid;

  // Add validation on component mount with loading check
  useEffect(() => {
    if (open) {
      console.log("InvitationSnackbar opened with props:", {
        inviterName,
        lobbyCode,
        senderId,
        userId: user?.firebase_uid,
        userLoading: loading,
        userReady
      });
    }
  }, [open, inviterName, lobbyCode, senderId, user?.firebase_uid, loading, userReady]);

  // Add console group for easier debugging
  console.group("InvitationSnackbar Rendering");
  console.log("Props received:", {
    open,
    inviterName,
    lobbyCode,
    senderId,
  });
  console.log("Default props applied:", {
    lobbyCode: lobbyCode || "[empty]",
    senderId: senderId || "[empty]",
  });
  console.log("User context data:", {
    userId: user?.firebase_uid,
    loading
  });
  console.groupEnd();

  const handleAccept = async () => {
    console.group("InvitationSnackbar - Accept Clicked");

    console.log("Props when accepting:", {
      open,
      inviterName,
      lobbyCode,
      senderId,
    });

    // Check each condition separately
    if (loading) {
      console.error("Cannot accept: User data still loading");
      console.groupEnd();
      return;
    }

    if (!user?.firebase_uid) {
      console.error("Cannot accept: User not authenticated");
      console.groupEnd();
      return;
    }

    if (!senderId) {
      console.error("Cannot accept: Missing sender ID");
      console.groupEnd();
      return;
    }

    if (!lobbyCode) {
      console.error("Cannot accept: Missing lobby code");
      console.groupEnd();
      return;
    }

    console.log("All checks passed, proceeding with acceptance");
    console.groupEnd();

    setAccepting(true);
    console.log("Accepting invitation from:", inviterName, "to lobby:", lobbyCode);

    try {
      // First emit the socket event
      const socket = SocketService.getInstance().getSocket();
      if (!socket) {
        throw new Error("Socket not connected");
      }

      socket.emit("accept_battle_invitation", {
        senderId,
        receiverId: user.firebase_uid,
        lobbyCode,
      });

      // Then update database
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/battle/invite/status`,
        {
          senderId,
          receiverId: user.firebase_uid,
          lobbyCode,
          status: "accepted",
        }
      );

      // Call the onAccept prop from parent to update state
      onAccept();

      // Navigate immediately to the host's lobby
      console.log("Player 2 joining lobby:", lobbyCode);
      navigate(`/dashboard/pvp-lobby/${lobbyCode}`, {
        state: {
          isGuest: true,
          lobbyCode,
        },
      });

    } catch (error) {
      console.error("Error accepting invitation:", error);
      setAccepting(false);
    }
  };

  // Always log render attempts
  console.log("InvitationSnackbar component rendering:", { open, inviterName });

  // Log when open status changes
  useEffect(() => {
    console.log("InvitationSnackbar open status changed:", open);

    if (open) {
      console.log("InvitationSnackbar should be visible now");
      // Force focus on the snackbar for accessibility and to ensure it's in view
      snackbarRef.current?.focus();

      // Make the snackbar appear even if React doesn't re-render properly
      const snackbarElement = snackbarRef.current;
      if (snackbarElement) {
        snackbarElement.style.display = 'block';
      }
    }
  }, [open]);

  // Don't show the invitation if user data isn't loaded yet
  if (loading && open) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <Alert
          severity="info"
          sx={{
            width: "fit-content",
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <CircularProgress size={20} sx={{ mr: 1 }} />
          Loading invitation...
        </Alert>
      </div>
    );
  }

  return (
    <div
      ref={snackbarRef}
      tabIndex={-1} // Make it focusable
      style={{
        position: 'fixed', // Use fixed instead of absolute
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 10000, // Increase to ensure it's above everything
        pointerEvents: 'none', // Let clicks pass through the container
        display: open ? 'block' : 'none', // Control visibility with CSS
      }}
    >
      <div style={{
        width: 'fit-content',
        margin: '16px auto',
        pointerEvents: 'auto' // But make the actual snackbar clickable
      }}>
        <Alert
          severity="info"
          onClose={onClose}
          sx={{
            width: "100%",
            minWidth: '300px',
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
            border: '2px solid #4D1EE3'
          }}
        >
          <AlertTitle>Battle Invitation</AlertTitle>
          <strong>{inviterName}</strong> has invited you to battle!
          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={handleAccept}
              disabled={accepting}
              sx={{ fontWeight: 'bold' }}
            >
              {accepting ? 'Joining...' : 'Accept'}
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={onDecline}
              sx={{ fontWeight: 'bold' }}
            >
              Decline
            </Button>
          </Box>
        </Alert>
      </div>
    </div>
  );
};

export default InvitationSnackbar;