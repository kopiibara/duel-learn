import React from "react";
import Snackbar from "@mui/material/Snackbar";

type SnackbarProps = {
  message: string;
  open: boolean;
  onClose: () => void;
};

const AutoHideSnackbar: React.FC<SnackbarProps> = ({
  message,
  open,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      message={message}
      //anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        "& .MuiSnackbarContent-root": {
          backgroundColor: "#3B354D", // Dark blue-gray background
          color: "#E2DDF3", // White text
          fontSize: "0.9rem", // Adjust font size
          alignItems: "center",
          justifyContent: "center",
          padding: "0.5rem 2rem",
          borderRadius: "0.8rem",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Add shadow
        },
      }}
    />
  );
};

export default AutoHideSnackbar;
