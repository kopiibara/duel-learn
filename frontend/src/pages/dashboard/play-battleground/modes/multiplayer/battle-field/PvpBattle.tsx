"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { useLocation } from "react-router-dom";

// Character animations
import playerCharacter from "../../../../../../assets/characterinLobby/playerCharacter.gif"; // Regular idle animation for player
import enemyCharacter from "../../../../../../assets/characterinLobby/playerCharacter.gif"; // Regular idle animation for enemy

// Import components
import PlayerInfo from "./components/PlayerInfo";
import Character from "./components/Character";
import CardSelection from "./components/CardSelection";

// Import consolidated components
import { useBattle } from "./hooks/useBattle";
import { WaitingOverlay, LoadingOverlay } from "./overlays/BattleOverlays";
import { VictoryModal } from "./modals/BattleModals";
import CharacterAnimationManager from "./components/CharacterAnimationManager";
import GameStartAnimation from "./components/GameStartAnimation";
import GuestWaitingForRandomization from "./components/GuestWaitingForRandomization";

// Import utils
import { TurnRandomizer, QuestionTimer, getCharacterImage } from "./utils";

interface BattleState {
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

/**
 * PvpBattle component - Main battle screen for player vs player mode
 */
export default function PvpBattle() {
  const location = useLocation();
  const { hostUsername, guestUsername, isHost, lobbyCode, hostId, guestId } = location.state || {};

  // Game state
  const [timeLeft, setTimeLeft] = useState(25);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 30;
  const [waitingForPlayer, setWaitingForPlayer] = useState(true);
  const [battleState, setBattleState] = useState<BattleState | null>(null);

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

  // Animation state for player and enemy
  const [enemyAnimationState, setEnemyAnimationState] = useState("idle");
  const [playerAnimationState, setPlayerAnimationState] = useState("idle");
  const [enemyPickingIntroComplete, setEnemyPickingIntroComplete] = useState(false);
  const [playerPickingIntroComplete, setPlayerPickingIntroComplete] = useState(false);

  // Turn randomizer states
  const [showRandomizer, setShowRandomizer] = useState(false);
  const [randomizationDone, setRandomizationDone] = useState(false);

  // Victory modal states
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [victoryMessage, setVictoryMessage] = useState("");

  // Use the Battle hooks
  const { handleLeaveBattle, isEndingBattle, setIsEndingBattle } = useBattle({
    lobbyCode,
    hostId,
    guestId,
    isHost,
    battleState,
    currentUserId,
    opponentName,
    gameStarted,
    randomizationDone,
    showVictoryModal,
    showGameStart,
    setWaitingForPlayer,
    setShowRandomizer,
    setBattleState,
    setGameStarted,
    setShowGameStart,
    setGameStartText,
    setIsMyTurn,
    setPlayerAnimationState,
    setPlayerPickingIntroComplete,
    setEnemyAnimationState,
    setEnemyPickingIntroComplete,
    setShowCards,
    setShowVictoryModal,
    setVictoryMessage
  });

  // Function to determine if guest is waiting for randomization
  const isGuestWaitingForRandomization = !isHost &&
    !waitingForPlayer &&
    battleState?.battle_started &&
    !battleState?.current_turn &&
    !randomizationDone;

  // Handle card selection
  const handleCardSelected = (cardId: string) => {
    // When player selects a card, it's no longer their turn
    // Reset player animations to idle
    setPlayerAnimationState("idle");
    setPlayerPickingIntroComplete(false);

    // In a real app, you would send this selection to the server
    // For now, just switch turns
    setIsMyTurn(false);

    // Set enemy animation to picking - they get their turn next
    setEnemyAnimationState("picking");
    setEnemyPickingIntroComplete(false);

    // Simulate opponent's turn (in a real app, this would come from the server)
    setTimeout(() => {
      // After 3 seconds, switch back to player's turn
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
        setPlayerPickingIntroComplete(false);
        setEnemyAnimationState("idle");
      } else {
        // If it's opponent's turn, their character should be picking
        setEnemyAnimationState("picking");
        setEnemyPickingIntroComplete(false);
        setPlayerAnimationState("idle");
      }
    }
  }, [isMyTurn, gameStarted, waitingForPlayer]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || waitingForPlayer) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, waitingForPlayer]);

  // Handle victory confirmation
  const handleVictoryConfirm = () => {
    // Remove all event listeners to prevent confirmation dialog
    window.onbeforeunload = null;

    // Navigate directly to dashboard without creating a history entry
    window.location.replace('/dashboard/home');
  };

  // Handle settings button click
  const handleSettingsClick = async () => {
    // Prevent multiple calls
    if (isEndingBattle) return;

    // Show confirmation dialog
    const confirmLeave = window.confirm(
      "Are you sure you want to leave the battle? Your progress will be lost and the battle will end."
    );

    if (confirmLeave) {
      try {
        await handleLeaveBattle();
      } catch (error) {
        console.error("Error leaving battle:", error);
        // Force navigation anyway on error
        window.location.replace('/dashboard/home');
      }
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Character animation manager */}
      <CharacterAnimationManager
        playerAnimationState={playerAnimationState}
        enemyAnimationState={enemyAnimationState}
        setPlayerPickingIntroComplete={setPlayerPickingIntroComplete}
        setEnemyPickingIntroComplete={setEnemyPickingIntroComplete}
        playerPickingIntroComplete={playerPickingIntroComplete}
        enemyPickingIntroComplete={enemyPickingIntroComplete}
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
          imageSrc={getCharacterImage(playerCharacter, playerAnimationState, playerPickingIntroComplete)}
          alt="Player Character"
        />

        <Character
          imageSrc={getCharacterImage(enemyCharacter, enemyAnimationState, enemyPickingIntroComplete)}
          alt="Enemy Character"
          isRight
        />

        {/* Turn Randomizer (only shown to host) */}
        <TurnRandomizer
          isHost={isHost}
          lobbyCode={lobbyCode}
          hostUsername={hostUsername}
          guestUsername={guestUsername}
          hostId={hostId}
          guestId={guestId}
          showRandomizer={showRandomizer}
          setRandomizationDone={setRandomizationDone}
          setShowRandomizer={setShowRandomizer}
          setShowGameStart={setShowGameStart}
          setGameStartText={setGameStartText}
          setGameStarted={setGameStarted}
          setIsMyTurn={setIsMyTurn}
          setPlayerAnimationState={setPlayerAnimationState}
          setPlayerPickingIntroComplete={setPlayerPickingIntroComplete}
          setEnemyAnimationState={setEnemyAnimationState}
          setEnemyPickingIntroComplete={setEnemyPickingIntroComplete}
          setShowCards={setShowCards}
        />

        {/* Waiting for host to randomize (shown to guest) */}
        <GuestWaitingForRandomization
          waitingForRandomization={isGuestWaitingForRandomization}
        />

        {/* Game Start Animation */}
        <GameStartAnimation
          showGameStart={showGameStart}
          gameStartText={gameStartText}
        />

        {/* Card Selection UI - Show after the waiting screen */}
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

        {/* Waiting overlay - now checks only if either player isn't in battle yet */}
        <WaitingOverlay
          isVisible={waitingForPlayer}
          message="Waiting for your opponent to connect..."
        />

        {/* Loading overlay when ending battle */}
        <LoadingOverlay isVisible={isEndingBattle} />

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
