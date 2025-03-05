import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { motion } from "framer-motion"; // Import motion from framer-motion
import "./../../styles/setupques.css";
import ManaIcon from "../../../../../assets/ManaIcon.png";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ContentCopy, CheckCircle, Add } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SelectStudyMaterialModal from "../../../../../components/modals/SelectStudyMaterialModal"; // Import the modal
import QuestionTypeSelectionModal from "../../components/modal/QuestionTypeSelectionModal";
import InvitePlayerModal from "../../components/modal/InvitePlayerModal"; // Import the new modal
import { useUser } from "../../../../../contexts/UserContext"; // Import the useUser hook
import { generateCode } from "../../utils/codeGenerator"; // Import the utility function
import defaultAvatar from "../../../../../assets/profile-picture/bunny-picture.png";

interface Player {
  id: number;
  name: string;
  level: number;
  profilePicture: string;
}

const PVPLobby: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, material, selectedTypes } = location.state || {};
  console.log(
    "Mode:",
    mode,
    "Material:",
    material,
    "Selected Types:",
    selectedTypes
  );

  const questionTypes = [
    { display: "Identification", value: "identification" },
    { display: "Multiple Choice", value: "multiple-choice" },
    { display: "True or False", value: "true-false" },
  ];

  const { user } = useUser(); // Get the user from UserContext

  const [manaPoints, setManaPoints] = useState(0); // Example starting mana points
  const [_openManaAlert, setOpenManaAlert] = useState(false); // State for the mana points alert
  const [openDialog, setOpenDialog] = useState(false); // State to control the modal
  const [copySuccess, setCopySuccess] = useState(false); // To track if the text was copied

  const [modalOpenChangeQuestionType, setModalOpenChangeQuestionType] =
    useState(false); // State for the ChoosePvPModeModal
  const [selectedTypesFinal, setSelectedTypesFinal] =
    useState<string[]>(selectedTypes);

  // State to manage selected material and mode
  const [selectedMaterial, setSelectedMaterial] = useState<any>(material);
  const [selectedMode, setSelectedMode] = useState<string | null>(mode);
  const [openMaterialModal, setOpenMaterialModal] = useState(false);

  // State to manage FriendListModal

  // State for invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false); // State for the invite modal
  const [selectedPlayer, setSelectedPlayer] = useState<string>(""); // State for the selected player name

  const [players, setPlayers] = useState<Player[]>([]); // Initialize players state as an empty array
  const [invitedPlayer, setInvitedPlayer] = useState<Player | null>(null); // State for the invited player

  // State to hold the generated code
  const [lobbyCode, setLobbyCode] = useState<string>("");

  // useEffect to generate the code when the component mounts
  useEffect(() => {
    const code = generateCode(6); // Generate a 6-character code
    setLobbyCode(code); // Set the generated code to state
  }, []);

  // Set the state variables
  useEffect(() => {
    if (mode) {
      setSelectedMode(mode);
    }
    if (material) {
      setSelectedMaterial(material);
    }
    if (selectedTypes) {
      setSelectedTypesFinal(selectedTypes);
    }
  }, [mode, material, selectedTypes]);

  // Simulate fetching player data (replace with your actual API call)
  useEffect(() => {
    const fetchPlayerData = async () => {
      console.log("User Data:", user);
      const fetchedPlayers: Player[] = [
        {
          id: 1,
          name: user?.username || "Player 1",
          level: user?.level || 1,
          profilePicture: user?.display_picture || defaultAvatar,
        },
      ];
      setPlayers(fetchedPlayers);
    };

    fetchPlayerData();
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText("641283") // Text to be copied
      .then(() => {
        setCopySuccess(true); // Set success to true
        // Reset the icon back to ContentCopy after 5 seconds
        setTimeout(() => {
          setCopySuccess(false); // Reset state after 5 seconds
        }, 5000);
      })
      .catch(() => {
        setCopySuccess(false); // In case of error
      });
  };

  // Open the confirmation dialog
  const handleBackClick = () => {
    setOpenDialog(true); // Show the modal on back button click
  };

  // Confirm navigation
  const handleConfirmLeave = () => {
    setOpenDialog(false); // Close the modal
    navigate("/dashboard/home"); // Navigate to the home page
  };

  // Cancel navigation
  const handleCancelLeave = () => {
    setOpenDialog(false); // Close the modal if canceled
  };

  const handleBattleStart = () => {
    if (manaPoints < 10) {
      setOpenManaAlert(true);
    } else {
      setManaPoints((prev) => prev - 10); // Deduct mana points
      console.log("Battle Started!");
    }
  };

  const handleChangeMaterial = () => {
    setOpenMaterialModal(true); // Open the SelectStudyMaterialModal directly
  };

  const handleMaterialSelect = (material: any) => {
    console.log("Material Selected:", material); // Debugging log
    setSelectedMaterial(material); // Update selected material
    setOpenMaterialModal(false); // Close the modal
  };

  const handleModeSelect = (mode: string) => {
    console.log("Mode Selected:", mode); // Debugging log
    setSelectedMode(mode); // Update selected mode
  };

  const handleChangeQuestionType = () => {
    setModalOpenChangeQuestionType(true);
  };

  const handleInvite = (friend: Player) => {
    setInvitedPlayer(friend); // Set the invited player
    setPlayers((prev) => [...prev, friend]); // Add the invited player to the players list
  };

  const isHost = user?.username === players[1]?.name; // Determine if the current user is the host

  // State to track readiness
  const [isHostReady, _setIsHostReady] = useState(true); // Host is automatically ready
  const [isPlayer2Ready, setIsPlayer2Ready] = useState(false); // Player 2 starts as not ready

  const handleReadyToggle = () => {
    if (!isHost) {
      setIsPlayer2Ready((prev) => !prev); // Toggle readiness for Player 2
    }
  };

  const bothReady = isHostReady && isPlayer2Ready; // Check if both players are ready

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white px-6 py-8 overflow-hidden">
      {/* Full-Width Fixed Header */}
      <motion.div
        className="absolute top-0 left-0 w-full sm:px-8 md:px-16 lg:px-32 px-12 mt-5 py-12 flex justify-between items-center"
        initial={{ opacity: 0, y: -50 }} // Initial position off-screen
        animate={{ opacity: 1, y: 0 }} // Animate to visible and on-screen
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <IconButton
            className="text-gray-300"
            style={{
              border: "2px solid #6F658D",
              borderRadius: "50%",
              padding: "4px",
              color: "#6F658D",
            }}
            onClick={handleBackClick}
          >
            <ArrowBackIcon />
          </IconButton>

          <div>
            <h2 className="text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-semibold mb-1">
              {selectedMode} LOBBY
            </h2>
            <h6>{selectedTypesFinal} QuestionTypes </h6>
            <p className="text-[12px] sm:text-[14px] text-gray-400 flex items-center">
              Chosen Study Material:&nbsp;
              <span className="font-bold text-white">
                {selectedMaterial
                  ? selectedMaterial.title
                  : "Choose Study Material"}
              </span>
              <span className="transition-colors duration-200">
                <CachedIcon
                  sx={{
                    color: "#6F658D",
                    marginLeft: "8px",
                    fontSize: "22px",
                    cursor: isHost ? "pointer" : "not-allowed", // Change cursor based on host status
                    "&:hover": isHost ? { color: "#4B17CD" } : {},
                  }}
                  onClick={isHost ? handleChangeMaterial : undefined} // Disable click for Player 2
                />
              </span>
              <span className="transition-colors duration-200">
                <VisibilityIcon
                  sx={{
                    color: "#6F658D",
                    marginLeft: "6px",
                    fontSize: "20px",
                    cursor: "pointer",
                    "&:hover": { color: "#4B17CD" },
                  }}
                />
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="contained"
            className="bg-[#3d374d] text-white"
            onClick={handleChangeQuestionType} // Only enabled for the host
            sx={{
              cursor: isHost ? "pointer" : "not-allowed", // Change cursor based on host status
              backgroundColor: "#3d374d",
              "&:hover": {
                backgroundColor: "#4B17CD",
              },
            }}
          >
            CHANGE QUESTION TYPE
          </Button>

          <img
            src={ManaIcon}
            alt="Mana"
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 ml-6"
          />
          <span className="text-[14px] sm:text-[16px] text-gray-300 mr-2 sm:mr-3">
            {manaPoints}
          </span>
          <span className="animate-spin text-[14px] sm:text-[16px] text-purple-400">
            ⚙️
          </span>
        </div>
      </motion.div>

      {/* Centered Content Wrapper */}
      <div className="flex-grow flex items-center justify-center w-full">
        <motion.div
          className="paper-container flex flex-col items-center justify-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-center p-6 sm:p-8 rounded-lg shadow-lg"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          {/* Players Section */}
          <div className="flex mt-24 w-full justify-between items-center">
            {/* Player 1 */}
            {players[0] && (
              <motion.div
                className="flex flex-col ml-[-250px] mr-[210px] items-center"
                initial={{ x: -1000 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <img
                  src={user?.display_picture || "default-avatar.png"} // Use a default image if display_picture is not available
                  alt="Player Avatar"
                  className="w-16 h-16 sm:w-[185px] sm:h-[185px] mt-5 rounded-md"
                />
                <p className="text-sm sm:text-base font-semibold mt-5">
                  {user?.username || "Player 1"}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">
                  LVL {user?.level || 11}
                </p>
              </motion.div>
            )}

            {/* VS Text with Double Impact Animation */}
            <motion.span
              className="text-xl mt-14 sm:text-2xl md:text-[70px] font-bold text-[#4D18E8]"
              style={{ WebkitTextStroke: "1px #fff" }}
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: 1,
                scale: [1.5, 2, 1], // Scale up in two phases before returning to normal
              }}
              transition={{
                duration: 1, // The animation lasts for 1.2 seconds
                ease: "easeInOut",
              }}
            >
              VS
            </motion.span>

            {/* Player 2 */}
            <motion.div
              className="flex flex-col mr-[-250px] ml-[210px] items-center"
              initial={{ x: 1000, opacity: 0 }} // Start off-screen and transparent
              animate={{ x: 0, opacity: 1 }} // Animate to on-screen and opaque
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              onClick={() => {
                if (!players[1]) {
                  setSelectedPlayer(""); // Set to empty or a default value
                  setInviteModalOpen(true); // Open the invite modal
                }
              }}
            >
              <div className="w-16 h-16 sm:w-[185px] sm:h-[185px] mt-5 bg-white rounded-md flex items-center justify-center">
                {invitedPlayer ? (
                  <motion.img
                    src={invitedPlayer.profilePicture} // Show the invited player's profile picture
                    alt="Invited Player"
                    className="w-full h-full rounded-md"
                    initial={{ scale: 0, opacity: 0, y: -20 }} // Start small, transparent, and above
                    animate={{ scale: 1, opacity: 1, y: 0 }} // Animate to full size, opaque, and original position
                    transition={{ duration: 0.5 }} // Duration of the animation
                  />
                ) : (
                  <Add className="text-gray-500" />
                )}
              </div>
              <div>
                <motion.p
                  className="text-sm sm:text-base font-semibold mt-5"
                  initial={{ y: -20, opacity: 0 }} // Start above and transparent
                  animate={{ y: 0, opacity: 1 }} // Animate to original position and opaque
                  transition={{ duration: 0.5 }} // Duration of the animation
                >
                  {invitedPlayer
                    ? invitedPlayer.name
                    : players[1]
                    ? players[1].name
                    : "PLAYER 2"}
                </motion.p>
                <motion.p
                  className="text-xs sm:text-sm text-gray-400"
                  initial={{ y: -20, opacity: 0 }} // Start above and transparent
                  animate={{ y: 0, opacity: 1 }} // Animate to original position and opaque
                  transition={{ duration: 0.5 }} // Duration of the animation
                >
                  {invitedPlayer
                    ? `LVL ${invitedPlayer.level}`
                    : players[1] && players[1].level
                    ? `LVL ${players[1].level}`
                    : "LVL ???"}
                </motion.p>
                <motion.p
                  className="text-xs sm:text-sm text-gray-400"
                  initial={{ y: -20, opacity: 0 }} // Start above and transparent
                  animate={{ y: 0, opacity: 1 }} // Animate to original position and opaque
                  transition={{ duration: 0.5 }} // Duration of the animation
                ></motion.p>
              </div>
            </motion.div>
          </div>

          {/* Lobby Code Section */}
          {isHost && ( // Only show lobby code for the host
            <motion.div
              className="flex flex-row mt-24 items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm sm:text-base mr-6 text-white mb-1">
                LOBBY CODE
              </p>
              <div className="bg-white text-black text-sm sm:text-base font-bold px-2 ps-4 py-1 rounded-md flex items-center">
                {lobbyCode} {/* Display the generated lobby code */}
                <IconButton
                  onClick={handleCopy}
                  className="text-gray-500"
                  style={{ fontSize: "16px" }}
                >
                  {copySuccess ? (
                    <CheckCircle fontSize="small" style={{ color: "gray" }} />
                  ) : (
                    <ContentCopy fontSize="small" />
                  )}
                </IconButton>
              </div>
            </motion.div>
          )}

          {/* Battle Start Button */}
          <motion.button
            onClick={
              isHost
                ? bothReady
                  ? handleBattleStart
                  : undefined
                : handleReadyToggle
            } // Host starts battle if both are ready, Player 2 toggles readiness
            className={`mt-6 sm:mt-11 w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] py-2 sm:py-3 bg-[#4D1EE3] text-white rounded-lg text-md sm:text-lg shadow-lg transition flex items-center justify-center ${
              bothReady ? "hover:bg-purple-800" : ""
            }`}
            disabled={isHost ? !bothReady : false} // Disable for host if both are not ready
          >
            {isHost
              ? bothReady
                ? "BATTLE START! -10"
                : "START 1/2"
              : isPlayer2Ready
              ? "CANCEL 2/2"
              : "START 1/2"}
            <img
              src={ManaIcon}
              alt="Mana"
              className="w-4 h-4 sm:w-3 sm:h-3 md:w-5 md:h-5 ml-2 filter invert brightness-0"
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <Dialog
        open={openDialog}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#080511", // Set dark background color for the modal itself
            paddingY: "30px", // Adds padding inside the modal
            paddingX: "20px", // Adds padding inside the modal
            paddingRight: "40px", // Adds padding inside the modal
            borderRadius: "10px", // Optional: Rounded corners
          },
          "& .MuiDialog-root": {
            backgroundColor: "transparent", // Ensures the root background is transparent (if needed)
          },
        }}
      >
        <DialogTitle
          id="confirmation-dialog-title"
          className="text-white py-4 px-6"
          sx={{
            backgroundColor: "#080511", // Ensures the title background is dark
          }}
        >
          Are you sure you want to leave?
        </DialogTitle>

        <DialogContent
          className="text-white py-6 px-6"
          sx={{ backgroundColor: "#080511" }}
        >
          <p>
            If you leave, your current progress will be lost. Please confirm if
            you wish to proceed.
          </p>
        </DialogContent>

        <DialogActions className="bg-[#080511]" sx={{ padding: "16px 0" }}>
          <Button
            onClick={handleCancelLeave}
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
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLeave}
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
            Yes, Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* Select Study Material Modal */}
      <SelectStudyMaterialModal
        open={openMaterialModal}
        handleClose={() => setOpenMaterialModal(false)}
        mode={selectedMode} // Pass the selected mode
        isLobby={true} // Indicate that this is being used in the lobby
        onMaterialSelect={handleMaterialSelect} // Pass the selection handler
        onModeSelect={handleModeSelect} // Pass the mode selection handler
        selectedTypes={selectedTypesFinal} // Pass selectedTypes to the modal
      />

      {/* Question Type Selection Modal */}
      <QuestionTypeSelectionModal
        open={modalOpenChangeQuestionType}
        onClose={() => setModalOpenChangeQuestionType(false)}
        selectedTypes={selectedTypesFinal}
        questionTypes={questionTypes}
        onConfirm={(selected: string[]) => {
          setSelectedTypesFinal(selected);
          setModalOpenChangeQuestionType(false);
        }}
      />

      {/* Invite Player Modal */}
      <InvitePlayerModal
        open={inviteModalOpen}
        handleClose={() => setInviteModalOpen(false)}
        playerName={selectedPlayer}
        onInvite={handleInvite} // Pass the invite handler
      />
    </div>
  );
};

export default PVPLobby;
