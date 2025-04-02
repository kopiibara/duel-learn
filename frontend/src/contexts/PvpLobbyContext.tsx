import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import SocketService from '../services/socketService';
import axios from 'axios';
import { useUser } from './UserContext';
import { motion } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import ManaIcon from '../assets/mana.png';

// Define types for our context
export interface PvPPlayer {
  firebase_uid: string;
  username: string;
  level: number;
  display_picture: string | null;
  isReady?: boolean;
}

export interface StudyMaterial {
  id?: string;
  study_material_id?: string;
  title: string;
}

export interface PvPLobbyState {
  lobbyCode: string;
  host: PvPPlayer | null;
  guest: PvPPlayer | null;
  studyMaterial: StudyMaterial | null;
  questionTypes: string[];
  lobbyStatus: 'waiting' | 'ready' | 'in_progress' | 'completed' | 'abandoned';
  isCurrentUserHost: boolean;
  isCurrentUserGuest: boolean;
  isSocketConnected: boolean;
  guestConnectionStatus: 'connected' | 'disconnected';
  hostConnectionStatus: 'connected' | 'disconnected';
}

interface PvPLobbyContextType {
  lobbyState: PvPLobbyState;
  updateQuestionTypes: (types: string[]) => void;
  updateStudyMaterial: (material: StudyMaterial) => void;
  setPlayerReady: (isReady: boolean) => void;
  startGame: () => void;
  refreshLobbyData: () => Promise<void>;
  leaveLobby: () => Promise<void>;
}

// Create the context with a default value
const PvPLobbyContext = createContext<PvPLobbyContextType | undefined>(undefined);

// Props for our provider component
interface PvPLobbyProviderProps {
  children: ReactNode;
  initialLobbyCode: string;
}

