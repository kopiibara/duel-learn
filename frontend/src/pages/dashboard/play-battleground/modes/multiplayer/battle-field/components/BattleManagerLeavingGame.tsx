import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Define interface for the battle state
export interface BattleState {
    current_turn: string | null;
    round_number: number;
    total_rounds: number;
    host_card: string | null;
    guest_card: string | null;
    host_score: number;
    guest_score: number;
    host_health: number;
    guest_health: number;
    is_active: boolean;
    winner_id: string | null;
    battle_end_reason: string | null;
    host_in_battle: boolean;
    guest_in_battle: boolean;
    battle_started: boolean;
    host_username: string | null;
    guest_username: string | null;
    ID: number;
    session_uuid: string;
}

interface BattleManagerProps {
    lobbyCode: string;
    isHost: boolean;
    hostId: string;
    guestId: string;
    currentUserId: string;
    opponentId: string;
    opponentName: string;
    isEndingBattle: boolean;
    setIsEndingBattle: (isEnding: boolean) => void;
    setWaitingForPlayer: (waiting: boolean) => void;
    setShowRandomizer: (show: boolean) => void;
    setShowVictoryModal: (show: boolean) => void;
    setVictoryMessage: (message: string) => void;
    setGameStarted: (started: boolean) => void;
    setShowGameStart: (show: boolean) => void;
    setGameStartText: (text: string) => void;
    setIsMyTurn: (isMyTurn: boolean) => void;
    setShowCards: (show: boolean) => void;
    setPlayerAnimationState: (state: string) => void;
    setPlayerPickingIntroComplete: (complete: boolean) => void;
    setEnemyAnimationState: (state: string) => void;
    setEnemyPickingIntroComplete: (complete: boolean) => void;
    setRandomizationDone: (done: boolean) => void;
}

