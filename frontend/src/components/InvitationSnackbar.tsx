import React, { useEffect, useRef } from "react";
import { Snackbar, Button, Box, Alert, AlertTitle } from "@mui/material";

interface InvitationSnackbarProps {
  open: boolean;
  inviterName: string;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

const InvitationSnackbar: React.FC<InvitationSnackbarProps> = ({
  open,
  inviterName,
  onClose,
  onAccept,
  onDecline,
}) => {
  const snackbarRef = useRef<HTMLDivElement>(null);

  // Log whenever open status changes
  useEffect(() => {
    console.log("InvitationSnackbar open status changed:", open);

    if (open) {
      console.log("InvitationSnackbar should be visible now");
      // Force focus on the snackbar for accessibility and to ensure it's in view
      snackbarRef.current?.focus();
    }
  }, [open]);

  // Don't render at all if not open
  if (!open) return null;

  console.log("Rendering InvitationSnackbar with:", { inviterName });

  return (
    <div
      ref={snackbarRef}
      tabIndex={-1} // Make it focusable
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 9999,
        pointerEvents: 'none' // Let clicks pass through the container
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
              onClick={onAccept}
              sx={{ fontWeight: 'bold' }}
            >
              Accept
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