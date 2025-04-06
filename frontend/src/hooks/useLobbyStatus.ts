import { useState, useEffect } from "react";
import SocketService from "../services/socketService";

// Define game mode types
export type GameMode =
  | "pvp-battle"
  | "peaceful-mode"
  | "time-pressured-mode"
  | null;

export const useLobbyStatus = (userId: string) => {
  const [isInLobby, setIsInLobby] = useState<boolean>(false);
  const [isInGame, setIsInGame] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>(null);

  useEffect(() => {
    if (!userId) return;

    // Get socket from the service
    const socketService = SocketService.getInstance();
    const socket = socketService.getSocket();

    if (!socket) {
      console.log("No socket available when checking status");
      return;
    }

    console.log(`Checking status for user: ${userId}`);

    // Request initial status
    socket.emit("requestLobbyStatus", { userIds: [userId] });
    socket.emit("requestGameStatus", { userIds: [userId] });

    // Handle responses
    const handleLobbyStatusResponse = (data: Record<string, boolean>) => {
      if (data[userId] !== undefined) {
        setIsInLobby(data[userId]);
      }
    };

    const handleGameStatusResponse = (
      data: Record<string, { inGame: boolean; mode: GameMode }>
    ) => {
      if (data[userId] !== undefined) {
        setIsInGame(data[userId].inGame);
        setGameMode(data[userId].mode);
      }
    };

    const handleLobbyStatusChange = (data: {
      userId: string;
      inLobby: boolean;
    }) => {
      if (data.userId === userId) {
        setIsInLobby(data.inLobby);
      }
    };

    const handleGameStatusChange = (data: {
      userId: string;
      inGame: boolean;
      mode: GameMode;
    }) => {
      if (data.userId === userId) {
        setIsInGame(data.inGame);
        setGameMode(data.mode);
      }
    };

    // When a player enters a lobby
    const handlePlayerJoinedLobby = (data: { playerId: string }) => {
      if (data.playerId === userId) {
        setIsInLobby(true);
        // Reset game status when joining lobby
        setIsInGame(false);
        setGameMode(null);
      }
    };

    // When a player leaves a lobby or battle ends
    const handlePlayerLeftLobby = (data: { playerId: string }) => {
      if (data.playerId === userId) {
        setIsInLobby(false);
      }
    };

    // When a player enters a game
    const handlePlayerEnteredGame = (data: {
      playerId: string;
      mode: GameMode;
    }) => {
      if (data.playerId === userId) {
        setIsInGame(true);
        setGameMode(data.mode);
        // Entering a game means no longer in lobby
        setIsInLobby(false);
      }
    };

    // When a player exits a game
    const handlePlayerExitedGame = (data: { playerId: string }) => {
      if (data.playerId === userId) {
        setIsInGame(false);
        setGameMode(null);
      }
    };

    // Set up listeners
    socket.on("lobbyStatusResponse", handleLobbyStatusResponse);
    socket.on("gameStatusResponse", handleGameStatusResponse);
    socket.on("userLobbyStatusChanged", handleLobbyStatusChange);
    socket.on("userGameStatusChanged", handleGameStatusChange);
    socket.on("player_joined_lobby", handlePlayerJoinedLobby);
    socket.on("player_left_lobby", handlePlayerLeftLobby);
    socket.on("player_entered_game", handlePlayerEnteredGame);
    socket.on("player_exited_game", handlePlayerExitedGame);
    socket.on("battle_ended", handlePlayerExitedGame);

    // Clean up
    return () => {
      if (socket) {
        socket.off("lobbyStatusResponse", handleLobbyStatusResponse);
        socket.off("gameStatusResponse", handleGameStatusResponse);
        socket.off("userLobbyStatusChanged", handleLobbyStatusChange);
        socket.off("userGameStatusChanged", handleGameStatusChange);
        socket.off("player_joined_lobby", handlePlayerJoinedLobby);
        socket.off("player_left_lobby", handlePlayerLeftLobby);
        socket.off("player_entered_game", handlePlayerEnteredGame);
        socket.off("player_exited_game", handlePlayerExitedGame);
        socket.off("battle_ended", handlePlayerExitedGame);
      }
    };
  }, [userId]);

  // Return both statuses and game mode
  return { isInLobby, isInGame, gameMode };
};
