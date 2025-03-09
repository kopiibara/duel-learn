import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IconButton, TextField, Snackbar, Alert } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#080511",
  border: "none",
  borderRadius: "0.8rem",
  boxShadow: 24,
  p: 4,
};

interface ShareLinkProps {
  open: boolean;
  onClose: () => void;
  studyMaterialId: string;
}

export default function ShareLink({
  open,
  onClose,
  studyMaterialId,
}: ShareLinkProps) {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = `${window.location.origin}/dashboard/study-material/view/${studyMaterialId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  };

  const handleCloseSnackbar = () => {
    setCopied(false);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="share-modal-title"
        aria-describedby="share-modal-description"
      >
        <Box sx={style}>
          <Typography id="share-modal-title" variant="h6" component="h2">
            Share Study Material
          </Typography>
          <Typography id="share-modal-description" sx={{ mt: 2, mb: 2 }}>
            Copy this link to share your study material with others:
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <TextField
              fullWidth
              value={shareUrl}
              variant="outlined"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={handleCopy} edge="end">
                    <ContentCopyIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button onClick={onClose} variant="contained">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
