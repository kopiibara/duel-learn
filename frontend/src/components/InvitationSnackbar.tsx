import React, { useEffect } from "react";
import { Snackbar, Button, Stack, Alert, AlertTitle, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

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
  console.log("InvitationSnackbar render:", {
    open,
    inviterName,
    timestamp: new Date().toISOString(),
  });

  return (
    <Snackbar
      open={open}
      autoHideDuration={null}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      onClose={onClose}
    >
      <Alert severity="info" onClose={onClose} sx={{ width: "100%" }}>
        <AlertTitle>Battle Invitation</AlertTitle>
        {inviterName} has invited you to battle!
        <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={onAccept}
          >
            Accept
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={onDecline}
          >
            Decline
          </Button>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default InvitationSnackbar;
