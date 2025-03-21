import { useState } from 'react';
import axios from 'axios';

interface TurnRandomizerProps {
    isHost: boolean;
    lobbyCode: string;
    hostUsername: string;
    guestUsername: string;
    hostId: string;
    guestId: string;
    showRandomizer: boolean;
    currentDisplayName?: string;
    setRandomizationDone: (value: boolean) => void;
    setShowRandomizer: (value: boolean) => void;
    setShowGameStart: (value: boolean) => void;
    setGameStartText: (text: string) => void;
    setGameStarted: (value: boolean) => void;
    setIsMyTurn: (value: boolean) => void;
    setPlayerAnimationState: (state: string) => void;
    setPlayerPickingIntroComplete: (value: boolean) => void;
    setEnemyAnimationState: (state: string) => void;
    setEnemyPickingIntroComplete: (value: boolean) => void;
    setShowCards: (value: boolean) => void;
}

export default function TurnRandomizer({
    isHost,
    lobbyCode,
    hostUsername,
    guestUsername,
    hostId,
    guestId,
    showRandomizer,
    setRandomizationDone,
    setShowRandomizer,
    setShowGameStart,
    setGameStartText,
    setGameStarted,
    setIsMyTurn,
    setPlayerAnimationState,
    setPlayerPickingIntroComplete,
    setEnemyAnimationState,
    setEnemyPickingIntroComplete,
    setShowCards
}: TurnRandomizerProps) {
    // State for randomization process
    const [randomizing, setRandomizing] = useState(false);
    // Local state to track current displayed name during randomization
    const [currentDisplayName, setCurrentDisplayName] = useState('');

    // Function to handle the randomizer button click
    const handleRandomizeTurn = async () => {
        if (randomizing) return;

        setRandomizing(true);

        // Visual randomization effect (alternating between host and guest)
        let duration = 3000; // 3 seconds of animation
        let toggleInterval = 100; // Start fast (100ms)
        let currentTime = 0;

        // Start with a random player
        let currentTurn = Math.random() < 0.5 ? hostUsername : guestUsername;

        // Set initial game start text and local display state
        setGameStartText(`${currentTurn} will go first!`);
        setCurrentDisplayName(`${currentTurn} will go first!`);

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
            const text = `${currentTurn} will go first!`;
            setGameStartText(text);
            setCurrentDisplayName(text);

            // End the animation after duration
            if (currentTime >= duration) {
                clearInterval(turnInterval);

                // Make a final decision - this ensures we don't get stuck on a rapidly changing value
                const finalSelection = currentTurn;
                const finalText = `${finalSelection} will go first!`;
                setGameStartText(finalText);
                setCurrentDisplayName(finalText);

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

    // Render the randomizer UI if showRandomizer is true and user is host
    if (!showRandomizer || !isHost) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-40 flex flex-col items-center justify-center">
            <div className="text-center">
                <h2 className="text-purple-300 text-4xl font-bold mb-8">Ready to Battle!</h2>
                <p className="text-white text-xl mb-12">Both players have joined. Who will go first?</p>

                {randomizing ? (
                    <div className="mb-8">
                        <div className="text-white text-3xl font-bold animate-pulse mb-4">
                            Randomizing...
                        </div>
                        <div className="text-white text-4xl font-bold">
                            {/* Display the current name during randomization */}
                            {currentDisplayName}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleRandomizeTurn}
                        className="px-8 py-4 bg-purple-700 hover:bg-purple-600 text-white text-xl font-bold rounded-lg transition-colors"
                    >
                        Randomize First Turn
                    </button>
                )}
            </div>
        </div>
    );
} 