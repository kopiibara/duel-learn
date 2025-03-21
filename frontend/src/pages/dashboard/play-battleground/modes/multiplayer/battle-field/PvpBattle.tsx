"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { useLocation } from "react-router-dom";

// Character animations
import playerCharacter from "../../../../../../assets/characterinLobby/playerCharacter.gif"; // Regular idle animation for player
import enemyCharacter from "../../../../../../assets/characterinLobby/playerCharacter.gif"; // Regular idle animation for enemy
import characterPicking from "../../../../../../assets/characterinLobby/CharacterPicking.gif"; // Initial picking animation (non-looping)
import characterPickingLoop from "../../../../../../assets/characterinLobby/CharacterPickingLoop.gif"; // Continuous picking animation (looping)

// Import components
import PlayerInfo from "./components/PlayerInfo";
import QuestionTimer from "./components/QuestionTimer";
import Character from "./components/Character";
import WaitingOverlay from "./components/WaitingOverlay";
import CardSelection from "./components/CardSelection";

// Import new refactored components
import BattleExitHandler from "./components/BattleExitHandler";
import { BattleState, useBattleManager } from "./components/BattleManagerLeavingGame";
import {
  VictoryModal,
  RandomizerOverlay,
  WaitingForHostOverlay,
  GameStartAnimation,
  EndingBattleOverlay
} from "./components/BattleOverlays";
import { useBattleAnimations } from "./components/BattleAnimations";
import { useTurnRandomizer } from "./components/TurnRandomizer";

/**
 * PvpBattle component - Main battle screen for player vs player mode
 */