export function useBattleManager({
    lobbyCode,
    isHost,
    hostId,
    guestId,
    currentUserId,
    opponentId,
    opponentName,
    isEndingBattle,
    setIsEndingBattle,
    setWaitingForPlayer,
    setShowRandomizer,
    setShowVictoryModal,
    setVictoryMessage,
    setGameStarted,
    setShowGameStart,
    setGameStartText,
    setIsMyTurn,
    setShowCards,
    setPlayerAnimationState,
    setPlayerPickingIntroComplete,
    setEnemyAnimationState,
    setEnemyPickingIntroComplete,
    setRandomizationDone,
}: BattleManagerProps) {
    // State
    const [battleState, setBattleState] = useState<BattleState | null>(null);

    // Refs for tracking intervals
    const pollingIntervalRef = useRef<number | null>(null);
    const battleEndingPollingRef = useRef<number | null>(null);

    // Handle leaving the battle and updating the database
    const handleLeaveBattle = async () => {
        // Prevent multiple calls
        if (isEndingBattle) {
            console.log("Already ending battle, ignoring duplicate call");
            return;
        }

        try {
            setIsEndingBattle(true);
            console.log("Ending battle due to user leaving");

            // Flag to skip additional confirmation dialogs
            window.onbeforeunload = null;

            // Debug battle state before sending request
            console.log("Battle state when leaving:", {
                lobbyCode,
                sessionUuid: battleState?.session_uuid,
                sessionId: battleState?.ID,
                hostId,
                guestId,
                isHost,
                winnerId: isHost ? guestId : hostId
            });

            if (!battleState?.session_uuid && !battleState?.ID) {
                console.error("No session identifiers found! Will try using lobby code only.");
            }

            // Create the payload with session_uuid and also include session_id as backup
            const payload = {
                lobby_code: lobbyCode,
                winner_id: isHost ? guestId : hostId, // Opponent wins if player leaves
                battle_end_reason: 'Left The Game',
                session_uuid: battleState?.session_uuid,
                session_id: battleState?.ID // Include numeric ID as fallback
            };

            console.log("Sending battle end request with payload:", payload);

            // End the battle with appropriate status
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/end`,
                payload
            );

            console.log("Battle end response:", response.data);

            // Clear all polling intervals to prevent further API calls
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }

            if (battleEndingPollingRef.current) {
                clearInterval(battleEndingPollingRef.current);
                battleEndingPollingRef.current = null;
            }

            // Wait for the request to complete with a longer delay to ensure it propagates
            console.log("Waiting to ensure request propagates...");
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log("Done waiting, proceeding to navigation");

            // Force navigation to dashboard AFTER the request completes
            // Use replace instead of href to prevent history entry
            window.location.replace('/dashboard/home');

        } catch (error: any) { // Add type annotation to fix linter error
            console.error('Error ending battle:', error);
            console.error('Error details:', error.response?.data || 'No response data');

            // Remove beforeunload handler to prevent additional confirmation
            window.onbeforeunload = null;

            // Try alternative approach if first attempt failed
            try {
                console.log("First attempt failed, trying alternative approach...");

                // Try direct update with lobby_code only if we have it
                if (lobbyCode) {
                    console.log("Using lobby_code only approach");

                    const fallbackPayload = {
                        lobby_code: lobbyCode,
                        winner_id: isHost ? guestId : hostId,
                        battle_end_reason: 'Left The Game'
                    };

                    const fallbackResponse = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/end`,
                        fallbackPayload
                    );

                    console.log("Fallback battle end response:", fallbackResponse.data);

                    // Wait to ensure request processes
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (fallbackError) {
                console.error("Even fallback approach failed:", fallbackError);
            }

            // Add a delay even on error to ensure any partial processing completes
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Still redirect even if error occurs - use replace to prevent history entry
            window.location.replace('/dashboard/home');
        }
    };

    // Check for both players and battle start with dynamic polling
    useEffect(() => {
        // Function to check the battle status
        const checkBattleStatus = async () => {
            try {
                if (lobbyCode) {
                    console.log(`Polling battle session state for lobby: ${lobbyCode}`);

                    const response = await axios.get(
                        `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/session-state/${lobbyCode}`
                    );

                    if (response.data.success) {
                        const sessionState = response.data.data;

                        // Log the session state for debugging
                        console.log("Battle session state:", {
                            sessionUuid: sessionState.session_uuid,
                            isActive: sessionState.is_active,
                            hostInBattle: sessionState.host_in_battle,
                            guestInBattle: sessionState.guest_in_battle,
                            battleStarted: sessionState.battle_started,
                            currentTurn: sessionState.current_turn
                        });

                        const newBattleState = {
                            current_turn: sessionState.current_turn,
                            round_number: 1, // Default to 1 for now
                            total_rounds: sessionState.total_rounds || 30,
                            host_card: null,
                            guest_card: null,
                            host_score: 0,
                            guest_score: 0,
                            host_health: 100,
                            guest_health: 100,
                            is_active: sessionState.is_active === 1,
                            winner_id: null,
                            battle_end_reason: null,
                            host_in_battle: sessionState.host_in_battle === 1,
                            guest_in_battle: sessionState.guess_in_battle === 1, // Note the field name is misspelled in DB
                            battle_started: sessionState.battle_started === 1,
                            host_username: sessionState.host_username,
                            guest_username: sessionState.guest_username,
                            ID: sessionState.ID,
                            session_uuid: sessionState.session_uuid
                        };

                        setBattleState(newBattleState);

                        // Update waiting state based on both players being in battle
                        if (sessionState.host_in_battle === 1 && sessionState.guest_in_battle === 1) {
                            setWaitingForPlayer(false);

                            // Show randomizer to host if battle started but no current_turn set
                            if (sessionState.battle_started === 1 && !sessionState.current_turn && isHost) {
                                setShowRandomizer(true);
                            } else if (sessionState.battle_started === 1 && !sessionState.current_turn) {
                                // Guest just waits for host to randomize
                                console.log("Waiting for host to determine who goes first...");
                            } else if (sessionState.battle_started === 1 && sessionState.current_turn) {
                                // Turn has been decided, start the game
                                setShowRandomizer(false);

                                // Set game started if not already
                                setGameStarted(true);
                                setShowGameStart(true);

                                // Determine if it's the current player's turn
                                const isCurrentPlayerTurn = isHost
                                    ? sessionState.current_turn === hostId
                                    : sessionState.current_turn === guestId;

                                // Set the game start text based on whose turn it is
                                if (isCurrentPlayerTurn) {
                                    setGameStartText("You will go first!");
                                } else {
                                    const opponentName = isHost
                                        ? sessionState.guest_username || "Guest"
                                        : sessionState.host_username || "Host";
                                    setGameStartText(`${opponentName} will go first!`);
                                }

                                // Hide the animation after 2.5 seconds
                                setTimeout(() => {
                                    setShowGameStart(false);
                                    setShowCards(true);
                                }, 2500);

                                // Set initial turn state
                                setIsMyTurn(isCurrentPlayerTurn);

                                // Set initial animations
                                if (isCurrentPlayerTurn) {
                                    setPlayerAnimationState("picking");
                                    setPlayerPickingIntroComplete(false);
                                    setEnemyAnimationState("idle");
                                } else {
                                    setEnemyAnimationState("picking");
                                    setEnemyPickingIntroComplete(false);
                                    setPlayerAnimationState("idle");
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking battle status:", error);
            }
        };

        // Check immediately
        checkBattleStatus();

        // Dynamic polling interval based on game state
        // Use a longer interval once game has started to reduce server load
        const intervalTime = 2000; // 2 seconds

        console.log(`Setting polling interval to ${intervalTime}ms`);

        // Clear any existing interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Set new interval
        pollingIntervalRef.current = window.setInterval(checkBattleStatus, intervalTime);

        // Cleanup
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [
        lobbyCode,
        hostId,
        guestId,
        isHost,
        setWaitingForPlayer,
        setShowRandomizer,
        setGameStarted,
        setShowGameStart,
        setGameStartText,
        setIsMyTurn,
        setShowCards,
        setPlayerAnimationState,
        setPlayerPickingIntroComplete,
        setEnemyAnimationState,
        setEnemyPickingIntroComplete,
        setRandomizationDone
    ]);

    // Polling for battle endings
    useEffect(() => {
        const checkBattleEnding = async () => {
            try {
                // Skip if we have no session identifier
                if (!battleState) return;

                let endpoint = "";

                // Determine which endpoint to use based on available identifiers
                if (battleState.session_uuid) {
                    endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/end-status/${battleState.session_uuid}`;
                    console.log(`Checking battle end status using UUID: ${battleState.session_uuid}`);
                } else if (battleState.ID) {
                    // If no UUID but we have ID, use that
                    endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/end-status-by-id/${battleState.ID}`;
                    console.log(`Checking battle end status using ID: ${battleState.ID}`);
                } else if (lobbyCode) {
                    // Last resort - use lobby code
                    endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/end-status-by-lobby/${lobbyCode}`;
                    console.log(`Checking battle end status using lobby code: ${lobbyCode}`);
                } else {
                    console.log("No identifiers available to check battle ending");
                    return;
                }

                // Make the request
                const response = await axios.get(endpoint);
                console.log("Battle end status response:", response.data);

                if (response.data.success && response.data.data) {
                    const endingData = response.data.data;

                    // If battle has ended and current player is NOT the one who left
                    if (endingData.battle_end_reason === 'Left The Game' &&
                        endingData.winner_id === currentUserId) {
                        console.log(`Opponent left the game. Showing victory modal. Winner ID: ${endingData.winner_id}, Current user ID: ${currentUserId}`);
                        setVictoryMessage(`${opponentName} left the game. You won!`);
                        setShowVictoryModal(true);

                        // Clear polling intervals
                        if (battleEndingPollingRef.current) {
                            clearInterval(battleEndingPollingRef.current);
                        }
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking battle ending:", error);
            }
        };

        // Start polling for battle endings
        battleEndingPollingRef.current = window.setInterval(checkBattleEnding, 2000);

        // Cleanup
        return () => {
            if (battleEndingPollingRef.current) {
                clearInterval(battleEndingPollingRef.current);
            }
        };
    }, [
        battleState,
        lobbyCode,
        currentUserId,
        opponentName,
        setVictoryMessage,
        setShowVictoryModal
    ]);

    return {
        battleState,
        handleLeaveBattle
    };
} 