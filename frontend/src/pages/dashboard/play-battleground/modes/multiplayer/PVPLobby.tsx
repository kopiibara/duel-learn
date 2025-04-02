import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import "./../../styles/setupques.css";
import SelectStudyMaterialModal from "../../../../../components/modals/SelectStudyMaterialModal";
import QuestionTypeSelectionModal from "../../components/modal/QuestionTypeSelectionModal";
import InvitePlayerModal from "../../components/modal/InvitePlayerModal";
import { useUser } from "../../../../../contexts/UserContext";
import { generateCode } from "../../utils/codeGenerator";
import defaultAvatar from "../../../../../assets/profile-picture/bunny-picture.png";
import { Socket } from "socket.io-client";
import axios from "axios";
import SocketService from "../../../../../services/socketService";
import { toast } from "react-hot-toast";

// Import new modular components
import {
  PvPHeader,
  PlayerCard,
  LobbyCodeDisplay,
  BattleControls,
  ConfirmationDialog
} from './components';

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

// Define a type for the study material
interface StudyMaterial {
  title: string;
  id?: string;
  study_material_id?: string; // Explicitly add study_material_id
  items?: any[];
  [key: string]: any; // For any other properties
}

const PVPLobby: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, material, selectedTypes, lobbyCode: stateLobbyCode, isGuest, friendToInvite } = location.state || {};
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

  const [manaPoints, setManaPoints] = useState(40); // Example starting mana points
  const [_openManaAlert, setOpenManaAlert] = useState(false); // State for the mana points alert
  const [openDialog, setOpenDialog] = useState(false); // State to control the modal
  const [copySuccess, setCopySuccess] = useState(false); // To track if the text was copied

  const [modalOpenChangeQuestionType, setModalOpenChangeQuestionType] =
    useState(false); // State for the ChoosePvPModeModal
  const [selectedTypesFinal, setSelectedTypesFinal] = useState<string[]>(
    location.state?.selectedTypes || selectedTypes || []
  );

  // State to manage selected material and mode
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(
    location.state?.selectedMaterial || material
  );
  const [selectedMode, setSelectedMode] = useState<string | null>(mode);
  const [openMaterialModal, setOpenMaterialModal] = useState(false);

  // State to manage FriendListModal

  // State for invite modal
  const [showInviteModal, setShowInviteModal] = useState(false); // State for the invite modal
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

  // Add this state to track if current user is a guest (invited player)
  const [isCurrentUserGuest, setIsCurrentUserGuest] = useState<boolean>(isGuest || false);

  // Add state to track invited player status
  const [invitedPlayerStatus, setInvitedPlayerStatus] = useState<InvitedPlayerStatus>({
    isPending: false,
    invitedAt: new Date()
  });

  // Add this state to track player ready status
  const [playerReadyState, setPlayerReadyState] = useState<{
    hostReady: boolean;
    guestReady: boolean;
  }>({
    hostReady: true, // Host is always considered ready
    guestReady: false,
  });

  // Add loading state for ready status operations
  const [readyStateLoading, setReadyStateLoading] = useState(false);

  // Add battle started state
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleStartLoading, setBattleStartLoading] = useState(false);

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

  // Update the socket initialization effect
  useEffect(() => {
    if (loading || !user?.firebase_uid) {
      console.log("User data not ready yet, waiting...");
      return;
    }

    console.log("Setting up socket service for user:", user.firebase_uid);
    const socketService = SocketService.getInstance();
    const newSocket = socketService.connect(user.firebase_uid);

    // Wait for socket to connect
    if (!newSocket.connected) {
      newSocket.on('connect', () => {
        console.log("Socket connected successfully");
        setSocket(newSocket);
      });
    } else {
      setSocket(newSocket);
    }

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
      console.log("Setting invitation data:", data);
      setInvitedPlayer({
        firebase_uid: String(data.senderId || "missing-sender"),
        username: data.senderName || "Unknown Player",
        level: 1,
        display_picture: null
      });

      // Then open the invitation dialog
      setShowInviteModal(true);
      console.groupEnd();
    };

    // Register the handler with proper cleanup
    const removeListener = socketService.on("battle_invitation", handleBattleInvitation);

    if (newSocket.connected) {
      // Let others know this user is in a lobby
      newSocket.emit("userLobbyStatusChanged", {
        userId: user.firebase_uid,
        inLobby: true,
        lobbyCode: lobbyCode
      });
      
      // Also broadcast player joined lobby event
      newSocket.emit("player_joined_lobby", {
        playerId: user.firebase_uid,
        lobbyCode: lobbyCode
      });
    } else {
      newSocket.once('connect', () => {
        console.log("Socket connected, emitting lobby status");
        // Let others know this user is in a lobby
        newSocket.emit("userLobbyStatusChanged", {
          userId: user.firebase_uid,
          inLobby: true,
          lobbyCode: lobbyCode
        });
        
        // Also broadcast player joined lobby event
        newSocket.emit("player_joined_lobby", {
          playerId: user.firebase_uid,
          lobbyCode: lobbyCode
        });
      });
    }

    return () => {
      if (removeListener) removeListener();
      if (newSocket) {
        console.log("Cleaning up socket connection");
        newSocket.disconnect();
      }
      newSocket.emit("userLobbyStatusChanged", {
        userId: user.firebase_uid,
        inLobby: false,
        lobbyCode: lobbyCode
      });
      newSocket.emit("player_left_lobby", {
        playerId: user.firebase_uid,
        lobbyCode: lobbyCode
      });
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

  // Update the useEffect for battle started status for guest
  useEffect(() => {
    // Only run this for guests, not for hosts
    if (!isCurrentUserGuest || !lobbyCode) return;

    const checkBattleStarted = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/battle/invitations-lobby/battle-status/${lobbyCode}`
        );

        if (response.data.success && response.data.data.battle_started) {
          console.log("Battle has started! Navigating to difficulty selection...");
          setBattleStarted(true);

          // Get host and guest IDs
          const hostId = players[0]?.firebase_uid;
          const guestId = user?.firebase_uid;

          // Navigate guest to their specific route with host username
          navigate("/dashboard/select-difficulty/pvp/player2", {
            state: {
              lobbyCode,
              material: selectedMaterial,
              questionTypes: selectedTypesFinal,
              isGuest: true,
              hostUsername: players[0]?.username,
              guestUsername: user?.username,
              hostId: hostId, // Pass the actual host ID 
              guestId: guestId  // Pass the actual guest ID
            }
          });
        }
      } catch (error) {
        console.error("Error checking battle status:", error);
      }
    };

    // Check immediately
    checkBattleStarted();

    // Then check every 1.5 seconds
    const interval = setInterval(checkBattleStarted, 1500);

    return () => clearInterval(interval);
  }, [isCurrentUserGuest, lobbyCode, navigate, selectedMaterial, selectedTypesFinal, players, user?.username, user?.firebase_uid]);

  // Update the handleBattleStart function
  const handleBattleStart = async () => {
    // For host: only allow battle start if guest is ready
    if (!isCurrentUserGuest) {
      if (!playerReadyState.guestReady) {
        // Perhaps show a message that guest isn't ready
        return;
      }

      if (manaPoints < 10) {
        setOpenManaAlert(true);
        return;
      }

      setBattleStartLoading(true);

      try {
        // Update battle_started status in the database
        const response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/battle/invitations-lobby/battle-status`,
          {
            lobby_code: lobbyCode,
            battle_started: true
          }
        );

        if (response.data.success) {
          // Deduct mana points
          setManaPoints((prev) => prev - 10);
          console.log("Battle Started!");

          // Get the appropriate IDs
          const hostId = user?.firebase_uid;
          const guestId = invitedPlayer?.firebase_uid || players[1]?.firebase_uid;

          // Navigate host to their specific route with FIXED guest username
          navigate("/dashboard/select-difficulty/pvp", {
            state: {
              lobbyCode,
              material: selectedMaterial,
              questionTypes: selectedTypesFinal,
              isHost: true,
              hostUsername: user?.username,
              guestUsername: invitedPlayer?.username || players[1]?.username || "Guest",
              hostId: hostId,
              guestId: guestId
            }
          });
        }
      } catch (error) {
        console.error("Error starting battle:", error);
      } finally {
        setBattleStartLoading(false);
      }
    } else {
      // For guest: toggle ready state
      toggleGuestReadyState();
    }
  };

  const handleChangeMaterial = () => {
    setOpenMaterialModal(true); // Open the SelectStudyMaterialModal directly
  };

  const handleMaterialSelect = async (material: any) => {
    try {
      console.log("Selected material:", material); // Log the selected material

      // Update local state
      setSelectedMaterial(material);

      // Update in database only - no socket emit
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/battle/invitations-lobby/settings`, {
        lobby_code: lobbyCode,
        question_types: selectedTypesFinal,
        study_material_title: material.title,
        study_material_id: material.study_material_id || material.id // Add study_material_id
      });

      setOpenMaterialModal(false);
    } catch (error) {
      console.error("Error updating study material:", error);
    }
  };

  const handleModeSelect = (mode: string) => {
    console.log("Mode Selected:", mode); // Debugging log
    setSelectedMode(mode); // Update selected mode
  };

  const handleChangeQuestionType = () => {
    setModalOpenChangeQuestionType(true);
  };

  const handleQuestionTypeUpdate = async (selected: string[]) => {
    try {
      // Update local state
      setSelectedTypesFinal(selected);

      // Update in database only - no socket emit
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/battle/invitations-lobby/settings`, {
        lobby_code: lobbyCode,
        question_types: selected,
        study_material_title: selectedMaterial?.title
      });

      setModalOpenChangeQuestionType(false);
    } catch (error) {
      console.error("Error updating question types:", error);
    }
  };

  const handleInvite = async (friend: Player) => {
    console.log("Socket:", socket);
    console.log("User ID:", user?.firebase_uid);
    console.log("Username:", user?.username);

    if (!user?.firebase_uid || !user?.username) {
      console.error("Missing user data for invitation");
      return;
    }

    try {
      console.log("Handling invite for friend:", friend);

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
      // Get or create socket connection
      let currentSocket = socket;
      if (!currentSocket) {
        console.log("Creating new socket connection...");
        const socketService = SocketService.getInstance();
        currentSocket = socketService.connect(user.firebase_uid);
        setSocket(currentSocket);
      }

      // Ensure socket is connected before sending
      if (!currentSocket.connected) {
        console.log("Waiting for socket to connect...");
        await new Promise<void>((resolve) => {
          currentSocket?.once('connect', () => {
            console.log("Socket connected successfully");
            resolve();
          });
        });
      }

      // Then emit socket event
      console.log("Emitting battle invitation:", notificationData);
      currentSocket.emit("notify_battle_invitation", notificationData);

      // Update local state to show invited player
      setInvitedPlayer(friend);
      setShowInviteModal(false);
    } catch (error) {
      console.error("Error sending invitation:", error);
      // Reset pending status on error
      setInvitedPlayerStatus({
        isPending: false,
        invitedAt: new Date()
      });
    }
  };

  // Update the useEffect that handles player data
  useEffect(() => {
    const fetchPlayerData = async () => {
      console.log("User Data:", user);

      if (isCurrentUserGuest) {
        // If current user is a guest, they should be player 2
        const hostInfo = location.state?.invitedPlayer || {
          firebase_uid: "host-placeholder",
          username: "Host",
          level: 1,
          display_picture: defaultAvatar,
        };

        const fetchedPlayers: Player[] = [
          // Host info from invitation data
          {
            firebase_uid: hostInfo.firebase_uid,
            username: hostInfo.username,
            level: hostInfo.level,
            display_picture: hostInfo.display_picture || defaultAvatar,
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
  }, [user, isCurrentUserGuest, location.state?.invitedPlayer]);

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
          setSelectedMaterial((prev: StudyMaterial | null) => ({
            ...prev,
            title: data.material.title
          }));
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
        setSelectedMaterial((prev: StudyMaterial | null) => ({
          ...prev,
          title: data.material.title
        }));
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

  // Add this to your existing socket useEffect
  useEffect(() => {
    if (!socket || !isCurrentUserGuest) return;

    const handleLobbySettingsUpdate = (data: any) => {
      if (data.lobbyCode === lobbyCode) {
        setSelectedTypesFinal(data.question_types);
        if (data.study_material_title) {
          setSelectedMaterial((prev: StudyMaterial | null) => ({
            ...prev,
            title: data.study_material_title
          }));
        }
      }
    };

    socket.on("lobby_settings_updated", handleLobbySettingsUpdate);

    return () => {
      socket.off("lobby_settings_updated", handleLobbySettingsUpdate);
    };
  }, [socket, lobbyCode, isCurrentUserGuest]);

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

  // Add this function to toggle ready state
  const toggleGuestReadyState = async () => {
    if (!user?.firebase_uid || !lobbyCode) return;

    setReadyStateLoading(true);

    try {
      // Update ready state in the database
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/battle/invitations-lobby/ready-state`,
        {
          lobby_code: lobbyCode,
          player_id: user.firebase_uid,
          is_ready: !playerReadyState.guestReady // Toggle current state
        }
      );

      if (response.data.success) {
        // Update local state
        setPlayerReadyState(prev => ({
          ...prev,
          guestReady: !prev.guestReady
        }));

        // Also update via socket for immediate feedback to host
        if (socket) {
          socket.emit("player_ready_state_changed", {
            lobbyCode: lobbyCode,
            playerId: user.firebase_uid,
            isReady: !playerReadyState.guestReady
          });
        }
      }
    } catch (error) {
      console.error("Error updating ready state:", error);
    } finally {
      setReadyStateLoading(false);
    }
  };

  // Add this function to check ready state from database
  const checkReadyState = async () => {
    if (!lobbyCode) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/battle/invitations-lobby/ready-state/${lobbyCode}`
      );

      if (response.data.success) {
        const { hostReady, guestReady } = response.data.data;
        setPlayerReadyState({
          hostReady: hostReady || true, // Default to true for host
          guestReady: guestReady || false
        });
      }
    } catch (error) {
      console.error("Error checking ready state:", error);
    }
  };

  // Add this effect to periodically check ready state
  useEffect(() => {
    if (!lobbyCode) return;

    // Check immediately
    checkReadyState();

    // Then check every 3 seconds
    const interval = setInterval(checkReadyState, 1200);

    return () => clearInterval(interval);
  }, [lobbyCode]);

  // Add this effect to listen for socket ready state changes
  useEffect(() => {
    if (!socket || !lobbyCode) return;

    const handlePlayerReadyChange = (data: PlayerReadyData) => {
      if (data.lobbyCode === lobbyCode) {
        // Update local state based on which player changed status
        if (isCurrentUserGuest && data.playerId !== user?.firebase_uid) {
          // Host changed status (less common case)
          setPlayerReadyState(prev => ({
            ...prev,
            hostReady: data.isReady
          }));
        } else if (!isCurrentUserGuest && data.playerId !== user?.firebase_uid) {
          // Guest changed status
          setPlayerReadyState(prev => ({
            ...prev,
            guestReady: data.isReady
          }));
        }
      }
    };

    socket.on("player_ready_state_changed", handlePlayerReadyChange);

    return () => {
      socket.off("player_ready_state_changed", handlePlayerReadyChange);
    };
  }, [socket, lobbyCode, isCurrentUserGuest, user?.firebase_uid]);

  // Modify the checkLobbySettings function to only trigger UI updates when something actually changes
  const checkLobbySettings = async () => {
    if (!lobbyCode) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/battle/invitations-lobby/settings/${lobbyCode}`
      );

      if (response.data.success) {
        const { question_types, study_material_title } = response.data.data;

        // Track if we're making any changes
        let settingsChanged = false;

        // Update question types if different
        if (question_types && Array.isArray(question_types)) {
          if (JSON.stringify(question_types.sort()) !== JSON.stringify(selectedTypesFinal.sort())) {
            console.log("Updating question types from poll:", question_types);
            setSelectedTypesFinal(question_types);
            settingsChanged = true;
          }
        }

        // Update study material if different
        if (study_material_title && study_material_title !== selectedMaterial?.title) {
          console.log("Updating study material from poll:", study_material_title);
          setSelectedMaterial((prev: StudyMaterial | null) => ({
            ...prev,
            title: study_material_title
          }));
          settingsChanged = true;
        }

        // Only show the visual indicator if settings actually changed
        if (settingsChanged && isCurrentUserGuest) {
          setSettingsUpdated(true);
          // Clear the update notification after 2 seconds
          setTimeout(() => setSettingsUpdated(false), 2000);
        }
      }
    } catch (error) {
      console.error("Error polling lobby settings:", error);
    }
  };

  // Add a state for settings update indicator
  const [settingsUpdated, setSettingsUpdated] = useState(false);

  // Add this effect to periodically check lobby settings
  useEffect(() => {
    if (!lobbyCode) return;

    // Check immediately
    checkLobbySettings();

    // Then check every 1.2 seconds for more responsive updates
    const interval = setInterval(checkLobbySettings, 1200);

    return () => clearInterval(interval);
  }, [lobbyCode]);

  // Add this to handle real-time player joining through sockets
  useEffect(() => {
    if (!socket) return;
    
    // Handle a player joining lobby in real-time
    const handlePlayerJoiningLobby = (data: {
      lobbyCode: string;
      playerId: string;
      playerName?: string;
      playerLevel?: number;
      playerPicture?: string | null;
    }) => {
      console.log(`Player joining lobby via socket: ${data.playerName || data.playerId}`);
      
      // Only process if we're in this lobby
      if (data.lobbyCode !== lobbyCode) return;
      
      // Create player object from received data
      const joiningPlayer: Player = {
        firebase_uid: data.playerId,
        username: data.playerName || "Guest",
        level: data.playerLevel || 1,
        display_picture: data.playerPicture || null
      };
      
      // Add player to guest player state
      setInvitedPlayer(joiningPlayer);
      setShowInviteModal(true);
      
      // Play a sound or add visual notification if desired
      // playSoundEffect("playerJoined.mp3");
      
      // Show notification toast
      toast.success(`${joiningPlayer.username} joined your lobby!`);
    };
    
    // Set up the event listener
    socket.on("playerJoiningLobby", handlePlayerJoiningLobby);
    
    // Clean up
    return () => {
      socket.off("playerJoiningLobby", handlePlayerJoiningLobby);
    };
  }, [socket, lobbyCode]);

  // Modify the useEffect that runs when the component mounts to emit a createLobby event for hosts
  useEffect(() => {
    // Initialize lobby
    if (isCurrentUserGuest && lobbyCode) {
      // Join lobbby and notify server
      socket?.emit("createLobby", {
        lobbyCode,
        hostId: user?.firebase_uid,
        hostName: user?.username,
        hostLevel: user?.level,
        hostPicture: user?.display_picture || null
      });
      
      console.log(`Host created lobby: ${lobbyCode}`);
    }
    
    // ... existing code for non-socket initializations ...
  }, [isCurrentUserGuest, lobbyCode, socket, user?.firebase_uid, user?.username, user?.level, user?.display_picture]);

  // Add an effect to send invitation to friend when the lobby is ready
  useEffect(() => {
    // Only run this if we have a friend to invite and the socket is connected
    if (friendToInvite && socket && socket.connected && user?.firebase_uid && user?.username) {
      console.log("Sending invitation to friend:", friendToInvite);
      
      // Create the notification data
      const notificationData = {
        senderId: user.firebase_uid,
        senderName: user.username,
        receiverId: friendToInvite.firebase_uid,
        lobbyCode: lobbyCode,
        timestamp: new Date().toISOString(),
      };
      
      // Emit the battle invitation event
      socket.emit("notify_battle_invitation", notificationData);
      
      // Update local state to show the invited player
      setInvitedPlayer(friendToInvite);
      setInvitedPlayerStatus({
        isPending: true,
        invitedAt: new Date()
      });
      
      // Clear the friendToInvite from localStorage if it was stored there
      localStorage.removeItem('friendToInvite');
    }
  }, [socket, user?.firebase_uid, user?.username, lobbyCode, friendToInvite]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white px-6 py-8 overflow-hidden">
      {/* Full-Width Fixed Header */}
      <PvPHeader
        onBackClick={handleBackClick}
        onChangeMaterial={handleChangeMaterial}
        onChangeQuestionType={handleChangeQuestionType}
        selectedMaterial={selectedMaterial}
        selectedTypesFinal={selectedTypesFinal}
        questionTypes={questionTypes}
        manaPoints={manaPoints}
        isCurrentUserGuest={isCurrentUserGuest}
      />

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
              <PlayerCard 
                player={isCurrentUserGuest ? players[0] : {
                  firebase_uid: user?.firebase_uid || "",
                  username: user?.username || "Player 1",
                  level: user?.level || 1,
                  display_picture: user?.display_picture || defaultAvatar
                }}
                isHost={true}
              />
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
            >
              {isCurrentUserGuest ? (
                <PlayerCard 
                  player={{
                    firebase_uid: user?.firebase_uid || "",
                    username: user?.username || "Player 2",
                    level: user?.level || 1,
                    display_picture: user?.display_picture || defaultAvatar
                  }}
                  isHost={false}
                />
              ) : (
                <PlayerCard 
                  player={invitedPlayer}
                  isHost={false}
                  isPending={invitedPlayerStatus.isPending}
                  onClick={() => {
                    if (!isCurrentUserGuest && !players[1] && !invitedPlayer) {
                      setSelectedPlayer("");
                      setShowInviteModal(true);
                    }
                  }}
                />
              )}
            </motion.div>
          </div>

          {/* Lobby Code Section - only visible to host */}
          {!isCurrentUserGuest && (
            <LobbyCodeDisplay lobbyCode={lobbyCode} />
          )}

          {/* Battle Start Button - modified */}
          <BattleControls
            onBattleStart={handleBattleStart}
            isHost={!isCurrentUserGuest}
            hostReady={playerReadyState.hostReady}
            guestReady={playerReadyState.guestReady}
            loading={readyStateLoading || battleStartLoading}
            disabledReason={manaPoints < 10 ? "Not enough mana" : undefined}
          />
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationDialog
        open={openDialog}
        title="Are you sure you want to leave?"
        content="If you leave, your current progress will be lost. Please confirm if you wish to proceed."
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        confirmText="Yes, Leave"
        cancelText="Cancel"
      />

      {/* Select Study Material Modal */}
      <SelectStudyMaterialModal
        open={openMaterialModal}
        handleClose={() => setOpenMaterialModal(false)}
        mode={selectedMode}
        isLobby={true}
        onMaterialSelect={handleMaterialSelect}
        onModeSelect={handleModeSelect}
        selectedTypes={selectedTypesFinal}
      />

      {/* Question Type Selection Modal - Only show for host */}
      {!isCurrentUserGuest && (
        <QuestionTypeSelectionModal
          open={modalOpenChangeQuestionType}
          onClose={() => setModalOpenChangeQuestionType(false)}
          selectedTypes={selectedTypesFinal || []}
          questionTypes={questionTypes}
          onConfirm={handleQuestionTypeUpdate}
        />
      )}

      {/* Invite Player Modal */}
      {showInviteModal && (
        <InvitePlayerModal
          open={showInviteModal}
          handleClose={() => setShowInviteModal(false)}
          onInviteSuccess={handleInvite}
          lobbyCode={lobbyCode}
          inviterName={user?.username ?? undefined}
          senderId={user?.firebase_uid}
          selectedTypesFinal={selectedTypesFinal}
          selectedMaterial={selectedMaterial ? {
            id: selectedMaterial.id || "",
            title: selectedMaterial.title
          } : null}
        />
      )}
    </div>
  );
};

export default PVPLobby;