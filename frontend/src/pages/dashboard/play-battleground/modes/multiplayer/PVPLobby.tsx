import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { PvPLobbyProvider, usePvPLobby } from "../../../../../contexts/PvpLobbyContext";
import { usePvPGameStart } from "../../../../../hooks/usePvPGameStart";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ContentCopy, CheckCircle, Add } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";
import VisibilityIcon from "@mui/icons-material/Visibility";
import QuestionTypeModal from "../../../../../components/modals/QuestionTypeModal";
import ManaIcon from "../../../../../assets/ManaIcon.png";
import DefaultProfilePicture from "../../../../../assets/profile-picture/bunny-picture.png";
import InvitePlayerModal from "../../components/modal/InvitePlayerModal";
import { useUser } from "../../../../../contexts/UserContext";
import "./../../styles/setupques.css";
import SelectStudyMaterialModal from "../../../../../components/modals/SelectStudyMaterialModal";

// Content component that uses the PvPLobby context
const PVPLobbyContent: React.FC = () => {
  const { lobbyState, updateQuestionTypes, setPlayerReady, refreshLobbyData, leaveLobby, updateStudyMaterial } = usePvPLobby();
  const { startGame, isStarting } = usePvPGameStart();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
 
  // Local UI state
  const [showQuestionTypeModal, setShowQuestionTypeModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedTypesFinal, setSelectedTypesFinal] = useState<string[]>([]);
  const [manaPoints, setManaPoints] = useState(40); // Example starting mana points
  const [openManaAlert, setOpenManaAlert] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [readyStateLoading, setReadyStateLoading] = useState(false);
  const [invitedPlayerStatus, setInvitedPlayerStatus] = useState({
    isPending: false,
    invitedAt: new Date()
  });
  const [openMaterialModal, setOpenMaterialModal] = useState(false);
  
  // Use refs to track the last update time to debounce UI updates
  const lastUpdateRef = useRef<number>(Date.now());
  
  // Mapping for question type displays
  const questionTypes = [
    { display: "Identification", value: "identification" },
    { display: "Multiple Choice", value: "multiple-choice" },
    { display: "True or False", value: "true-false" },
  ];

  // Debounced ready state update
  const handleReadyStateChange = useCallback(async (isReady: boolean) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 500) {
      console.log("Debouncing ready state change");
      return;
    }

    setReadyStateLoading(true);
    lastUpdateRef.current = now;
    
    try {
      await setPlayerReady(isReady);
    } catch (error) {
      console.error("Error updating ready state:", error);
    } finally {
      setReadyStateLoading(false);
    }
  }, [setPlayerReady]);
  
  // Sync with context when it updates
  useEffect(() => {
    if (lobbyState.questionTypes.length > 0) {
      setSelectedTypesFinal(lobbyState.questionTypes);
    }
  }, [lobbyState.questionTypes]);
  
  // Poll for lobby updates every 5 seconds as a fallback
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!lobbyState.isSocketConnected) {
        refreshLobbyData();
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [lobbyState.isSocketConnected, refreshLobbyData]);
  
  // Navigate to battle screen if lobby status changes to in_progress
  useEffect(() => {
    if (lobbyState.lobbyStatus === 'in_progress') {
      navigate(`/dashboard/pvp-battle/${lobbyState.lobbyCode}`, {
        state: {
          lobbyCode: lobbyState.lobbyCode,
          isHost: lobbyState.isCurrentUserHost,
          hostId: lobbyState.host?.firebase_uid,
          guestId: lobbyState.guest?.firebase_uid,
          hostUsername: lobbyState.host?.username,
          guestUsername: lobbyState.guest?.username,
          questionTypes: lobbyState.questionTypes,
          material: lobbyState.studyMaterial
        }
      });
    }
  }, [lobbyState.lobbyStatus, navigate, lobbyState]);
  
  // Copy lobby code to clipboard
  const handleCopy = () => {
    navigator.clipboard
      .writeText(lobbyState.lobbyCode)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 5000);
      })
      .catch(() => {
        setCopySuccess(false);
      });
  };

  // Handle question type changes
  const handleQuestionTypeUpdate = (types: string[]) => {
    setSelectedTypesFinal(types);
    updateQuestionTypes(types);
    setShowQuestionTypeModal(false);
  };
  
  // Handle start game button click
  const handleBattleStart = async () => {
    if (!lobbyState.host || !lobbyState.guest || !lobbyState.studyMaterial) return;
    
    if (!lobbyState.isCurrentUserHost) {
      // Guest is toggling ready state
      handleReadyStateChange(!lobbyState.guest.isReady);
      return;
    }
    
    // Host is starting the game
    if (!lobbyState.guest.isReady) {
      return; // Can't start if guest isn't ready
      }

      if (manaPoints < 10) {
        setOpenManaAlert(true);
        return;
      }

    const result = await startGame({
      lobbyCode: lobbyState.lobbyCode,
      hostId: lobbyState.host.firebase_uid,
      guestId: lobbyState.guest.firebase_uid,
      hostUsername: lobbyState.host.username,
      guestUsername: lobbyState.guest.username,
      questionTypes: lobbyState.questionTypes,
      studyMaterialId: lobbyState.studyMaterial.id,
      studyMaterialTitle: lobbyState.studyMaterial.title
    });
    
    if (result.success) {
          setManaPoints((prev) => prev - 10);
      navigate(`/dashboard/pvp-battle/${lobbyState.lobbyCode}`, {
        state: result.gameData
      });
    }
  };

  // Handle invite friends
  const handleInviteFriends = () => {
    setShowInviteModal(true);
  };
  
 
