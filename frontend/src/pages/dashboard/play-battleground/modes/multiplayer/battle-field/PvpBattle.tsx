"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";

// Character animations
import playerCharacter from "../../../../../../assets/characterinLobby/playerCharacter.gif"; // Regular idle animation for player
import enemyCharacter from "../../../../../../assets/characterinLobby/playerCharacter.gif"; // Regular idle animation for enemy
import characterPicking from "../../../../../../assets/characterinLobby/CharacterPicking.gif"; // Initial picking animation (non-looping)
import characterPickingLoop from "../../../../../../assets/characterinLobby/CharacterPickingLoop.gif"; // Continuous picking animation (looping)

import { useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Import components
import PlayerInfo from "./components/PlayerInfo";
import QuestionTimer from "./components/QuestionTimer";
import Character from "./components/Character";
import WaitingOverlay from "./components/WaitingOverlay";
import CardSelection from "./components/CardSelection";

/**
 * PvpBattle component - Main battle screen for player vs player mode
 */
export default function PvpBattle() {
  const location = useLocation();
  const { hostUsername, guestUsername, isHost, lobbyCode } = location.state || {};

  // Debug the values received from location state
  console.log('PvpBattle state:', { hostUsername, guestUsername, isHost, lobbyCode });

  // Game state
  const [timeLeft, setTimeLeft] = useState(25);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 30;
  const [waitingForPlayer, setWaitingForPlayer] = useState(true);

  // Turn-based gameplay state
  const [gameStarted, setGameStarted] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showGameStart, setShowGameStart] = useState(false);
  const [gameStartText, setGameStartText] = useState("");

  // Player info
  const playerName = isHost ? (hostUsername || "Host") : (guestUsername || "Guest");
  const opponentName = isHost ? (guestUsername || "Guest") : (hostUsername || "Host");
  const playerHealth = 100;
  const opponentHealth = 100;
  const maxHealth = 100;

  // Debug the assigned player names
  console.log('Assigned names:', { playerName, opponentName, isHost });

  // Animation state for player and enemy
  const [enemyAnimationState, setEnemyAnimationState] = useState("idle");
  const [playerAnimationState, setPlayerAnimationState] = useState("idle");
  const [enemyPickingIntroComplete, setEnemyPickingIntroComplete] = useState(false);
  const [playerPickingIntroComplete, setPlayerPickingIntroComplete] = useState(false);

  // Check for player connection
  useEffect(() => {
    const checkPlayersConnected = async () => {
      try {
        if (lobbyCode) {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/battle/invitations-lobby/status/${lobbyCode}`
          );

          if (response.data?.data?.both_players_connected) {
            setWaitingForPlayer(false);

            // Start the game once both players are connected
            if (!gameStarted) {
              startGame();
            }
          }
        }
      } catch (error) {
        console.error("Error checking player connection status:", error);
      }
    };

    // Poll for player connection status
    const interval = setInterval(checkPlayersConnected, 1500);
    checkPlayersConnected(); // Check immediately

    // For demo purposes, automatically set waiting to false after 18 seconds
    const demoTimeout = setTimeout(() => {
      setWaitingForPlayer(false);

      // Start the game once the demo timeout completes
      if (!gameStarted) {
        startGame();
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(demoTimeout);
    };
  }, [lobbyCode, gameStarted]);

  // Start the game and determine who goes first
  const startGame = () => {
    setGameStarted(true);

    // Show game start animation
    setShowGameStart(true);

    // Randomly determine who goes first
    const hostGoesFirst = Math.random() < 0.5;
    const playerGoesFirst = hostGoesFirst === isHost;
    setIsMyTurn(playerGoesFirst);

    // Set text for who goes first
    setGameStartText(`${playerGoesFirst ? "You" : opponentName} will go first!`);

    // Hide the animation after 2.5 seconds
    setTimeout(() => {
      setShowGameStart(false);

      // Show cards after game start animation finishes
      setTimeout(() => {
        setShowCards(true);

        // Set initial animation states based on who goes first
        if (playerGoesFirst) {
          setPlayerAnimationState("picking");
          setPlayerPickingIntroComplete(false);
          setEnemyAnimationState("idle");
        } else {
          setEnemyAnimationState("picking");
          setEnemyPickingIntroComplete(false);
          setPlayerAnimationState("idle");
        }
      }, 500);
    }, 2500);
  };

  // Handle card selection
  const handleCardSelected = (cardId: string) => {
    console.log(`Selected card: ${cardId}`);

    // When player selects a card, it's no longer their turn
    // Reset player animations to idle
    setPlayerAnimationState("idle");
    setPlayerPickingIntroComplete(false);

    // In a real app, you would send this selection to the server
    // For now, just switch turns
    setIsMyTurn(false);

    // Set enemy animation to picking - they get their turn next
    // Start with the intro animation (non-looping)
    setEnemyAnimationState("picking");
    setEnemyPickingIntroComplete(false);

    // Simulate opponent's turn (in a real app, this would come from the server)
    setTimeout(() => {
      // After 3 seconds, switch back to player's turn
      // Start with the intro animation again (non-looping)
      setPlayerAnimationState("picking");
      setPlayerPickingIntroComplete(false);
      setEnemyAnimationState("idle");
      setEnemyPickingIntroComplete(false);
      setIsMyTurn(true);
    }, 3000);
  };

  // Update animation states when turns change
  useEffect(() => {
    if (gameStarted && !waitingForPlayer) {
      if (isMyTurn) {
        // If it's my turn, my character should be picking
        setPlayerAnimationState("picking");
        setPlayerPickingIntroComplete(false); // Start with the non-looping intro animation
        setEnemyAnimationState("idle");
      } else {
        // If it's opponent's turn, their character should be picking
        setEnemyAnimationState("picking");
        setEnemyPickingIntroComplete(false); // Start with the non-looping intro animation
        setPlayerAnimationState("idle");
      }
    }
  }, [isMyTurn, gameStarted, waitingForPlayer]);

  // Handle completion of picking intro animation for player - only runs ONCE per turn
  useEffect(() => {
    if (playerAnimationState === "picking" && !playerPickingIntroComplete) {
      // Set a timer for the exact duration of the characterPicking.gif
      const introDuration = 400; // Duration in ms - adjust to match your actual GIF duration

      const introTimer = setTimeout(() => {
        // After intro animation completes exactly once, switch to the looping animation
        setPlayerPickingIntroComplete(true);
        console.log("Player picking intro completed, switching to loop animation");
      }, introDuration);

      return () => clearTimeout(introTimer);
    }
  }, [playerAnimationState, playerPickingIntroComplete]);

  // Handle completion of picking intro animation for enemy - only runs ONCE per turn
  useEffect(() => {
    if (enemyAnimationState === "picking" && !enemyPickingIntroComplete) {
      // Set a timer for the exact duration of the characterPicking.gif
      const introDuration = 400; // Duration in ms - adjust to match your actual GIF duration

      const introTimer = setTimeout(() => {
        // After intro animation completes exactly once, switch to the looping animation
        setEnemyPickingIntroComplete(true);
        console.log("Enemy picking intro completed, switching to loop animation");
      }, introDuration);

      return () => clearTimeout(introTimer);
    }
  }, [enemyAnimationState, enemyPickingIntroComplete]);

  // Helper function to get the correct animation image for a character
  const getCharacterImage = (baseImage: string, animationState: string, introComplete: boolean): string => {
    if (animationState === "picking") {
      // If in picking state, show intro animation until it completes, then show loop
      return introComplete ? characterPickingLoop : characterPicking;
    }
    return baseImage;
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || waitingForPlayer) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, waitingForPlayer]);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top UI Bar */}
      <div className="w-full py-4 px-4 sm:px-8 md:px-16 lg:px-32 xl:px-80 mt-4 lg:mt-12 flex items-center justify-between">
        <PlayerInfo
          name={playerName}
          health={playerHealth}
          maxHealth={maxHealth}
        />

        <QuestionTimer
          timeLeft={timeLeft}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
        />

        <PlayerInfo
          name={opponentName}
          health={opponentHealth}
          maxHealth={maxHealth}
          isRightAligned
        />

        {/* Settings button */}
        <button className="absolute right-2 sm:right-4 top-2 sm:top-4 text-white">
          <Settings size={16} className="sm:w-[20px] sm:h-[20px]" />
        </button>
      </div>

      {/* Main Battle Area */}
      <div className="flex-1 relative">
        {/* Purple battlefield floor */}
        <div className="absolute bottom-0 left-0 right-0 h-[43vh] bg-purple-900/20"></div>

        {/* Characters */}
        <Character
          imageSrc={getCharacterImage(playerCharacter, playerAnimationState, playerPickingIntroComplete)}
          alt="Player Character"
        />

        <Character
          imageSrc={getCharacterImage(enemyCharacter, enemyAnimationState, enemyPickingIntroComplete)}
          alt="Enemy Character"
          isRight
        />

        {/* Game Start Animation */}
        <AnimatePresence>
          {showGameStart && (
            <motion.div
              className="fixed inset-0 bg-black/70 z-30 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="text-purple-300 text-5xl font-bold mb-4">BATTLE START!</div>
                <div className="text-white text-2xl">{gameStartText}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Selection UI - Show after the waiting screen */}
        {gameStarted && showCards && !waitingForPlayer && (
          <div className="fixed inset-0 bg-black/40 z-10">
            <CardSelection
              isMyTurn={isMyTurn}
              opponentName={opponentName}
              onCardSelected={handleCardSelected}
            />
          </div>
        )}

        {/* Waiting overlay */}
        <WaitingOverlay isVisible={waitingForPlayer} />
      </div>
    </div>
  );
}
