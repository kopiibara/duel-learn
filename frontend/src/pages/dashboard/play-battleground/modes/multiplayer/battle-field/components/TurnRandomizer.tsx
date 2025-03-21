import { useState } from "react";
import axios from "axios";

interface TurnRandomizerProps {
    lobbyCode: string;
    hostId: string;
    guestId: string;
    hostUsername: string;
    guestUsername: string;
    isHost: boolean;
    setRandomizationDone: (done: boolean) => void;
    setRandomizing: (randomizing: boolean) => void;
    setGameStartText: (text: string) => void;
    setShowRandomizer: (show: boolean) => void;
    setGameStarted: (started: boolean) => void;
    setIsMyTurn: (isMyTurn: boolean) => void;
    setShowGameStart: (show: boolean) => void;
    setShowCards: (show: boolean) => void;
    setPlayerAnimationState: (state: string) => void;
    setPlayerPickingIntroComplete: (complete: boolean) => void;
    setEnemyAnimationState: (state: string) => void;
    setEnemyPickingIntroComplete: (complete: boolean) => void;
}

export function useTurnRandomizer({
    lobbyCode,
    hostId,
    guestId,
    hostUsername,
    guestUsername,
    isHost,
    setRandomizationDone,
    setRandomizing,
    setGameStartText,
    setShowRandomizer,
    setGameStarted,
    setIsMyTurn,
    setShowGameStart,
    setShowCards,
    setPlayerAnimationState,
    setPlayerPickingIntroComplete,
    setEnemyAnimationState,
    setEnemyPickingIntroComplete
}: TurnRandomizerProps) {
    // Function to handle the randomizer button click
    const handleRandomizeTurn = async () => {
        setRandomizing(true);

        // Visual randomization effect (alternating between host and guest)
        let duration = 3000; // 3 seconds of animation
        let toggleInterval = 100; // Start fast (100ms)
        let currentTime = 0;

        // Start with a random player
        let currentTurn = Math.random() < 0.5 ? hostUsername : guestUsername;

        // Set initial game start text
        setGameStartText(`${currentTurn} will go first!`);

        // Create a div to show the alternating names
        const turnInterval = setInterval(() => {
            currentTime += toggleInterval;

            // Slow down the toggle as we approach the end
            if (currentTime > duration / 2) {
                toggleInterval = 200; // Slow down midway
            }
            if (currentTime > duration * 0.75) {
                toggleInterval = 300; // Slow down further
            }

            // Toggle between host and guest
            currentTurn = currentTurn === hostUsername ? guestUsername : hostUsername;

            // Update UI to show current selection
            setGameStartText(`${currentTurn} will go first!`);

            // End the animation after duration
            if (currentTime >= duration) {
                clearInterval(turnInterval);

                // Make a final decision - this ensures we don't get stuck on a rapidly changing value
                const finalSelection = currentTurn;
                setGameStartText(`${finalSelection} will go first!`);

                finalizeRandomization(finalSelection);
            }
        }, toggleInterval);
    };

    // Function to finalize the random selection
    const finalizeRandomization = async (selectedPlayer: string) => {
        try {
            // Use the ID instead of username
            const selectedPlayerId = selectedPlayer === hostUsername ? hostId : guestId;

            console.log(`Finalizing turn randomization: selected ${selectedPlayer} (ID: ${selectedPlayerId})`);

            // Set randomizationDone immediately to prevent further randomization attempts
            setRandomizationDone(true);

            // Hide the randomizer UI immediately, don't wait for the polling
            setShowRandomizer(false);

            // Show the final selection in the game start text
            setShowGameStart(true);

            // Update turn with player ID in battle_sessions
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/update-session`,
                {
                    lobby_code: lobbyCode,
                    current_turn: selectedPlayerId // Use ID instead of username
                }
            );

            // Optionally, we could extend our state to include who was selected to go first
            // This would let us start rendering things even before the polling catches up
            if (isHost) {
                const isPlayerFirst = selectedPlayer === hostUsername;
                // Setup initial game state based on who goes first
                setGameStarted(true);
                setIsMyTurn(isPlayerFirst);

                if (isPlayerFirst) {
                    setPlayerAnimationState("picking");
                    setPlayerPickingIntroComplete(false);
                    setEnemyAnimationState("idle");
                } else {
                    setEnemyAnimationState("picking");
                    setEnemyPickingIntroComplete(false);
                    setPlayerAnimationState("idle");
                }

                // Hide the initial game start screen after 2.5 seconds and show cards
                setTimeout(() => {
                    setShowGameStart(false);
                    setShowCards(true);
                }, 2500);
            }

            setRandomizing(false);

            // The next polling cycle will detect the turn is set and proceed with the game
        } catch (error) {
            console.error("Error setting turn:", error);
            setRandomizing(false);
            // If there's an error, allow retrying
            setRandomizationDone(false);
        }
    };

    return {
        handleRandomizeTurn
    };
} 