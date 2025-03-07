import { Popover, Stack, Box, Button, Divider } from "@mui/material";
import { PopoverProps } from "@mui/material";
import { auth } from "../../services/firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-hot-toast";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";

interface ProfilePopoverProps {
  anchorEl: PopoverProps["anchorEl"];
  open: boolean;
  handleClose: () => void;
}

export default function ProfilePopover({
  anchorEl,
  open,
  handleClose,
}: ProfilePopoverProps) {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      setUser(null);
      toast.success("Logged out successfully.");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleSettings = () => {
    navigate("/dashboard/account-settings");
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          backgroundColor: "#120F1B", // Dark background
          borderRadius: "0.8rem",
          width: "16rem", // Set width of the popover
          padding: 2, // Adjust padding inside the popover
          mt: 1, // Space between the popover and profile button
        },
      }}
    >
      <Box sx={{ width: 220 }}>
        <Stack spacing={1}>
          <Button
            variant="text"
            onClick={handleSettings}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: "inherit",
              fontWeight: 400,
              borderRadius: "0.8rem",
              padding: "0.6rem 1rem",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "#3B354C",
              },
            }}
          >
            Settings
          </Button>
          <Button
            variant="text"
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: "inherit",
              fontWeight: 400,
              borderRadius: "0.8rem",
              padding: "0.6rem 1rem",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "#3B354C",
              },
            }}
          >
            Go Premium
          </Button>
          <Button
            variant="text"
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: "inherit",
              fontWeight: 400,
              borderRadius: "0.8rem",
              padding: "0.6rem 1rem",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "#3B354C",
              },
            }}
            onClick={() => window.open("/privacy-policy", "_blank")}
          >
            Privacy Policy
          </Button>
          <Button
            variant="text"
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: "inherit",
              fontWeight: 400,
              borderRadius: "0.8rem",
              padding: "0.6rem 1rem",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "#3B354C",
              },
            }}
          >
            Help and Feedback
          </Button>
          {/* Divider with more space above */}
          <Divider sx={{ mt: 3, mb: 2, backgroundColor: "#444" }} />
          <Button
            variant="text"
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: "inherit",
              fontWeight: 400,
              borderRadius: "0.8rem",
              padding: "0.6rem 1rem",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "#3B354C",
              },
            }}
            onClick={() => navigate("/dashboard/verify-email")}
          >
            Verify Email
          </Button>
          <Button
            variant="text"
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: "inherit",
              fontWeight: 400,
              borderRadius: "0.8rem",
              padding: "0.6rem 1rem",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "#3B354C",
              },
            }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
}
