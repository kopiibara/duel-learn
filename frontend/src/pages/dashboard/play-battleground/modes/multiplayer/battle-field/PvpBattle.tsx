"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

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
  const navigate = useNavigate();
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
  const [isEndingBattle, setIsEndingBattle] = useState(false);

  // Handle leaving the battle and updating the database
  const handleLeaveBattle = async () => {
    // Prevent multiple calls
    if (isEndingBattle) return;

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
          try {
            await handleLeaveBattle(); // Wait for this to complete before allowing navigation
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
            try {
              await handleLeaveBattle(); // Wait for this to complete
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
  }, [navigate, lobbyCode, isHost, hostId, guestId, battleState, isEndingBattle, showVictoryModal]);

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

  // Function to handle the randomizer button click
  const handleRandomizeTurn = async () => {
    if (!battleState || randomizing) return;

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

  // Function to finalize the random selection - update this to use IDs and battle_sessions
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

  // Add handleVictoryConfirm function after other handler functions
  const handleVictoryConfirm = () => {
    // Remove all event listeners to prevent confirmation dialog
    window.onbeforeunload = null;

    // Clear all polling intervals
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (battleEndingPollingRef.current) {
      clearInterval(battleEndingPollingRef.current);
    }

    // Navigate directly to dashboard without creating a history entry
    window.location.replace('/dashboard/home');
  };

  // Add handler for the settings button
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

      try {
        await handleLeaveBattle();
      } catch (err) {
        console.error("Error in handleLeaveBattle called from settings click:", err);
        // Force redirect even if error occurs
        window.location.replace('/dashboard/home');
      }
    }
  };

  // Check for battle reload flag when component mounts
  useEffect(() => {
    const reloadConfirmed = sessionStorage.getItem('battle_reload_confirmed') === 'true';

    if (reloadConfirmed) {
      console.log("Detected reload after confirmation, ending battle...");

      // Get battle data from sessionStorage
      const storedLobbyCode = sessionStorage.getItem('battle_lobby_code');
      const storedIsHost = sessionStorage.getItem('battle_is_host') === 'true';
      const storedHostId = sessionStorage.getItem('battle_host_id');
      const storedGuestId = sessionStorage.getItem('battle_guest_id');

      if (storedLobbyCode) {
        // Show loading state
        setIsEndingBattle(true);

        // Send request to end battle
        const payload = {
          lobby_code: storedLobbyCode,
          winner_id: storedIsHost ? storedGuestId : storedHostId,
          battle_end_reason: 'Left The Game'
        };

        console.log("Sending battle end request after reload:", payload);

        axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/end`,
          payload
        )
          .then(response => {
            console.log("Battle ended successfully after reload:", response.data);
          })
          .catch(error => {
            console.error("Error ending battle after reload:", error);
          })
          .finally(() => {
            // Clear the reload flags
            sessionStorage.removeItem('battle_reload_confirmed');
            sessionStorage.removeItem('battle_lobby_code');
            sessionStorage.removeItem('battle_is_host');
            sessionStorage.removeItem('battle_host_id');
            sessionStorage.removeItem('battle_guest_id');

            // Redirect to dashboard
            window.location.replace('/dashboard/home');
          });
      }
    }
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">
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

        {/* Randomizer Overlay (only shown to host when both players are ready but no turn decided) */}
        {showRandomizer && isHost && (
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
                    {gameStartText}
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
        )}

        {/* Waiting for host to randomize (shown to guest) */}
        {!waitingForPlayer && battleState?.battle_started && !battleState?.current_turn && !isHost && !randomizationDone && (
          <div className="fixed inset-0 bg-black/80 z-40 flex flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-purple-300 text-4xl font-bold mb-8">Ready to Battle!</h2>
              <p className="text-white text-xl mb-12">Waiting for host to determine who goes first...</p>
              <div className="flex space-x-4 justify-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

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
        {isEndingBattle && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-purple-300 text-3xl font-bold mb-6">Ending Battle...</h2>
              <div className="flex space-x-4 justify-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Victory Modal */}
        {showVictoryModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 relative">
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleVictoryConfirm}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <h2 className="text-purple-300 text-3xl font-bold mb-4 text-center">
                Victory!
              </h2>

              <p className="text-white text-xl mb-8 text-center">
                {victoryMessage}
              </p>

              <button
                onClick={handleVictoryConfirm}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-lg transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