export const PvPLobbyProvider: React.FC<PvPLobbyProviderProps> = ({ 
  children, 
  initialLobbyCode 
}) => {
  const { user } = useUser();
  const [socket, setSocket] = useState<any>(null);
  const [hasJoinedLobby, setHasJoinedLobby] = useState(false);
  
  // Initialize the lobby state
  const [lobbyState, setLobbyState] = useState<PvPLobbyState>({
    lobbyCode: initialLobbyCode,
    host: null,
    guest: null,
    studyMaterial: null,
    questionTypes: [],
    lobbyStatus: 'waiting',
    isCurrentUserHost: false,
    isCurrentUserGuest: false,
    isSocketConnected: false,
    guestConnectionStatus: 'connected',
    hostConnectionStatus: 'connected'
  });

  // Add this state at the top with your other states
  const [roleVerificationStatus, setRoleVerificationStatus] = useState<'pending' | 'verified' | 'error'>('pending');

  // Function to fetch full lobby data from API
  const fetchLobbyData = async () => {
    try {
      // First try the new pvp_lobbies endpoint
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/lobby/${initialLobbyCode}`
      );
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Parse settings from JSON if needed
        const settings = typeof data.settings === 'string' 
          ? JSON.parse(data.settings) 
          : data.settings || {};
        
        // Update the state with data from API
        setLobbyState(prev => ({
          ...prev,
          host: data.host_id ? {
            firebase_uid: data.host_id,
            username: data.host_username,
            level: data.host_level || 1,
            display_picture: data.host_picture,
            isReady: !!data.host_ready
          } : prev.host,
          guest: data.guest_id ? {
            firebase_uid: data.guest_id,
            username: data.guest_username,
            level: data.guest_level || 1,
            display_picture: data.guest_picture,
            isReady: !!data.guest_ready
          } : prev.guest,
          studyMaterial: settings.study_material_title ? {
            id: settings.study_material_id,
            title: settings.study_material_title
          } : prev.studyMaterial,
          questionTypes: settings.question_types || prev.questionTypes,
          lobbyStatus: data.status || prev.lobbyStatus,
          isCurrentUserHost: user?.firebase_uid === data.host_id,
          isCurrentUserGuest: user?.firebase_uid === data.guest_id
        }));
        
        return;
      }
      
      // Fallback to the battle_invitations endpoint if needed
      const fallbackResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/battle/invitations-lobby/settings/${initialLobbyCode}`
      );
      
      if (fallbackResponse.data.success) {
        const { question_types, study_material_title } = fallbackResponse.data.data;
        
        // Update with fallback data
        setLobbyState(prev => ({
          ...prev,
          questionTypes: question_types || prev.questionTypes,
          studyMaterial: study_material_title ? {
            title: study_material_title
          } : prev.studyMaterial
        }));
      }
    } catch (error) {
      console.error("Error fetching lobby data:", error);
    }
  };

  // Add this useEffect before any socket connection logic
  useEffect(() => {
    if (!user?.firebase_uid || !initialLobbyCode) return;

    const verifyRole = async () => {
      try {
        // Get lobby details first
        const lobbyResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/lobby/${initialLobbyCode}`
        );

        if (!lobbyResponse.data.success) {
          throw new Error('Failed to fetch lobby details');
        }

        const lobbyData = lobbyResponse.data.data;

        // If lobby already has a host and it's not the current user
        if (lobbyData.host_id && lobbyData.host_id !== user.firebase_uid) {
          // Check if user is already the guest
          if (lobbyData.guest_id === user.firebase_uid) {
            setLobbyState(prev => ({
              ...prev,
              isCurrentUserHost: false,
              isCurrentUserGuest: true,
              host: {
                firebase_uid: lobbyData.host_id,
                username: lobbyData.host_username,
                level: lobbyData.host_level || 1,
                display_picture: lobbyData.host_picture,
                isReady: !!lobbyData.host_ready
              },
              guest: {
                firebase_uid: user.firebase_uid,
                username: user.username || 'Player',
                level: user.level || 1,
                display_picture: user.display_picture,
                isReady: !!lobbyData.guest_ready
              }
            }));
            setRoleVerificationStatus('verified');
            return;
          }

          // If lobby has no guest, try to join as guest
          if (!lobbyData.guest_id) {
            try {
              const joinResponse = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/lobby/join`,
                {
                  lobby_code: initialLobbyCode,
                  player_id: user.firebase_uid,
                  player_username: user.username || 'Player',
                  player_level: user.level || 1,
                  player_picture: user.display_picture
                }
              );

              if (joinResponse.data.success) {
                setLobbyState(prev => ({
                  ...prev,
                  isCurrentUserHost: false,
                  isCurrentUserGuest: true,
                  host: {
                    firebase_uid: lobbyData.host_id,
                    username: lobbyData.host_username,
                    level: lobbyData.host_level || 1,
                    display_picture: lobbyData.host_picture,
                    isReady: !!lobbyData.host_ready
                  },
                  guest: {
                    firebase_uid: user.firebase_uid,
                    username: user.username || 'Player',
                    level: user.level || 1,
                    display_picture: user.display_picture,
                    isReady: false
                  }
                }));
                setRoleVerificationStatus('verified');
                return;
              }
            } catch (error) {
              console.error('Failed to join as guest:', error);
              throw new Error('Failed to join lobby as guest');
            }
          }

          // If lobby is full
          throw new Error('Lobby is full');
        }

        // If user is the host
        if (lobbyData.host_id === user.firebase_uid) {
          setLobbyState(prev => ({
            ...prev,
            isCurrentUserHost: true,
            isCurrentUserGuest: false,
            host: {
              firebase_uid: user.firebase_uid,
              username: user.username || 'Player',
              level: user.level || 1,
              display_picture: user.display_picture,
              isReady: !!lobbyData.host_ready
            },
            guest: lobbyData.guest_id ? {
              firebase_uid: lobbyData.guest_id,
              username: lobbyData.guest_username,
              level: lobbyData.guest_level || 1,
              display_picture: lobbyData.guest_picture,
              isReady: !!lobbyData.guest_ready
            } : null
          }));
          setRoleVerificationStatus('verified');
          return;
        }

        // If we get here, the lobby is invalid or inaccessible
        throw new Error('Cannot access lobby');

      } catch (error: any) {
        console.error('Role verification failed:', error);
        setRoleVerificationStatus('error');
        // Redirect to home
        window.location.href = '/dashboard/home';
      }
    };

    verifyRole();
  }, [user?.firebase_uid, initialLobbyCode]);

  // Update your socket connection useEffect to depend on role verification
  useEffect(() => {
    if (!user?.firebase_uid || !initialLobbyCode || roleVerificationStatus !== 'verified') return;
    
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 2000; // 2 seconds
    
    const setupLobbyConnection = async () => {
      try {
        // Create socket connection with combined ID
        const socketService = SocketService.getInstance();
        const socket = socketService.connect(user.firebase_uid);
        setSocket(socket); // Store socket in state

        // Create a unique socket identifier combining user and lobby
        const socketIdentifier = `${user.firebase_uid}_${initialLobbyCode}`;

        const joinLobbyRoom = () => {
          console.log("Joining lobby room...");
          socket.emit('join_lobby', {
            lobbyCode: initialLobbyCode,
            playerId: user.firebase_uid,
            playerName: user.username || 'Player',
            playerLevel: user.level || 1,
            playerPicture: user.display_picture,
            socketId: socketIdentifier,
            isHost: lobbyState.isCurrentUserHost,
            isGuest: lobbyState.isCurrentUserGuest
          });
        };

        // Listen for connection events
        socket.on('connect', () => {
          console.log(`Connected to lobby ${initialLobbyCode} as ${lobbyState.isCurrentUserHost ? 'host' : 'guest'}`);
          setLobbyState(prev => ({
            ...prev,
            isSocketConnected: true
          }));
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          joinLobbyRoom(); // Join room on connect
        });

        socket.on('disconnect', (reason) => {
          console.log(`Disconnected from lobby: ${reason}`);
          setLobbyState(prev => ({
            ...prev,
            isSocketConnected: false
          }));

          // Handle reconnection for certain disconnect reasons
          if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
            // Attempt to reconnect if within limits
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
              reconnectAttempts++;
              console.log(`Attempting reconnection ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
              setTimeout(() => {
                socket.connect();
              }, RECONNECT_DELAY * reconnectAttempts); // Exponential backoff
            } else {
              console.error('Max reconnection attempts reached');
              // Optionally show a user-facing error or redirect
            }
          }
        });

        // Listen for other players' connection status
        socket.on('player_disconnected', (data) => {
          if (data.lobbyCode === initialLobbyCode) {
            if (data.isGuest) {
              setLobbyState(prev => ({
                ...prev,
                guestConnectionStatus: 'disconnected'
              }));
            }
            if (data.isHost) {
              setLobbyState(prev => ({
                ...prev,
                hostConnectionStatus: 'disconnected'
              }));
            }
          }
        });

        // Handle reconnection events
        socket.on('reconnect', (attemptNumber) => {
          console.log(`Successfully reconnected after ${attemptNumber} attempts`);
          joinLobbyRoom(); // Rejoin room after reconnection
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`Reconnection attempt ${attemptNumber}...`);
        });

        socket.on('reconnect_error', (error) => {
          console.error('Reconnection error:', error);
        });

        socket.on('reconnect_failed', () => {
          console.error('Failed to reconnect to lobby');
          setLobbyState(prev => ({
            ...prev,
            isSocketConnected: false
          }));
        });

        // Handle successful reconnection of other players
        socket.on('player_reconnected', (data) => {
          if (data.lobbyCode === initialLobbyCode) {
            if (data.isGuest) {
              setLobbyState(prev => ({
                ...prev,
                guestConnectionStatus: 'connected'
              }));
            }
            if (data.isHost) {
              setLobbyState(prev => ({
                ...prev,
                hostConnectionStatus: 'connected'
              }));
            }
          }
        });

        socket.on('host_left_lobby', (data) => {
          if (data.lobbyCode === initialLobbyCode) {
            // If we're the guest and host left, redirect to home
            if (lobbyState.isCurrentUserGuest) {
              window.location.href = '/dashboard/home';
            }
          }
        });
        
        socket.on('player_left', (data) => {
          if (data.lobbyCode === initialLobbyCode) {
            if (data.isGuest && lobbyState.isCurrentUserHost) {
              // Update local state to remove guest
              setLobbyState(prev => ({
                ...prev,
                guest: null,
                guestConnectionStatus: 'connected'
              }));
            }
          }
        });
        // Clean up function
        return () => {
          if (socket) {
            // Leave the lobby room before disconnecting
            socket.emit('leave_lobby', {
              lobbyCode: initialLobbyCode,
              playerId: user.firebase_uid,
              isHost: lobbyState.isCurrentUserHost,
              isGuest: lobbyState.isCurrentUserGuest
            });

            // Remove all event listeners
            socket.off('connect');
            socket.off('disconnect');
            socket.off('player_disconnected');
            socket.off('player_reconnected');
            socket.off('reconnect');
            socket.off('reconnect_attempt');
            socket.off('reconnect_error');
            socket.off('reconnect_failed');
            socket.off('host_left_lobby');
            socket.off('player_left');

            // Disconnect socket
            socketService.disconnect();
            setSocket(null);
          }
        };

      } catch (error) {
        console.error('Error setting up lobby connection:', error);
        setLobbyState(prev => ({
          ...prev,
          isSocketConnected: false
        }));
      }
    };

    setupLobbyConnection();

  }, [user?.firebase_uid, initialLobbyCode, roleVerificationStatus, lobbyState.isCurrentUserHost, lobbyState.isCurrentUserGuest]);

  // Function to update question types
  const updateQuestionTypes = async (types: string[]) => {
    if (!socket || !user?.firebase_uid || !lobbyState.isCurrentUserHost) return;
    
    try {
      // First update via API
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/lobby/settings`, {
        lobby_code: initialLobbyCode,
        settings: {
          question_types: types
        }
      });
      
      // Then emit socket event
      socket.emit('update_question_types', {
        lobbyCode: initialLobbyCode,
        playerId: user.firebase_uid,
        questionTypes: types
      });
      
      // Update local state
      setLobbyState(prev => ({
        ...prev,
        questionTypes: types
      }));
    } catch (error) {
      console.error("Error updating question types:", error);
    }
  };

  // Function to update study material
  const updateStudyMaterial = async (material: StudyMaterial) => {
    if (!socket || !user?.firebase_uid || !lobbyState.isCurrentUserHost) return;
    
    try {
      // First update via API
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/lobby/settings`, {
        lobby_code: initialLobbyCode,
        settings: {
          study_material_id: material.id || material.study_material_id,
          study_material_title: material.title
        }
      });
      
      // Then emit socket event
      socket.emit('update_study_material', {
        lobbyCode: initialLobbyCode,
        playerId: user.firebase_uid,
        studyMaterial: {
          id: material.id || material.study_material_id,
          title: material.title
        }
      });
      
      // Update local state
      setLobbyState(prev => ({
        ...prev,
        studyMaterial: {
          id: material.id || material.study_material_id,
          title: material.title
        }
      }));
    } catch (error) {
      console.error("Error updating study material:", error);
    }
  };

  // Function to set player ready status
  const setPlayerReady = async (isReady: boolean) => {
    if (!socket || !user?.firebase_uid) return;
    
    try {
      // First update pvp_lobbies ready status
      const readyResponse = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/lobby/ready`, {
        lobby_code: initialLobbyCode,
        player_id: user.firebase_uid,
        is_ready: isReady,
        is_host: lobbyState.isCurrentUserHost,
        is_guest: lobbyState.isCurrentUserGuest
      });

      if (!readyResponse.data.success) {
        throw new Error('Failed to update ready status');
      }

      // Then update or create battle invitation
      const invitationData = {
        sender_id: lobbyState.host?.firebase_uid,
        sender_username: lobbyState.host?.username || '',
        sender_level: lobbyState.host?.level || 1,
        receiver_id: lobbyState.guest?.firebase_uid,
        receiver_username: lobbyState.guest?.username || '',
        receiver_level: lobbyState.guest?.level || 1,
        lobby_code: initialLobbyCode,
        status: 'accepted',
        question_types: JSON.stringify(lobbyState.questionTypes),
        study_material_title: lobbyState.studyMaterial?.title,
        host_ready: lobbyState.isCurrentUserHost ? isReady : !!lobbyState.host?.isReady,
        guest_ready: lobbyState.isCurrentUserGuest ? isReady : !!lobbyState.guest?.isReady,
        battle_started: false,
        selected_difficulty: null // or get from your settings
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/battle/invitations-lobby/update-or-create`,
        invitationData
      );
      
      // Emit socket event
      socket.emit('update_player_ready', {
        lobbyCode: initialLobbyCode,
        playerId: user.firebase_uid,
        isReady: isReady,
        isHost: lobbyState.isCurrentUserHost,
        isGuest: lobbyState.isCurrentUserGuest
      });
      
      // Update local state
      setLobbyState(prev => {
        if (prev.isCurrentUserHost && prev.host) {
          return {
            ...prev,
            host: { ...prev.host, isReady }
          };
        } else if (prev.isCurrentUserGuest && prev.guest) {
          return {
            ...prev,
            guest: { ...prev.guest, isReady }
          };
        }
        return prev;
      });

    } catch (error) {
      console.error("Error updating player ready status:", error);
    }
  };

  // Function to start the game
  const startGame = async () => {
    if (!socket || !user?.firebase_uid || !lobbyState.isCurrentUserHost) return;
    
    try {
      // First update via API
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/lobby/status`, {
        lobby_code: initialLobbyCode,
        status: 'in_progress'
      });
      
      // Then emit socket event
      socket.emit('update_lobby_status', {
        lobbyCode: initialLobbyCode,
        playerId: user.firebase_uid,
        status: 'in_progress'
      });
      
      // Update local state
      setLobbyState(prev => ({
        ...prev,
        lobbyStatus: 'in_progress'
      }));
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  // Function to refresh lobby data from API
  const refreshLobbyData = async () => {
    await fetchLobbyData();
  };

  // Add the leave lobby function
  const leaveLobby = async () => {
    if (!socket || !user?.firebase_uid) return;
    
    try {
      // Update pvp_lobbies table
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/lobby/leave`,
        {
          lobby_code: initialLobbyCode,
          player_id: user?.firebase_uid,
          is_host: lobbyState.isCurrentUserHost,
          is_guest: lobbyState.isCurrentUserGuest
        }
      );

      if (!response.data.success) {
        throw new Error('Failed to leave lobby');
      }

      // Emit socket event to notify other players
      socket.emit('leave_lobby', {
        lobbyCode: initialLobbyCode,
        playerId: user?.firebase_uid,
        isHost: lobbyState.isCurrentUserHost,
        isGuest: lobbyState.isCurrentUserGuest
      });

      // Navigate to home
      window.location.href = '/dashboard/home';

    } catch (error) {
      console.error("Error leaving lobby:", error);
      // Still redirect on error
      window.location.href = '/dashboard/home';
    }
  };

  // Define the context value
  const contextValue: PvPLobbyContextType = {
    lobbyState,
    updateQuestionTypes,
    updateStudyMaterial,
    setPlayerReady,
    startGame,
    refreshLobbyData,
    leaveLobby
  };

  return (
    <PvPLobbyContext.Provider value={contextValue}>
      {children}
    </PvPLobbyContext.Provider>
  );
};

// Custom hook to use the PvP Lobby context
export const usePvPLobby = () => {
  const context = useContext(PvPLobbyContext);
  if (context === undefined) {
    throw new Error('usePvPLobby must be used within a PvPLobbyProvider');
  }
  return context;
}; 