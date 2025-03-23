"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { useLocation } from "react-router-dom";
import axios from "axios";

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

// Import utils directly
import TurnRandomizer from "./utils/TurnRandomizer";
import { getCharacterImage } from "./utils/getCharacterImage";
import QuestionTimer from "./utils/QuestionTimer";

// Import shared BattleState interface
import { BattleState } from "./BattleState";

/**
 * PvpBattle component - Main battle screen for player vs player mode
 */
export default function PvpBattle() {
  const location = useLocation();
  const { hostUsername, guestUsername, isHost, lobbyCode, hostId, guestId } = location.state || {};

  // Game state
  const [timeLeft, setTimeLeft] = useState(25);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalItems, setTotalItems] = useState(30); // Default value, will be updated from study material
  const [waitingForPlayer, setWaitingForPlayer] = useState(true);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [difficultyMode, setDifficultyMode] = useState<string | null>(null);
  const [studyMaterialId, setStudyMaterialId] = useState<string | null>(null);

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
  const handleCardSelected = async (cardId: string) => {
    // When player selects a card, it's no longer their turn
    // Reset player animations to idle
    setPlayerAnimationState("idle");
    setPlayerPickingIntroComplete(false);

    try {
      // Determine if the current player is host or guest
      const playerType = isHost ? 'host' : 'guest';

      // Update the battle round with the selected card and switch turns
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/update-round`,
        {
          session_uuid: battleState?.session_uuid,
          player_type: playerType,
          card_id: cardId,
          lobby_code: lobbyCode
        }
      );

      if (response.data.success) {
        console.log(`Card ${cardId} selection successful, turn switched`);

        // Switch turns locally but keep UI visible
        setIsMyTurn(false);

        // Set enemy animation to picking - they get their turn next
        setEnemyAnimationState("picking");
        setEnemyPickingIntroComplete(false);
      } else {
        console.error("Failed to update battle round:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating battle round:", error);
    }
  };

  // Add polling for turn updates
  useEffect(() => {
    // Skip if game hasn't started or we're waiting for players
    if (!gameStarted || waitingForPlayer || !battleState?.session_uuid) return;

    // Function to check if it's our turn
    const checkTurn = async () => {
      try {
        // Get the latest session state
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/session-state/${lobbyCode}`
        );

        if (response.data.success && response.data.data) {
          const sessionData = response.data.data;

          // Update local battle state with proper type safety
          setBattleState(prevState => {
            // If prevState is null, we can't update it properly
            if (!prevState) return null;

            return {
              ...prevState,
              current_turn: sessionData.current_turn,
              // Only set cards if they exist in the session data
              ...(sessionData.host_card && { host_card: sessionData.host_card }),
              ...(sessionData.guest_card && { guest_card: sessionData.guest_card })
            };
          });

          // Check if it's this player's turn
          const isCurrentPlayerTurn = sessionData.current_turn === currentUserId;

          // If turn has changed
          if (isCurrentPlayerTurn !== isMyTurn) {
            console.log(`Turn changed: ${isMyTurn} → ${isCurrentPlayerTurn}`);

            // Update UI accordingly
            setIsMyTurn(isCurrentPlayerTurn);

            if (isCurrentPlayerTurn) {
              // My turn now - update animations 
              setPlayerAnimationState("picking");
              setPlayerPickingIntroComplete(false);
              setEnemyAnimationState("idle");
              setEnemyPickingIntroComplete(false);
            } else {
              // Opponent's turn - update animations
              setPlayerAnimationState("idle");
              setPlayerPickingIntroComplete(false);
              setEnemyAnimationState("picking");
              setEnemyPickingIntroComplete(false);
            }

            // Always show cards UI regardless of whose turn it is
            setShowCards(true);
          }
        }
      } catch (error) {
        console.error("Error checking turn status:", error);
      }
    };

    // Set up polling for turn updates (every 2 seconds)
    const turnCheckInterval = setInterval(checkTurn, 2000);

    // Initial check
    checkTurn();

    return () => clearInterval(turnCheckInterval);
  }, [gameStarted, waitingForPlayer, battleState?.session_uuid, lobbyCode, currentUserId, isMyTurn]);

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

  // Fetch battle session data to get difficulty mode and study material id
  useEffect(() => {
    const fetchBattleSessionData = async () => {
      if (!lobbyCode) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/session-with-material/${lobbyCode}`
        );

        if (response.data.success && response.data.data) {
          setDifficultyMode(response.data.data.difficulty_mode);

          // Get the study material id
          if (response.data.data.study_material_id) {
            setStudyMaterialId(response.data.data.study_material_id);

            // Fetch study material info to get total items
            try {
              const studyMaterialResponse = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/study-material/info/${response.data.data.study_material_id}`
              );

              if (studyMaterialResponse.data.success && studyMaterialResponse.data.data &&
                studyMaterialResponse.data.data.total_items) {
                setTotalItems(studyMaterialResponse.data.data.total_items);
              }
            } catch (error) {
              console.error("Error fetching study material info:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching battle session data:", error);
      }
    };

    fetchBattleSessionData();
  }, [lobbyCode]);

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
          totalQuestions={totalItems}
          difficultyMode={difficultyMode}
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
              difficultyMode={difficultyMode}
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
