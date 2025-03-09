import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { io, Socket } from "socket.io-client";
import axios from "axios";
import SocketService from "../../../../../services/socketService";

interface Player {
  firebase_uid: string;
  username: string;
  level: number;
  display_picture: string | null;
}

interface PlayerJoinedData {
  lobbyCode: string;
  playerId: string;
  playerName?: string;
  playerLevel?: number;
  playerPicture?: string | null;
}

interface PlayerReadyData {
  lobbyCode: string;
  playerId: string;
  isReady: boolean;
}

// Add this interface for invited player status
interface InvitedPlayerStatus {
  isPending: boolean;
  invitedAt: Date;
}

const PVPLobby: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, material, selectedTypes, lobbyCode: stateLobbyCode, isGuest } = location.state || {};
  const { lobbyCode: urlLobbyCode } = useParams<{ lobbyCode?: string }>();
  // console.log(
  //   "Mode:",
  //   mode,
  //   "Material:",
  //   material,
  //   "Selected Types:",
  //   selectedTypes
  // );

  const questionTypes = [
    { display: "Identification", value: "identification" },
    { display: "Multiple Choice", value: "multiple-choice" },
    { display: "True or False", value: "true-false" },
  ];

  const { user, loading } = useUser(); // Get the user and loading state from UserContext

  const [manaPoints, setManaPoints] = useState(0); // Example starting mana points
  const [_openManaAlert, setOpenManaAlert] = useState(false); // State for the mana points alert
  const [openDialog, setOpenDialog] = useState(false); // State to control the modal
  const [copySuccess, setCopySuccess] = useState(false); // To track if the text was copied

  const [modalOpenChangeQuestionType, setModalOpenChangeQuestionType] =
    useState(false); // State for the ChoosePvPModeModal
  const [selectedTypesFinal, setSelectedTypesFinal] = useState<string[]>(selectedTypes || []);

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

  // Use URL param first, then state lobby code, then generate new one (only once)
  const [lobbyCode, setLobbyCode] = useState<string>(() => {
    const code = urlLobbyCode || stateLobbyCode || generateCode();
    console.log("Using lobby code:", code, { urlLobbyCode, stateLobbyCode });
    return code;
  });

  // Add this effect to handle lobby code changes
  useEffect(() => {
    if (urlLobbyCode && urlLobbyCode !== lobbyCode) {
      setLobbyCode(urlLobbyCode);
      console.log("Updated lobby code from URL:", urlLobbyCode);
    } else if (stateLobbyCode && !urlLobbyCode && stateLobbyCode !== lobbyCode) {
      setLobbyCode(stateLobbyCode);
      console.log("Updated lobby code from state:", stateLobbyCode);
    }
  }, [urlLobbyCode, stateLobbyCode]);

  // Add these states
  const [socket, setSocket] = useState<Socket | null>(null);

  // Add this near the top of your component
  const [debug, setDebug] = useState(false);

  // Add this state to track if current user is a guest (invited player)
  const [isCurrentUserGuest, setIsCurrentUserGuest] = useState<boolean>(isGuest || false);

  // Add state to track invited player status
  const [invitedPlayerStatus, setInvitedPlayerStatus] = useState<InvitedPlayerStatus>({
    isPending: false,
    invitedAt: new Date()
  });

  // Add these state variables near the top of the component
  const [isHostReady, setIsHostReady] = useState(true); // Host is always ready by default
  const [isGuestReady, setIsGuestReady] = useState(false);

  // Set the state variables
  useEffect(() => {
    if (mode) {
      setSelectedMode(mode);
    }
    if (material) {
      setSelectedMaterial(material);
    }

    // Add default question types if they're missing (for guests joining via invitation)
    if (selectedTypes) {
      setSelectedTypesFinal(selectedTypes);
    } else if (location.state?.isGuest) {
      // Guest joining via invitation - set defaults
      setSelectedTypesFinal(['multiple-choice', 'true-false']);
    }
  }, [mode, material, selectedTypes, location.state?.isGuest]);

  // Update the socket effect
  useEffect(() => {
    if (loading || !user?.firebase_uid) {
      console.log("User data not ready yet, waiting...");
      return;
    }

    console.log("Setting up socket service for user:", user.firebase_uid);
    const socketService = SocketService.getInstance();
    const newSocket = socketService.connect(user.firebase_uid);
    setSocket(newSocket);

    // IMPORTANT: Use the service's on method for better reliability
    const handleBattleInvitation = (data: any) => {
      console.group("🔔 PVPLobby - Battle Invitation Received");
      console.log("Raw data:", JSON.stringify(data));

      // Validate user
      if (!user?.firebase_uid) {
        console.log("User not logged in, ignoring invitation");
        console.groupEnd();
        return;
      }

      // Skip our own invitations
      if (data.senderId === user.firebase_uid) {
        console.log("This is our own invitation, ignoring");
        console.groupEnd();
        return;
      }

      // Validate the critical fields
      if (!data.senderId) {
        console.error("⚠️ Missing senderId in battle invitation data!");
        console.groupEnd();
        return;
      }

      if (!data.lobbyCode) {
        console.error("⚠️ Missing lobbyCode in battle invitation data!");
        console.groupEnd();
        return;
      }

      // All checks passed, set the data
      console.group("🔍 Setting invitation data");
      console.log("Raw data from socket:", data);
      console.log("Data structure:", Object.keys(data).join(", "));
      console.log("senderId:", data.senderId, typeof data.senderId);
      console.log("lobbyCode:", data.lobbyCode, typeof data.lobbyCode);

      // First set the data with guaranteed values
      setInvitedPlayer({
        firebase_uid: String(data.senderId || "missing-sender"),
        username: data.senderName || "Unknown Player",
        level: 1, // Assuming a default level
        display_picture: null, // Assuming no display_picture
      });

      console.log("State should be updated with:", {
        senderId: String(data.senderId || "missing-sender"),
        senderName: data.senderName || "Unknown Player",
        lobbyCode: String(data.lobbyCode || "missing-lobby")
      });
      console.groupEnd();

      // Then open the invitation dialog
      setInviteModalOpen(true);

      console.log("Invitation dialog opened");
      console.groupEnd();
    };

    // Register the handler with proper cleanup
    const removeListener = socketService.on("battle_invitation", handleBattleInvitation);

    return () => {
      if (removeListener) removeListener();
      console.log("Cleaned up battle_invitation listener");
    };
  }, [user?.firebase_uid, loading]);

  // Add this effect to handle lobby code from URL
  useEffect(() => {
    if (urlLobbyCode) {
      setLobbyCode(urlLobbyCode);
      // Here you can add logic to fetch lobby data if needed
      console.log("Joined lobby:", urlLobbyCode);
    }
  }, [urlLobbyCode]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(lobbyCode) // Use the actual lobby code instead of hardcoded "641283"
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
    setSelectedMaterial(material);
    setOpenMaterialModal(false);

    // If host, notify guests about the material change
    if (!isCurrentUserGuest && socket && lobbyCode) {
      socket.emit("lobby_material_update", {
        lobbyCode,
        material,
        questionTypes: selectedTypesFinal,
        mode: selectedMode
      });
    }
  };

  const handleModeSelect = (mode: string) => {
    console.log("Mode Selected:", mode); // Debugging log
    setSelectedMode(mode); // Update selected mode
  };

  const handleChangeQuestionType = () => {
    setModalOpenChangeQuestionType(true);
  };

  const handleInvite = async (friend: Player) => {
    if (!socket || !user?.firebase_uid || !user?.username) {
      console.error("Missing required data for invitation");
      return;
    }

    try {
      console.log("Sending invitation to:", friend.username);

      // Set invited player status to pending
      setInvitedPlayerStatus({
        isPending: true,
        invitedAt: new Date()
      });

      // Create the notification data
      const notificationData = {
        senderId: user.firebase_uid,
        senderName: user.username,
        receiverId: friend.firebase_uid,
        lobbyCode: lobbyCode,
        timestamp: new Date().toISOString(),
      };

      // First create database entry
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/battle/pvp-invitation`,
        {
          senderId: user.firebase_uid,
          receiverId: friend.firebase_uid,
          lobbyCode: lobbyCode,
        }
      );

      // Then emit socket event
      console.log("Emitting battle invitation:", notificationData);
      socket.emit("notify_battle_invitation", notificationData);

      // Update local state to show invited player
      setInvitedPlayer(friend);
      setInviteModalOpen(false);
    } catch (error) {
      console.error("Error sending invitation:", error);
      // Reset pending status on error
      setInvitedPlayerStatus({
        isPending: false,
        invitedAt: new Date()
      });
    }
  };

  // Update this based on the new guest logic
  const isHost = !isCurrentUserGuest;

  // Add this effect to handle ready status updates
  useEffect(() => {
    if (!socket || !lobbyCode) return;

    const handlePlayerReadyStatus = (data: { playerId: string; isReady: boolean }) => {
      if (data.playerId === user?.firebase_uid) {
        // Update our own ready status
        if (isCurrentUserGuest) {
          setIsGuestReady(data.isReady);
        }
      } else {
        // Update the other player's ready status
        if (isCurrentUserGuest) {
          setIsHostReady(data.isReady);
        } else {
          setIsGuestReady(data.isReady);
        }
      }
    };

    socket.on("player_ready_status", handlePlayerReadyStatus);

    return () => {
      socket.off("player_ready_status", handlePlayerReadyStatus);
    };
  }, [socket, lobbyCode, isCurrentUserGuest, user?.firebase_uid]);

  // Update the ready toggle handler
  const handleReadyToggle = () => {
    if (!socket || !lobbyCode || !user?.firebase_uid) return;

    const newReadyState = !isGuestReady;

    // Emit ready status change
    socket.emit("player_ready", {
      lobbyCode,
      playerId: user.firebase_uid,
      isReady: newReadyState
    });
  };

  // Add this to determine if both players are ready
  const bothPlayersReady = isHostReady && isGuestReady;

  // Update the useEffect that handles player data
  useEffect(() => {
    const fetchPlayerData = async () => {
      console.log("User Data:", user);

      if (isCurrentUserGuest) {
        // If current user is a guest, they should be player 2
        const fetchedPlayers: Player[] = [
          // Empty slot for host (will be filled from invitation data)
          {
            firebase_uid: "host-placeholder",
            username: "Host",
            level: 1,
            display_picture: defaultAvatar,
          },
          // Current user as player 2
          {
            firebase_uid: user?.firebase_uid || "",
            username: user?.username || "Player 2",
            level: user?.level || 1,
            display_picture: user?.display_picture || defaultAvatar,
          },
        ];
        setPlayers(fetchedPlayers);
      } else {
        // Original behavior for host - they are player 1
        const fetchedPlayers: Player[] = [
          {
            firebase_uid: user?.firebase_uid || "",
            username: user?.username || "Player 1",
            level: user?.level || 1,
            display_picture: user?.display_picture || defaultAvatar,
          },
        ];
        setPlayers(fetchedPlayers);
      }
    };

    fetchPlayerData();
  }, [user, isCurrentUserGuest]);

  // Update the useEffect that handles socket events
  useEffect(() => {
    if (loading || !user?.firebase_uid || !lobbyCode) return;

    const socketService = SocketService.getInstance();
    const socket = socketService.getSocket();

    if (!socket) {
      console.error("Socket not available for lobby events");
      return;
    }

    // For guest: notify the host that we've joined and request lobby info
    if (isCurrentUserGuest) {
      console.log("Guest joining lobby:", lobbyCode);

      // Send join event via socket
      socket.emit("join_lobby", {
        lobbyCode: lobbyCode,
        playerId: user.firebase_uid,
        playerName: user.username,
        playerLevel: user.level || 1,
        playerPicture: user.display_picture || null,
        hostId: location.state?.invitedPlayer?.firebase_uid
      });

      // Request lobby details
      socket.emit("request_lobby_info", {
        lobbyCode: lobbyCode,
        requesterId: user.firebase_uid
      });
    }

    // For host: listen for players joining the lobby
    const handlePlayerJoined = (data: PlayerJoinedData) => {
      console.log("Player joined lobby:", data);
      if (data.lobbyCode === lobbyCode && !isCurrentUserGuest) {
        // Add the player to our state
        const joinedPlayer = {
          firebase_uid: data.playerId,
          username: data.playerName || "Player 2",
          level: data.playerLevel || 1,
          display_picture: data.playerPicture || defaultAvatar,
        };

        setInvitedPlayer(joinedPlayer);

        // Send current lobby state to the joined player
        socket.emit("lobby_info_response", {
          lobbyCode: lobbyCode,
          requesterId: data.playerId,
          hostId: user.firebase_uid,
          hostName: user.username,
          material: selectedMaterial,
          questionTypes: selectedTypesFinal,
          mode: selectedMode
        });
      }
    };

    // For host: respond to lobby info requests
    const handleLobbyInfoRequest = (data: any) => {
      if (data.lobbyCode === lobbyCode && !isCurrentUserGuest) {
        console.log("Sending lobby info to guest:", data.requesterId);

        socket.emit("lobby_info_response", {
          lobbyCode: lobbyCode,
          requesterId: data.requesterId,
          hostId: user.firebase_uid,
          hostName: user.username,
          material: selectedMaterial,
          questionTypes: selectedTypesFinal,
          mode: selectedMode
        });
      }
    };

    // For guest: handle lobby info response
    const handleLobbyInfoResponse = (data: any) => {
      if (data.lobbyCode === lobbyCode && data.requesterId === user?.firebase_uid) {
        console.log("Received lobby info from host:", data);

        if (data.material) {
          setSelectedMaterial(data.material);
        }

        if (data.questionTypes && Array.isArray(data.questionTypes)) {
          setSelectedTypesFinal(sortQuestionTypes(data.questionTypes));
        }

        if (data.mode) {
          setSelectedMode(data.mode);
        }

        // Update host info in players array
        const hostPlayer = {
          firebase_uid: data.hostId,
          username: data.hostName,
          level: data.hostLevel || 1,
          display_picture: data.hostPicture || defaultAvatar
        };

        // Update the players array with host info first
        setPlayers(prevPlayers => [hostPlayer, ...prevPlayers.slice(1)]);
      }
    };

    // Register event handlers
    const removePlayerJoinedListener = socketService.on("player_joined_lobby", handlePlayerJoined);
    const removeLobbyInfoRequestListener = socketService.on("request_lobby_info", handleLobbyInfoRequest);
    const removeLobbyInfoResponseListener = socketService.on("lobby_info_response", handleLobbyInfoResponse);

    // Cleanup
    return () => {
      if (removePlayerJoinedListener) removePlayerJoinedListener();
      if (removeLobbyInfoRequestListener) removeLobbyInfoRequestListener();
      if (removeLobbyInfoResponseListener) removeLobbyInfoResponseListener();
    };
  }, [loading, user?.firebase_uid, lobbyCode, isCurrentUserGuest, selectedMaterial, selectedTypesFinal, selectedMode]);

  // Add this effect to sync material changes from host to guest
  useEffect(() => {
    if (!isCurrentUserGuest || !socket || !lobbyCode) return;

    const handleMaterialUpdate = (data: any) => {
      if (data.lobbyCode === lobbyCode) {
        setSelectedMaterial(data.material);
        setSelectedTypesFinal(data.questionTypes);
        setSelectedMode(data.mode);
      }
    };

    socket.on("lobby_material_update", handleMaterialUpdate);

    return () => {
      socket.off("lobby_material_update", handleMaterialUpdate);
    };
  }, [isCurrentUserGuest, socket, lobbyCode]);

  // Add this effect to handle both accepted and declined invitations
  useEffect(() => {
    if (!socket) return;

    socket.on("battle_invitation_accepted", (data: any) => {
      if (data.lobbyCode === lobbyCode) {
        setInvitedPlayerStatus({
          isPending: false,
          invitedAt: new Date()
        });
      }
    });

    socket.on("battle_invitation_declined", (data: any) => {
      if (data.lobbyCode === lobbyCode) {
        // Reset both invited player and pending status
        setInvitedPlayer(null);
        setInvitedPlayerStatus({
          isPending: false,
          invitedAt: new Date()
        });
      }
    });

    return () => {
      socket.off("battle_invitation_accepted");
      socket.off("battle_invitation_declined");
    };
  }, [socket, lobbyCode]);

  // Add this helper function near the top of the component
  const sortQuestionTypes = (types: string[]) => {
    // Use the order defined in questionTypes array
    const orderMap = new Map(questionTypes.map((qt, index) => [qt.value, index]));
    return [...types].sort((a, b) => {
      const orderA = orderMap.get(a) ?? 999;
      const orderB = orderMap.get(b) ?? 999;
      return orderA - orderB;
    });
  };

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
              {isCurrentUserGuest ? "LOBBY" : "PVP LOBBY"}
            </h2>
            <h6 className="text-[14px] text-gray-300 mb-1">
              {isCurrentUserGuest ? "Host selected: " : ""}
              {selectedTypesFinal.map((type, index) => {
                // Map question type values to display names
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
              {isCurrentUserGuest ? "Host's Study Material: " : "Chosen Study Material: "}&nbsp;
              <span className="font-bold text-white">
                {selectedMaterial
                  ? (typeof selectedMaterial === 'string' && selectedMaterial === "None")
                    ? "Waiting for host's material..."
                    : selectedMaterial.title || "Loading material..."
                  : isCurrentUserGuest
                    ? "Waiting for host's material..."
                    : "Choose Study Material"}
              </span>
              {!isCurrentUserGuest && (
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
              {isCurrentUserGuest && (
                <span className="ml-2 text-[12px] text-purple-300">
                  (You cannot change these settings)
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
            {/* Player 1 (Host) */}
            <motion.div
              className="flex flex-col ml-[-250px] mr-[210px] items-center"
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {isCurrentUserGuest ? (
                // Show the host info when current user is a guest
                <>
                  <img
                    src={players[0]?.display_picture || defaultAvatar}
                    alt="Host Avatar"
                    className="w-16 h-16 sm:w-[185px] sm:h-[185px] mt-5 rounded-md"
                  />
                  <p className="text-sm sm:text-base font-semibold mt-5">
                    {players[0]?.username || "Host"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    LVL {players[0]?.level || "??"}
                  </p>
                </>
              ) : (
                // Show the current user as Player 1 when they are the host
                <>
                  <img
                    src={user?.display_picture || defaultAvatar}
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
              onClick={() => {
                if (!isCurrentUserGuest && !players[1] && !invitedPlayer) {
                  setSelectedPlayer("");
                  setInviteModalOpen(true);
                }
              }}
            >
              {isCurrentUserGuest ? (
                // Guest view remains the same
                <>
                  <img
                    src={user?.display_picture || defaultAvatar}
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
                // Host view with pending animation and greyed out state
                <div className="relative">
                  <div
                    className={`w-16 h-16 sm:w-[185px] sm:h-[185px] mt-5 bg-white rounded-md flex items-center justify-center 
                      ${invitedPlayer && invitedPlayerStatus.isPending ? 'opacity-50' : ''}`}
                  >
                    {invitedPlayer ? (
                      <>
                        {/* Player image with conditional animation */}
                        <motion.img
                          src={invitedPlayer.display_picture || defaultAvatar}
                          alt="Invited Player"
                          className="w-full h-full rounded-md"
                          initial={{ scale: 0.95, opacity: 0.5 }}
                          animate={invitedPlayerStatus.isPending ? {
                            scale: [0.95, 1.05, 0.95],
                            opacity: [0.5, 0.7, 0.5]
                          } : {
                            scale: 1,
                            opacity: 1
                          }}
                          transition={invitedPlayerStatus.isPending ? {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          } : {
                            duration: 0.5
                          }}
                        />
                        {/* Pending overlay */}
                        {invitedPlayerStatus.isPending && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="text-purple-500 text-sm font-semibold bg-black bg-opacity-50 px-3 py-1 rounded-full"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              Waiting for player...
                            </motion.div>
                          </div>
                        )}
                      </>
                    ) : (
                      <Add className="text-gray-500" />
                    )}
                  </div>
                  <div className={`text-center mt-5 ${invitedPlayerStatus.isPending ? 'opacity-50' : ''}`}>
                    <p className="text-sm sm:text-base font-semibold">
                      {invitedPlayer
                        ? invitedPlayer.username
                        : players[1]
                          ? players[1].username
                          : "PLAYER 2"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {invitedPlayer
                        ? `LVL ${invitedPlayer.level}`
                        : players[1] && players[1].level
                          ? `LVL ${players[1].level}`
                          : "LVL ???"}
                    </p>
                    {invitedPlayerStatus.isPending && (
                      <p className="text-xs text-purple-400 mt-1">Invitation sent</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Lobby Code Section - only visible to host */}
          {isHost && (
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
                {lobbyCode}
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
            onClick={isCurrentUserGuest ? handleReadyToggle : bothPlayersReady ? handleBattleStart : undefined}
            className={`mt-6 sm:mt-11 w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] py-2 sm:py-3 
              ${bothPlayersReady ? 'bg-[#4D1EE3]' : 'bg-[#3d374d]'} 
              text-white rounded-lg text-md sm:text-lg shadow-lg transition flex items-center justify-center 
              ${bothPlayersReady ? 'hover:bg-purple-800' : ''}`}
            disabled={isCurrentUserGuest ? false : !bothPlayersReady}
          >
            {isCurrentUserGuest ? (
              // Guest view
              isGuestReady ? "CANCEL 2/2" : "START 1/2"
            ) : (
              // Host view
              bothPlayersReady ? "BATTLE START! -10" : "START 1/2"
            )}
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
      {isHost && ( // Only render this for hosts
        <QuestionTypeSelectionModal
          open={modalOpenChangeQuestionType}
          onClose={() => setModalOpenChangeQuestionType(false)}
          selectedTypes={selectedTypesFinal || []} // Add fallback
          questionTypes={questionTypes}
          onConfirm={(selected: string[]) => {
            setSelectedTypesFinal(selected);
            setModalOpenChangeQuestionType(false);
          }}
        />
      )}

      {/* Invite Player Modal */}
      <InvitePlayerModal
        open={inviteModalOpen}
        handleClose={() => setInviteModalOpen(false)}
        onInviteSuccess={handleInvite}
        onInvitationAccepted={(lobbyCode) => {
          // Handle when someone accepts an invitation
          console.log("Invitation accepted, preparing battle in lobby:", lobbyCode);
        }}
        lobbyCode={lobbyCode}
      />

      {/* Debug panel */}
      {/* {debug && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "#000",
            padding: 10,
            borderRadius: 5,
            zIndex: 9999,
          }}
        >
          <pre>
            {JSON.stringify(
              {
                invitation: invitedPlayer,
                socketConnected: !!socket,
                userId: user?.firebase_uid,
              },
              null,
              2
            )}
          </pre>
          <button
            onClick={() => {
              if (!user?.firebase_uid) {
                console.error("Cannot test invitation - user not loaded yet");
                return;
              }

              // Set test data first
              setInvitedPlayer({
                firebase_uid: "test-sender-fixed-id",
                username: "Test User",
                level: 1,
                display_picture: null,
              });

              // Then open the invitation
              setTimeout(() => {
                setInviteModalOpen(true);
                console.log("Test invitation opened with data:", {
                  senderId: "test-sender-fixed-id",
                  senderName: "Test User",
                  lobbyCode: lobbyCode
                });
              }, 10);
            }}
            style={{
              marginTop: "8px",
              padding: "4px 8px",
              background: "#4D1EE3",
              border: "none",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Test Invitation
          </button>
        </div>
      )} */}
    </div>
  );
};

export default PVPLobby;