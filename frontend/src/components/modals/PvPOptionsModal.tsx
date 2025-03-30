import React, { useState, useEffect } from "react";
import {
  Box,
  Modal,
  Typography,
  Stack,
  Fade,
  IconButton,
  TextField,
  Button,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ModalFriendList from "../../assets/General/ModalFriendList.png";
import SocketService from "../../services/socketService";
import { useUser } from "../../contexts/UserContext";

interface PvPOptionsModalProps {
  open: boolean;
  handleClose: () => void;
  handleBack?: () => void;
  onCreateLobby: () => void;
  onJoinLobby: (lobbyCode: string) => void;
}

const PvPOptionsModal: React.FC<PvPOptionsModalProps> = ({
  open,
  handleClose,
  handleBack,
  onCreateLobby,
  onJoinLobby,
}) => {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [lobbyCode, setLobbyCode] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [validatingLobby, setValidatingLobby] = useState(false);
  const { user } = useUser();
  
  // Get socket instance
  const socketService = SocketService.getInstance();
  const socket = socketService.getSocket();

  // Listen for lobby validation response
  useEffect(() => {
    if (!socket) return;
    
    const handleLobbyValidationResponse = (data: { 
      exists: boolean, 
      lobbyCode: string, 
      error?: string 
    }) => {
      setValidatingLobby(false);
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.exists && data.lobbyCode === lobbyCode) {
        setIsJoining(true);
        // Proceed with joining the lobby
        onJoinLobby(lobbyCode);
      } else {
        setError("Lobby not found or no longer active");
      }
    };
    
    socket.on("lobbyValidationResponse", handleLobbyValidationResponse);
    
    return () => {
      socket.off("lobbyValidationResponse", handleLobbyValidationResponse);
    };
  }, [socket, lobbyCode, onJoinLobby]);

  const handleCreateLobby = () => {
    onCreateLobby();
  };

  const handleShowJoinForm = () => {
    setShowJoinForm(true);
  };

  const handleJoinSubmit = () => {
    if (!lobbyCode.trim()) {
      setError("Please enter a lobby code");
      return;
    }
    
    // Ensure consistent format - uppercase and trim whitespace
    const formattedLobbyCode = lobbyCode.trim().toUpperCase();
    
    // Validate lobby code format more strictly
    if (!/^[A-Z0-9]{4,6}$/.test(formattedLobbyCode)) {
      setError("Invalid lobby code format. Should be 4-6 alphanumeric characters.");
      return;
    }
    
    if (!user) {
      setError("You must be logged in to join a lobby");
      return;
    }
    
    // First validate if the lobby exists via socket
    setValidatingLobby(true);
    setError("");
    
    // Request lobby validation through socket
    if (socket) {
      socket.emit("validateLobby", {
        lobbyCode: formattedLobbyCode,
        playerId: user.firebase_uid,
        playerName: user.username,
        playerLevel: user.level,
        playerPicture: user.display_picture
      });
    } else {
      setValidatingLobby(false);
      setError("Connection error. Please try again.");
    }
  };

  const handleBackNavigation = () => {
    if (showJoinForm) {
      setShowJoinForm(false);
      setLobbyCode("");
      setError("");
    } else if (handleBack) {
      handleBack();
    } else {
      handleClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "500px" },
            bgcolor: "#120F1B",
            borderRadius: "0.8rem",
            border: "2px solid #3B354D",
            boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: { xs: "20px", sm: "40px" },
            paddingY: { xs: "60px", sm: "40px" },
          }}
        >
          {/* Back button */}
          <IconButton
            aria-label="back"
            onClick={handleBackNavigation}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              color: "#FFFFFF",
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* Close button */}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "#FFFFFF",
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Modal Friend List Image */}
          <Box
            component="img"
            src={ModalFriendList}
            alt="Modal Friend List"
            sx={{
              width: "70px",
              objectFit: "cover",
              borderRadius: "5px 5px 0 0",
              mb: 2,
            }}
          />

          {!showJoinForm ? (
            <>
              {/* Modal Header for Options */}
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "24px", sm: "32px" },
                  color: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                PvP Mode
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#9F9BAE",
                  mb: 5,
                  textAlign: "center",
                  fontSize: { xs: "14px", sm: "16px" },
                }}
              >
                Choose how you want to battle!
              </Typography>

              {/* Options Buttons */}
              <Stack spacing={3} sx={{ width: "80%" }}>
                <Button
                  onClick={handleCreateLobby}
                  sx={{
                    backgroundColor: "#E2DDF3",
                    color: "#303869",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#9F9BAE",
                    },
                  }}
                >
                  Create New Lobby
                </Button>
                <Button
                  onClick={handleShowJoinForm}
                  sx={{
                    backgroundColor: "#E2DDF3",
                    color: "#303869",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#9F9BAE",
                    },
                  }}
                >
                  Join Existing Lobby
                </Button>
              </Stack>
            </>
          ) : (
            <>
              {/* Join Lobby Form */}
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "24px", sm: "32px" },
                  color: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                Join Lobby
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#9F9BAE",
                  mb: 5,
                  textAlign: "center",
                  fontSize: { xs: "14px", sm: "16px" },
                }}
              >
                Enter the lobby code to join a battle
              </Typography>

              <TextField
                fullWidth
                value={lobbyCode}
                onChange={(e) => {
                  setLobbyCode(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="Enter lobby code"
                error={!!error}
                helperText={error}
                disabled={isJoining || validatingLobby}
                sx={{
                  mb: 3,
                  width: "80%",
                  backgroundColor: "#3B354C",
                  borderRadius: "8px",
                  input: { color: "#FFFFFF" },
                  label: { color: "#6F658D" },
                  ".MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  // Error styles
                  ".MuiFormHelperText-root": {
                    color: "#f44336",
                  },
                }}
              />

              <Button
                onClick={handleJoinSubmit}
                disabled={isJoining || validatingLobby}
                sx={{
                  backgroundColor: "#E2DDF3",
                  color: "#303869",
                  fontWeight: "bold",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  width: "80%",
                  "&:hover": {
                    backgroundColor: "#9F9BAE",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#6F658D",
                    color: "#9F9BAE"
                  }
                }}
              >
                {validatingLobby ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isJoining ? (
                  "Joining..."
                ) : (
                  "Join Battle"
                )}
              </Button>
            </>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

export default PvPOptionsModal; 