import React from "react";
import { Snackbar, Button, Stack, Alert, AlertTitle, Box } from "@mui/material";

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
  // More detailed logging for debugging
  console.log("InvitationSnackbar render:", {
    open,
    inviterName,
    hasInviter: Boolean(inviterName),
    timestamp: new Date().toISOString(),
  });

  // Guard clause for empty inviter name
  if (open && !inviterName) {
    console.warn("Warning: InvitationSnackbar opened with empty inviterName");
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={null}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        severity="info"
        onClose={onClose}
        sx={{
          width: "100%",
          border: "1px solid #4D18E8",
          boxShadow: "0 4px 12px rgba(77, 30, 227, 0.4)",
        }}
      >
        <AlertTitle>Battle Invitation</AlertTitle>
        <strong>{inviterName}</strong> has invited you to battle!
        <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
          >
            Accept
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDecline();
            }}
          >
            Decline
          </Button>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default InvitationSnackbar;