export default function PvpBattle() {
  const location = useLocation();
  const { hostUsername, guestUsername, isHost, lobbyCode, hostId, guestId } = location.state || {};

  // Debug the values received from location state
  console.log('PvpBattle state:', { hostUsername, guestUsername, isHost, lobbyCode, hostId, guestId });

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
  const currentUserId = isHost ? hostId : guestId;
  const opponentId = isHost ? guestId : hostId;
  const playerHealth = 100;
  const opponentHealth = 100;
  const maxHealth = 100;

  // Debug the assigned player names
  console.log('Assigned names:', { playerName, opponentName, isHost, currentUserId, opponentId });

  // Animation state for player and enemy
  const [enemyAnimationState, setEnemyAnimationState] = useState("idle");
  const [playerAnimationState, setPlayerAnimationState] = useState("idle");
  const [enemyPickingIntroComplete, setEnemyPickingIntroComplete] = useState(false);
  const [playerPickingIntroComplete, setPlayerPickingIntroComplete] = useState(false);

  // New states for turn randomizer
  const [showRandomizer, setShowRandomizer] = useState(false);
  const [randomizing, setRandomizing] = useState(false);
  const [randomizationDone, setRandomizationDone] = useState(false);

  // Victory and ending states
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [victoryMessage, setVictoryMessage] = useState("");
  const [isEndingBattle, setIsEndingBattle] = useState(false);

  // Setup animation hooks
  const { getCharacterImage } = useBattleAnimations({
    gameStarted,
    waitingForPlayer,
    isMyTurn,
    playerAnimationState,
    playerPickingIntroComplete,
    enemyAnimationState,
    enemyPickingIntroComplete,
    setPlayerAnimationState,
    setPlayerPickingIntroComplete,
    setEnemyAnimationState,
    setEnemyPickingIntroComplete
  });

  // Setup battle management hook
  const { battleState, handleLeaveBattle } = useBattleManager({
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
    setRandomizationDone
  });

  // Setup turn randomization hook
  const { handleRandomizeTurn } = useTurnRandomizer({
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
  });

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

  // Handle VictoryModal confirmation
  const handleVictoryConfirm = () => {
    // Remove all event listeners to prevent confirmation dialog
    window.onbeforeunload = null;

    // Navigate directly to dashboard without creating a history entry
    window.location.replace('/dashboard/home');
  };

  // Handle settings button click
  const handleSettingsClick = async () => {
    // Prevent multiple attempts to leave
    if (isEndingBattle) {
      console.log("Already ending battle, ignoring settings click");
      return;
    }

    const confirmLeave = window.confirm(
      "Are you sure you want to leave the battle? Your progress will be lost and the battle will end."
    );

    if (confirmLeave) {
      console.log("User confirmed leaving battle via settings button");

      // Remove the beforeunload handler to prevent additional confirmation dialog
      window.onbeforeunload = null;

      // Show loading state
      setIsEndingBattle(true);

      try {
        await handleLeaveBattle();
        // The handleLeaveBattle function will handle the navigation
      } catch (err) {
        console.error("Error in handleLeaveBattle called from settings click:", err);
        // Force redirect even if error occurs
        window.location.replace('/dashboard/home');
      }
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || waitingForPlayer) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, waitingForPlayer]);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Use Battle Exit Handler component */}
      <BattleExitHandler
        lobbyCode={lobbyCode}
        isHost={isHost}
        hostId={hostId}
        guestId={guestId}
        battleState={battleState}
        isEndingBattle={isEndingBattle}
        setIsEndingBattle={setIsEndingBattle}
        showVictoryModal={showVictoryModal}
        handleLeaveBattle={handleLeaveBattle}
      />

      {/* Top UI Bar */}
      <div className="w-full py-4 px-4 sm:px-8 md:px-16 lg:px-32 xl:px-80 mt-4 lg:mt-12 flex items-center justify-between">
        <PlayerInfo
          name={playerName}
          health={playerHealth}
          maxHealth={maxHealth}
          userId={currentUserId}
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
          userId={opponentId}
        />

        {/* Settings button */}
        <button
          className="absolute right-2 sm:right-4 top-2 sm:top-4 text-white"
          onClick={handleSettingsClick}
        >
          <Settings size={16} className="sm:w-[20px] sm:h-[20px]" />
        </button>
      </div>

      {/* Main Battle Area */}
      <div className="flex-1 relative">
        {/* Purple battlefield floor */}
        <div className="absolute bottom-0 left-0 right-0 h-[43vh] bg-purple-900/20"></div>

        {/* Characters */}
        <Character
          imageSrc={getCharacterImage(
            playerCharacter,
            playerAnimationState,
            playerPickingIntroComplete,
            characterPicking,
            characterPickingLoop
          )}
          alt="Player Character"
        />

        <Character
          imageSrc={getCharacterImage(
            enemyCharacter,
            enemyAnimationState,
            enemyPickingIntroComplete,
            characterPicking,
            characterPickingLoop
          )}
          alt="Enemy Character"
          isRight
        />

        {/* Use overlay components */}
        <RandomizerOverlay
          showRandomizer={showRandomizer}
          isHost={isHost}
          randomizing={randomizing}
          gameStartText={gameStartText}
          onRandomizeTurn={handleRandomizeTurn}
        />

        {/* Waiting for host to randomize (shown to guest) */}
        <WaitingForHostOverlay
          showWaitingForHost={!!(
            !waitingForPlayer &&
            battleState?.battle_started &&
            !battleState?.current_turn &&
            !isHost &&
            !randomizationDone
          )}
        />

        {/* Game Start Animation */}
        <GameStartAnimation
          showGameStart={showGameStart}
          gameStartText={gameStartText}
        />

        {/* Card Selection UI */}
        {gameStarted && showCards && !waitingForPlayer && (
          <div className="fixed inset-0 bg-black/40 z-10">
            <CardSelection
              isMyTurn={isMyTurn}
              opponentName={opponentName}
              playerName={playerName}
              onCardSelected={handleCardSelected}
            />
          </div>
        )}

        {/* Waiting overlay */}
        <WaitingOverlay
          isVisible={waitingForPlayer}
          message="Waiting for your opponent to connect..."
        />

        {/* Loading overlay when ending battle */}
        <EndingBattleOverlay
          isEndingBattle={isEndingBattle}
        />

        {/* Victory Modal */}
        <VictoryModal
          showVictoryModal={showVictoryModal}
          victoryMessage={victoryMessage}
          onConfirm={handleVictoryConfirm}
        />
      </div>
    </div>
  );
}
