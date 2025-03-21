"use client";

import { useState, useEffect, useRef } from "react";
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

  // Debug the values received from location state
  console.log('PvpBattle state:', { hostUsername, guestUsername, isHost, lobbyCode, hostId, guestId });

  // Reference to track polling intervals
  const pollingIntervalRef = useRef<number | null>(null);

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

  // Add new state variables after other state declarations
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [victoryMessage, setVictoryMessage] = useState("");
  const battleEndingPollingRef = useRef<number | null>(null);

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

  // Setup event listeners for page navigation and refresh
  useEffect(() => {
    // Don't set up event listeners if victory modal is shown
    if (showVictoryModal) {
      // Remove any existing listeners
      window.onbeforeunload = null;
      return;
    }

    // Flag to track if the user is intentionally leaving
    let isIntentionallyLeaving = false;

    // Handle page reload or tab close
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only show confirmation dialog if not already intentionally leaving
      // and not already ending battle
      if (!isIntentionallyLeaving && !isEndingBattle) {
        event.preventDefault();
        event.returnValue = "Are you sure you want to leave the battle? Your progress will be lost and the battle will end.";

        // Set a flag in sessionStorage to indicate user confirmed reload
        // This will be checked on page load to handle the reload case
        sessionStorage.setItem('battle_reload_confirmed', 'true');
        sessionStorage.setItem('battle_lobby_code', lobbyCode || '');
        sessionStorage.setItem('battle_is_host', isHost ? 'true' : 'false');
        sessionStorage.setItem('battle_host_id', hostId || '');
        sessionStorage.setItem('battle_guest_id', guestId || '');

        return event.returnValue;
      }
    };

    // Handle browser back button and URL changes
    const handlePopState = async (event: PopStateEvent) => {
      // Only handle if not already leaving intentionally or ending battle
      if (!isIntentionallyLeaving && !isEndingBattle) {
        // Prevent the navigation first
        event.preventDefault();
        window.history.pushState(null, '', window.location.pathname);

        // Show confirmation dialog
        const confirmLeave = window.confirm(
          "Are you sure you want to leave the battle? Your progress will be lost and the battle will end."
        );

        if (confirmLeave) {
          console.log("User confirmed leaving battle via popstate");
          isIntentionallyLeaving = true;

          // Remove the beforeunload handler to prevent additional confirmation dialog
          window.removeEventListener('beforeunload', handleBeforeUnload);
          window.onbeforeunload = null;

          // Show the loading overlay
          setIsEndingBattle(true);

          try {
            // Wait for the leave battle function to complete
            await handleLeaveBattle();

            // The handleLeaveBattle function already handles navigation
          } catch (err) {
            console.error("Error in handleLeaveBattle called from popstate:", err);
            // Force redirect even if error occurs
            window.location.replace('/dashboard/home');
          }
        }
      } else {
        console.log("Ignoring popstate event - already leaving:", {
          isIntentionallyLeaving,
          isEndingBattle
        });
      }
    };

    // Handle direct URL changes
    const handleURLChange = async () => {
      // Only handle if not already leaving intentionally or ending battle
      if (!isIntentionallyLeaving && !isEndingBattle) {
        const currentPath = window.location.pathname;
        const battlePath = `/dashboard/pvp-battle/${lobbyCode}`;

        if (currentPath !== battlePath) {
          console.log(`URL changed from ${battlePath} to ${currentPath}`);

          // Force back to the battle path first to prevent immediate navigation
          window.history.pushState(null, '', battlePath);

          // User is trying to navigate away
          const confirmLeave = window.confirm(
            "Are you sure you want to leave the battle? Your progress will be lost and the battle will end."
          );

          if (confirmLeave) {
            console.log("User confirmed leaving battle via URL change");
            isIntentionallyLeaving = true;

            // Remove the beforeunload handler to prevent additional confirmation dialog
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.onbeforeunload = null;

            // Show the loading overlay
            setIsEndingBattle(true);

            try {
              // Wait for the leave battle function to complete
              await handleLeaveBattle();

              // The handleLeaveBattle function already handles navigation
            } catch (err) {
              console.error("Error in handleLeaveBattle called from URL change:", err);
              // Force redirect even if error occurs
              window.location.replace('/dashboard/home');
            }
          }
        }
      } else {
        console.log("Ignoring URL change event - already leaving:", {
          isIntentionallyLeaving,
          isEndingBattle
        });
      }
    };

    // Special handler for actual navigation away (after confirmation)
    const handleUnload = () => {
      // Check if this is a reload case where we've already stored the data
      const reloadConfirmed = sessionStorage.getItem('battle_reload_confirmed') === 'true';

      // Only send the request if user hasn't confirmed through another handler
      // and we're not already in the process of ending the battle
      // and this is not a reload we're already handling
      if (!isIntentionallyLeaving && !isEndingBattle && !reloadConfirmed && battleState && (battleState.session_uuid || battleState.ID)) {
        try {
          // Use synchronous approach for unload event
          // This is a fallback in case the user closes the browser without confirmation
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/end`, false); // Synchronous request
          xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

          // Create the payload - include both session_uuid and session_id
          const payload = JSON.stringify({
            lobby_code: lobbyCode,
            winner_id: isHost ? guestId : hostId,
            battle_end_reason: 'Left The Game',
            session_uuid: battleState.session_uuid,
            session_id: battleState.ID // Include numeric ID as fallback
          });

          console.log('Sending sync XHR before unload with payload:', payload);
          xhr.send(payload);

          // Log the response (though this might not be visible in all browsers during unload)
          console.log('XHR status:', xhr.status, xhr.statusText);
        } catch (e) {
          console.error('Error in sync XHR during unload:', e);
        }
      }
    };

    // Register event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleURLChange);

    // Push initial state to prevent back button on first click
    window.history.pushState(null, '', window.location.pathname);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleURLChange);
    };
  }, [lobbyCode, isHost, hostId, guestId, battleState, isEndingBattle, showVictoryModal]);

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

            setBattleState({
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
            });

            // Update waiting state based on both players being in battle
            if (sessionState.host_in_battle === 1 && sessionState.guest_in_battle === 1) {
              setWaitingForPlayer(false);

              // Show randomizer to host if battle started but no current_turn set
              if (sessionState.battle_started === 1 && !sessionState.current_turn && isHost && !randomizationDone) {
                setShowRandomizer(true);
              } else if (sessionState.battle_started === 1 && !sessionState.current_turn && !randomizationDone) {
                // Guest just waits for host to randomize
                console.log("Waiting for host to determine who goes first...");
              } else if (sessionState.battle_started === 1 && sessionState.current_turn) {
                // Turn has been decided, start the game
                setShowRandomizer(false);

                if (!gameStarted) {
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
        }
      } catch (error) {
        console.error("Error checking battle status:", error);
      }
    };

    // Check immediately
    checkBattleStatus();

    // Dynamic polling interval based on game state
    // Use a longer interval once game has started to reduce server load
    const intervalTime = gameStarted ? 5000 : 2000; // 5 seconds if game started, 2 seconds otherwise

    console.log(`Setting polling interval to ${intervalTime}ms (game started: ${gameStarted})`);

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
  }, [lobbyCode, hostId, guestId, isHost, gameStarted, randomizationDone]);

  // Add new effect for polling battle endings after other effects
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
  }, [battleState?.session_uuid, battleState?.ID, currentUserId, opponentName, lobbyCode, battleState]);

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