const handleBackClick = () => {
  setOpenDialog(true);
};

const handleConfirmLeave = () => {
  setOpenDialog(false);
  leaveLobby(); // Call the new leaveLobby function
};
  
  // Cancel navigation
  const handleCancelLeave = () => {
    setOpenDialog(false);
  };
  
  // Handle study material change
  const handleChangeMaterial = () => {
    setOpenMaterialModal(true);
  };
  
  // Handle invite player
  const handleInvite = (friend: any) => {
      setInvitedPlayerStatus({
        isPending: true,
        invitedAt: new Date()
      });

    // In the original implementation, this would also trigger the socket event
    console.log("Inviting player:", friend);
  };
  
  // Add handleMaterialSelect function
  const handleMaterialSelect = async (material: any) => {
    try {
      console.log("Selected material:", material);

      // Format the material object to match the StudyMaterial interface
      const formattedMaterial = {
        id: material.id || material.study_material_id,
        study_material_id: material.study_material_id || material.id,
        title: material.title
      };

      // Call the updateStudyMaterial function from context
      await updateStudyMaterial(formattedMaterial);

      // Close the modal
      setOpenMaterialModal(false);
    } catch (error) {
      console.error("Error updating study material:", error);
    }
  };
  
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white px-6 py-8 overflow-hidden">
      {/* Full-Width Fixed Header */}
      <motion.div
        className="absolute top-0 left-0 w-full sm:px-8 md:px-16 lg:px-32 px-12 mt-5 py-12 flex justify-between items-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
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
              {lobbyState.isCurrentUserGuest ? "LOBBY" : "PVP LOBBY"}
            </h2>
            <h6 className="text-[14px] text-gray-300 mb-1">
              {lobbyState.isCurrentUserGuest ? "Host selected: " : ""}
              {lobbyState.questionTypes.map((type, index) => {
                const displayType = questionTypes.find(qt => qt.value === type)?.display || type;
                return (
                  <span key={type}>
                    {index > 0 ? ', ' : ''}
                    {displayType}
                  </span>
                );
              })}
            </h6>
            <p className="text-[12px] sm:text-[14px] text-gray-400 flex items-center">
              {lobbyState.isCurrentUserGuest ? "Host's Study Material: " : "Chosen Study Material: "}&nbsp;
              <span className="font-bold text-white">
                {lobbyState.studyMaterial
                  ? lobbyState.studyMaterial.title || "Loading material..."
                  : lobbyState.isCurrentUserGuest
                    ? "Waiting for host's material..."
                    : "Choose Study Material"}
              </span>
              {!lobbyState.isCurrentUserGuest && (
                <span className="transition-colors duration-200">
                  <CachedIcon
                    sx={{
                      color: "#6F658D",
                      marginLeft: "8px",
                      fontSize: "22px",
                      cursor: "pointer",
                      "&:hover": { color: "#4B17CD" },
                    }}
                    onClick={handleChangeMaterial}
                  />
                </span>
              )}
              {lobbyState.isCurrentUserGuest && (
                <span className="ml-2 text-[12px] text-purple-300">
                  (Guest mode)
                </span>
              )}
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
            onClick={() => lobbyState.isCurrentUserHost && setShowQuestionTypeModal(true)}
            disabled={!lobbyState.isCurrentUserHost}
            sx={{
              cursor: lobbyState.isCurrentUserHost ? "pointer" : "not-allowed",
              backgroundColor: lobbyState.isCurrentUserHost ? "#3d374d" : "#2a2532",
              opacity: lobbyState.isCurrentUserHost ? 1 : 0.7,
              "&:hover": {
                backgroundColor: lobbyState.isCurrentUserHost ? "#4B17CD" : "#2a2532",
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
            {/* Player 1 (Host) */}
            <motion.div
              className="flex flex-col ml-[-250px] mr-[210px] items-center"
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {lobbyState.isCurrentUserGuest ? (
                // Show the host info when current user is a guest
                <>
                  <img
                    src={lobbyState.host?.display_picture || DefaultProfilePicture}
                    alt="Host Avatar"
                    className="w-16 h-16 sm:w-[185px] sm:h-[185px] mt-5 rounded-md"
                  />
                  <p className="text-sm sm:text-base font-semibold mt-5">
                    {lobbyState.host?.username || "Host"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    LVL {lobbyState.host?.level || "??"}
                  </p>
                </>
              ) : (
                // Show the current user as Player 1 when they are the host
                <>
                  <img
                    src={user?.display_picture || DefaultProfilePicture}
                    alt="Player Avatar"
                    className="w-16 h-16 sm:w-[185px] sm:h-[185px] mt-5 rounded-md"
                  />
                  <p className="text-sm sm:text-base font-semibold mt-5">
                    {user?.username || "Player 1"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    LVL {user?.level || 1}
                  </p>
                </>
              )}
            </motion.div>

            {/* VS Text with Double Impact Animation */}
            <motion.span
              className="text-xl mt-14 sm:text-2xl md:text-[70px] font-bold text-[#4D18E8]"
              style={{ WebkitTextStroke: "1px #fff" }}
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: 1,
                scale: [1.5, 2, 1],
              }}
              transition={{
                duration: 1,
                ease: "easeInOut",
              }}
            >
              VS
            </motion.span>

            {/* Player 2 */}
            <motion.div
              className="flex flex-col mr-[-250px] ml-[210px] items-center"
              onClick={() => {
                if (!lobbyState.isCurrentUserGuest && !lobbyState.guest) {
                  handleInviteFriends();
                }
              }}
            >
              {lobbyState.isCurrentUserGuest ? (
                // Show the current user as Player 2 when they are the guest
                <>
                  <img
                    src={user?.display_picture || DefaultProfilePicture}
                    alt="Player Avatar"
                    className="w-16 h-16 sm:w-[185px] sm:h-[185px] mt-5 rounded-md"
                  />
                  <p className="text-sm sm:text-base font-semibold mt-5">
                    {user?.username || "Player 2"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    LVL {user?.level || 1}
                  </p>
                </>
              ) : (
                // Show the guest info when current user is the host
                <div className="relative">
                  {/* Player 2 Info */}
                  {lobbyState.guest ? (
                    <>
                      <motion.div
                        className={`relative w-16 h-16 sm:w-[185px] sm:h-[185px] mt-5 rounded-md ${
                          lobbyState.guestConnectionStatus === 'disconnected' ? 'overflow-hidden' : ''
                        }`}
                        initial={{ opacity: 1, scale: 1 }}
                        animate={
                          lobbyState.guestConnectionStatus === 'disconnected' 
                            ? { 
                                opacity: [0.7, 1, 0.7], 
                                scale: [0.98, 1.02, 0.98],
                                boxShadow: ['0 0 0 rgba(255, 0, 0, 0.4)', '0 0 20px rgba(255, 0, 0, 0.6)', '0 0 0 rgba(255, 0, 0, 0.4)']
                              } 
                            : { opacity: 1, scale: 1 }
                        }
                        transition={
                          lobbyState.guestConnectionStatus === 'disconnected'
                            ? {
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }
                            : { duration: 0.5 }
                        }
                      >
                        <img
                          src={lobbyState.guest.display_picture || DefaultProfilePicture}
                          alt="Guest Avatar"
                          className="w-full h-full rounded-md"
                        />
                        
                        {/* Connection lost overlay */}
                        {lobbyState.guestConnectionStatus === 'disconnected' && (
                          <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="bg-black bg-opacity-70 px-3 py-1 rounded-md text-red-500 text-sm font-bold"
                            >
                              Connection Lost
                            </motion.div>
                          </div>
                        )}
                      </motion.div>
                      
                      <p className="text-sm sm:text-base font-semibold mt-5 flex items-center justify-center">
                        {lobbyState.guest.username}
                        {lobbyState.guestConnectionStatus === 'disconnected' && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="ml-2 text-red-500"
                          >
                            •
                          </motion.span>
                        )}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        LVL {lobbyState.guest.level}
                      </p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        className="w-16 h-16 sm:w-[185px] sm:h-[185px] mt-5 bg-white rounded-md flex items-center justify-center"
                        initial={{ opacity: 0.7 }}
                        animate={
                          invitedPlayerStatus.isPending 
                            ? { 
                                opacity: [0.5, 0.7, 0.5], 
                                scale: [0.95, 1.05, 0.95] 
                              } 
                            : { 
                                opacity: 0.7, 
                                scale: 1 
                              }
                        }
                        transition={
                          invitedPlayerStatus.isPending 
                            ? {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              } 
                            : { 
                                duration: 0.5 
                              }
                        }
                      >
                        <Add className="text-gray-500" />
                        
                        {/* Waiting overlay */}
                        {invitedPlayerStatus.isPending && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="bg-black bg-opacity-70 px-3 py-1 rounded-md text-purple-400 text-sm font-bold"
                            >
                              Waiting for player...
            </motion.div>
          </div>
                        )}
                      </motion.div>
                      
                      <div className={`text-center mt-5 ${invitedPlayerStatus.isPending ? 'opacity-80' : ''}`}>
                        <p className="text-sm sm:text-base font-semibold">
                          PLAYER 2
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          LVL ???
                        </p>
                        {invitedPlayerStatus.isPending && (
                          <motion.p 
                            className="text-xs text-purple-400 mt-1"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            Invitation sent
                          </motion.p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Lobby Code Section */}
          {!lobbyState.isCurrentUserGuest && (
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
                {lobbyState.lobbyCode}
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
            onClick={handleBattleStart}
            disabled={readyStateLoading || isStarting}
            className={`mt-6 sm:mt-11 w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] py-2 sm:py-3 
              ${!lobbyState.isCurrentUserGuest && (!lobbyState.guest || !lobbyState.guest.isReady)
                ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a] cursor-not-allowed'
                : lobbyState.isCurrentUserGuest && lobbyState.guest?.isReady
                  ? 'bg-[#E44D4D] hover:bg-[#C03A3A]'
                  : 'bg-[#4D1EE3] hover:bg-purple-800'
              } text-white rounded-lg text-md sm:text-lg shadow-lg transition flex items-center justify-center`}
          >
            {readyStateLoading || isStarting ? (
              <CircularProgress size={24} color="inherit" />
            ) : !lobbyState.isCurrentUserGuest ? (
              <>
                {lobbyState.guest?.isReady ? (
                  <>
                    BATTLE START! -10
                    <img
                      src={ManaIcon}
                      alt="Mana"
                      className="w-4 h-4 sm:w-3 sm:h-3 md:w-5 md:h-5 ml-2 filter invert brightness-0"
                    />
                  </>
                ) : (
                  <>
                    START 1/2
                    {lobbyState.guest ? " (Waiting for guest)" : " (Waiting for player)"}
                  </>
                )}
              </>
            ) : (
              // Guest view
              <>
                {lobbyState.guest?.isReady ? "CANCEL 2/2" : "START 1/2"}
              </>
            )}
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

      {/* Question Type Selection Modal */}
      <QuestionTypeModal
        open={showQuestionTypeModal}
        onClose={() => setShowQuestionTypeModal(false)}
        selectedTypes={selectedTypesFinal}
        onTypesChange={handleQuestionTypeUpdate}
        isHost={lobbyState.isCurrentUserHost}
      />

      {/* Invite Player Modal */}
      {showInviteModal && (
        <InvitePlayerModal
          open={showInviteModal}
          handleClose={() => setShowInviteModal(false)}
          onInviteSuccess={handleInvite}
          lobbyCode={lobbyState.lobbyCode}
          inviterName={user?.username ?? undefined}
          senderId={user?.firebase_uid}
          selectedTypesFinal={selectedTypesFinal}
          selectedMaterial={lobbyState.studyMaterial ? {
            id: lobbyState.studyMaterial.id || "",
            title: lobbyState.studyMaterial.title
          } : null}
        />
      )}

       {/* Select Study Material Modal */}
<SelectStudyMaterialModal
  open={openMaterialModal}
  handleClose={() => setOpenMaterialModal(false)}
  mode="PvP Mode"
  isLobby={true} // Add this prop to indicate we're in a lobby context
  onMaterialSelect={handleMaterialSelect}
  onModeSelect={() => {}} // Empty function since we don't need mode selection
  selectedTypes={lobbyState.questionTypes}
/>
    </div>
  );
};

// Main component that wraps the content with the provider
const PVPLobby: React.FC = () => {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  
  if (!lobbyCode) {
    return <div>Invalid lobby code</div>;
  }
  
  return (
    <PvPLobbyProvider initialLobbyCode={lobbyCode}>
      <PVPLobbyContent />
    </PvPLobbyProvider>
  );
};

export default PVPLobby;