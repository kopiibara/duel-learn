import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  content,
  onConfirm,
  onCancel,
  confirmText = "Yes, Leave",
  cancelText = "Cancel",
}) => {
  return (
    <Dialog
      open={open}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#080511",
          paddingY: "30px",
          paddingX: "20px",
          paddingRight: "40px",
          borderRadius: "10px",
        },
        "& .MuiDialog-root": {
          backgroundColor: "transparent",
        },
      }}
    >
      <DialogTitle
        id="confirmation-dialog-title"
        className="text-white py-4 px-6"
        sx={{
          backgroundColor: "#080511",
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent
        className="text-white py-6 px-6"
        sx={{ backgroundColor: "#080511" }}
      >
        <p>{content}</p>
      </DialogContent>

      <DialogActions className="bg-[#080511]" sx={{ padding: "16px 0" }}>
        <Button
          onClick={onCancel}
          sx={{
            color: "#B0B0B0",
            py: 1,
            px: 4,
            "&:hover": {
              backgroundColor: "#080511",
              color: "#FFFFFF",
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          autoFocus
          sx={{
            backgroundColor: "#4D1EE3",
            color: "#FFFFFF",
            py: 1,
            px: 4,
            "&:hover": {
              backgroundColor: "#6A3EEA",
              color: "#fff",
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog; 