import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; // Import axios for API calls

// Import the actual card images
import cardBackImage from "/General/CardDesignBack.png";
import cardFrontImage from "/cards/DefaultCardInside.png";

// Define card types
interface Card {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface CardSelectionProps {
  isMyTurn: boolean;
  opponentName: string;
  playerName: string;
  onCardSelected: (cardId: string) => void;
  difficultyMode?: string | null;
}

/**
 * CardSelection component handles the card selection UI during the battle
 */
const CardSelection: React.FC<CardSelectionProps> = ({
  isMyTurn,
  opponentName,
  playerName,
  onCardSelected,
  difficultyMode = "average", // Default to average difficulty if not provided
}) => {
  const [showBackCard, setShowBackCard] = useState(true);
  const [showCardOptions, setShowCardOptions] = useState(false);
  const [backCardExitComplete, setBackCardExitComplete] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [selectionTimer, setSelectionTimer] = useState(8); // 8 second timer
  const [timerActive, setTimerActive] = useState(false);

  // Card state management
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [persistentCards, setPersistentCards] = useState<Card[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const [isFirstTurn, setIsFirstTurn] = useState(true);

  // New state for card blocking effect
  const [hasCardBlocking, setHasCardBlocking] = useState(false);
  const [blockedCardCount, setBlockedCardCount] = useState(0);
  const [visibleCardIndices, setVisibleCardIndices] = useState<number[]>([]);

  // New state for mind control effect
  const [hasMindControl, setHasMindControl] = useState(false);
  const [mindControlActive, setMindControlActive] = useState(false);

  // Cards grouped by type for easier selection
  const cardsByType = {
    basic: [
      {
        id: "basic-1",
        name: "Basic Card",
        type: "Basic Card",
        description: "No effect",
      },
    ],
    normal: [
      {
        id: "normal-1",
        name: "Time Manipulation",
        type: "Normal Power Card",
        description: "Reduce your opponent's answer time",
      },
      {
        id: "normal-2",
        name: "Quick Draw",
        type: "Normal Power Card",
        description:
          "Answer twice in a row without waiting for your opponent's turn",
      },
    ],
    epic: [
      {
        id: "epic-1",
        name: "Answer Shield",
        type: "Epic Power Card",
        description: "Block one card used by your opponent",
      },
      {
        id: "epic-2",
        name: "Regeneration",
        type: "Epic Power Card",
        description: "Gain +10 hp if the question is answered correctly",
      },
    ],
    rare: [
      {
        id: "rare-1",
        name: "Mind Control",
        type: "Rare Power Card",
        description:
          "Forces the opponent to answer the next question without any power-ups",
      },
      {
        id: "rare-2",
        name: "Poison Type",
        type: "Rare Power Card",
        description:
          "It gives the enemy a poison type effect that last 3 rounds",
      },
    ],
  };

  // Probability distribution for each card type based on difficulty level
  const probabilityDistribution = {
    easy: {
      basic: 70,
      normal: {
        total: 30,
        distribution: { "Time Manipulation": 15, "Quick Draw": 15 },
      },
      epic: { total: 0, distribution: { "Answer Shield": 0, Regeneration: 0 } },
      rare: { total: 0, distribution: { "Mind Control": 0, "Poison Type": 0 } },
    },
    average: {
      basic: 70,
      normal: {
        total: 20,
        distribution: { "Time Manipulation": 10, "Quick Draw": 10 },
      },
      epic: {
        total: 10,
        distribution: { "Answer Shield": 5, Regeneration: 5 },
      },
      rare: { total: 0, distribution: { "Mind Control": 0, "Poison Type": 0 } },
    },
    hard: {
      basic: 70,
      normal: {
        total: 15,
        distribution: { "Time Manipulation": 8, "Quick Draw": 8 },
      },
      epic: {
        total: 10,
        distribution: { "Answer Shield": 5, Regeneration: 5 },
      },
      rare: {
        total: 5,
        distribution: { "Mind Control": 2.5, "Poison Type": 2.5 },
      },
    },
  };

  // Choose a single card based on probability distribution
  const selectSingleCardByProbability = (difficulty: string): Card => {
    // Extract just the first word (hard, easy, average) from strings like "Hard Mode"
    const difficultyWord = difficulty?.toLowerCase().split(" ")[0] || "average";

    // Map it to our expected keys
    let normalizedDifficulty: "easy" | "average" | "hard";
    if (difficultyWord.includes("easy")) normalizedDifficulty = "easy";
    else if (difficultyWord.includes("hard")) normalizedDifficulty = "hard";
    else normalizedDifficulty = "average"; // Default

    const dist =
      probabilityDistribution[normalizedDifficulty] ||
      probabilityDistribution.average;

    // Helper function to select a random card based on weights
    const selectRandomCard = (
      cardPool: Card[],
      weights: Record<string, number>
    ): Card => {
      const totalWeight = Object.values(weights).reduce(
        (sum, weight) => sum + weight,
        0
      );
      let random = Math.random() * totalWeight;

      for (const card of cardPool) {
        const weight = weights[card.name] || 0;
        if (random < weight) return card;
        random -= weight;
      }

      return cardPool[0]; // Fallback to first card
    };

    // Select a card based on probability
    const random = Math.random() * 100;

    // Basic cards selection
    if (random < dist.basic) {
      return cardsByType.basic[
        Math.floor(Math.random() * cardsByType.basic.length)
      ];
    }
    // Normal cards selection
    else if (random < dist.basic + dist.normal.total) {
      return selectRandomCard(cardsByType.normal, dist.normal.distribution);
    }
    // Epic cards selection
    else if (random < dist.basic + dist.normal.total + dist.epic.total) {
      return selectRandomCard(cardsByType.epic, dist.epic.distribution);
    }
    // Rare cards selection
    else {
      return selectRandomCard(cardsByType.rare, dist.rare.distribution);
    }
  };

  // Generate three random cards
  const generateThreeRandomCards = (difficulty: string): Card[] => {
    return Array(3)
      .fill(null)
      .map(() => selectSingleCardByProbability(difficulty));
  };

  // Generate cards with persistence between turns
  const generateCardsForTurn = (difficulty: string): Card[] => {
    if (isFirstTurn || persistentCards.length === 0) {
      // First turn or no persistent cards - generate all new
      return generateThreeRandomCards(difficulty);
    } else {
      // Create a new set of cards
      let newCards: Card[] = [...persistentCards];

      // Replace the card that was used in the previous turn with a new random card
      if (lastSelectedIndex !== null) {
        newCards[lastSelectedIndex] = selectSingleCardByProbability(difficulty);
      }

      return newCards;
    }
  };

  // Handle timer timeout - automatically select "no-card"
  const handleTimeExpired = () => {
    console.log("Time expired, no card selected");

    // Show a brief on-screen message
    const messageElement = document.createElement("div");
    messageElement.className =
      "fixed inset-0 flex items-center justify-center z-50";
    messageElement.innerHTML = `
            <div class="bg-purple-900/80 text-white py-4 px-8 rounded-lg text-xl font-bold shadow-lg border-2 border-purple-500/50">
                No card selected! Proceeding to question...
            </div>
        `;
    document.body.appendChild(messageElement);

    // Remove the message after 1.2 seconds
    setTimeout(() => {
      document.body.removeChild(messageElement);

      // No card selected, use a special "no-card" ID
      onCardSelected("no-card-selected");
      setShowCardOptions(false);
      setTimerActive(false);
    }, 1200);
  };

  // Timer effect
  useEffect(() => {
    if (timerActive && selectionTimer > 0) {
      const timer = setTimeout(() => {
        setSelectionTimer(selectionTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timerActive && selectionTimer === 0) {
      // Time's up
      handleTimeExpired();
    }
  }, [timerActive, selectionTimer]);

  useEffect(() => {
    if (isMyTurn) {
      // Reset animation states
      setShowBackCard(true);
      setShowCardOptions(false);
      setBackCardExitComplete(false);
      setAnimationComplete(false);
      setSelectionTimer(8); // Reset timer to 8 seconds
      setTimerActive(false); // Don't start timer yet

      // Generate cards for this turn
      const cardsForThisTurn = generateCardsForTurn(
        difficultyMode || "average"
      );
      setSelectedCards(cardsForThisTurn);

      // Start the card animation sequence
      const flipTimer = setTimeout(() => {
        setShowBackCard(false);
        setTimeout(() => {
          setAnimationComplete(true);
        }, 500);
      }, 1000);

      return () => clearTimeout(flipTimer);
    } else {
      // Reset state when it's not my turn
      setShowBackCard(false);
      setShowCardOptions(false);
      setBackCardExitComplete(false);
      setAnimationComplete(false);
      setTimerActive(false);
    }
  }, [isMyTurn, difficultyMode]);

  // Handle when back card exit animation is complete
  const handleBackCardExitComplete = () => {
    setBackCardExitComplete(true);
    setShowCardOptions(true);
    setTimerActive(true); // Start the selection timer
  };

  // Handle card selection
  const handleCardSelect = (cardId: string, index: number) => {
    // Stop the timer
    setTimerActive(false);

    // Store the selected index for the next turn
    setLastSelectedIndex(index);

    // Save the current cards for persistence
    setPersistentCards([...selectedCards]);

    // No longer the first turn
    setIsFirstTurn(false);

    // Pass the selected card to the parent component
    onCardSelected(cardId);
    setShowCardOptions(false);
  };

  // Get the background color based on card type
  const getCardBackground = (type: string) => {
    switch (type) {
      case "Basic Card":
        return "bg-gray-700";
      case "Normal Power Card":
        return "bg-blue-700";
      case "Epic Power Card":
        return "bg-purple-700";
      case "Rare Power Card":
        return "bg-yellow-700";
      default:
        return "bg-gray-700";
    }
  };

  // Check for card blocking effects
  useEffect(() => {
    if (isMyTurn) {
      const checkForCardBlocking = async () => {
        try {
          // Get session UUID and player type from sessionStorage (set in PvpBattle.tsx)
          const sessionUuid = sessionStorage.getItem("battle_session_uuid");
          const isHost = sessionStorage.getItem("is_host") === "true";
          const playerType = isHost ? "host" : "guest";

          if (!sessionUuid) return;

          // Check if this player has any card blocking effects active
          const response = await axios.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/gameplay/battle/card-blocking-effects/${sessionUuid}/${playerType}`
          );

          if (response.data.success && response.data.data) {
            setHasCardBlocking(response.data.data.has_blocking_effect);
            setBlockedCardCount(response.data.data.cards_blocked);

            // If there's a blocking effect, randomly select which cards to hide
            if (response.data.data.has_blocking_effect) {
              const numCardsToShow = 3 - response.data.data.cards_blocked;

              // Create an array of available indices (0, 1, 2)
              const availableIndices = [0, 1, 2];

              // Shuffle the indices
              for (let i = availableIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableIndices[i], availableIndices[j]] = [
                  availableIndices[j],
                  availableIndices[i],
                ];
              }

              // Take only the number of cards we want to show
              const indicesToShow = availableIndices.slice(0, numCardsToShow);
              setVisibleCardIndices(indicesToShow);

              // Show notification about blocked cards
              const messageElement = document.createElement("div");
              messageElement.className =
                "fixed inset-0 flex items-center justify-center z-50";
              messageElement.innerHTML = `
                                <div class="bg-purple-900/80 text-white py-4 px-8 rounded-lg text-xl font-bold shadow-lg border-2 border-purple-500/50">
                                    Answer Shield: ${response.data.data.cards_blocked} of your cards have been blocked!
                                </div>
                            `;
              document.body.appendChild(messageElement);

              // Remove the message after 2 seconds
              setTimeout(() => {
                document.body.removeChild(messageElement);
              }, 2000);

              // Mark the blocking effect as used
              if (
                response.data.data.effects &&
                response.data.data.effects.length > 0
              ) {
                const effectToConsume = response.data.data.effects[0];

                // Consume the effect
                await axios.post(
                  `${
                    import.meta.env.VITE_BACKEND_URL
                  }/api/gameplay/battle/consume-card-effect`,
                  {
                    session_uuid: sessionUuid,
                    player_type: playerType,
                    effect_type: effectToConsume.type,
                  }
                );

                console.log(`Card blocking effect consumed`);
              }
            } else {
              // No blocking, show all cards
              setVisibleCardIndices([0, 1, 2]);
            }
          }
        } catch (error) {
          console.error("Error checking for card blocking effects:", error);
          // Default to showing all cards on error
          setVisibleCardIndices([0, 1, 2]);
        }
      };

      checkForCardBlocking();
    } else {
      // Reset when not player's turn
      setHasCardBlocking(false);
      setBlockedCardCount(0);
      setVisibleCardIndices([0, 1, 2]);
    }
  }, [isMyTurn]);

  // Check for mind control effects
  useEffect(() => {
    if (isMyTurn) {
      const checkForMindControl = async () => {
        try {
          // Get session UUID and player type from sessionStorage (set in PvpBattle.tsx)
          const sessionUuid = sessionStorage.getItem("battle_session_uuid");
          const isHost = sessionStorage.getItem("is_host") === "true";
          const playerType = isHost ? "host" : "guest";

          if (!sessionUuid) return;

          // Check if this player has any mind control effects active
          const response = await axios.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/gameplay/battle/mind-control-effects/${sessionUuid}/${playerType}`
          );

          if (response.data.success && response.data.data) {
            setHasMindControl(response.data.data.has_mind_control_effect);

            // If there's a mind control effect active, the player can't select cards
            if (response.data.data.has_mind_control_effect) {
              setMindControlActive(true);

              // Show notification about mind control
              const messageElement = document.createElement("div");
              messageElement.className =
                "fixed inset-0 flex items-center justify-center z-50";
              messageElement.innerHTML = `
                                <div class="bg-purple-900/80 text-white py-4 px-8 rounded-lg text-xl font-bold shadow-lg border-2 border-purple-500/50">
                                    Mind Control: You cannot select a card this turn!
                                </div>
                            `;
              document.body.appendChild(messageElement);

              // Remove the message after 2 seconds
              setTimeout(() => {
                document.body.removeChild(messageElement);
              }, 2000);

              // Mark the mind control effect as used
              if (
                response.data.data.effects &&
                response.data.data.effects.length > 0
              ) {
                const effectToConsume = response.data.data.effects[0];

                // Consume the effect
                await axios.post(
                  `${
                    import.meta.env.VITE_BACKEND_URL
                  }/api/gameplay/battle/consume-card-effect`,
                  {
                    session_uuid: sessionUuid,
                    player_type: playerType,
                    effect_type: effectToConsume.type,
                  }
                );

                console.log(`Mind control effect consumed`);

                // Auto-select "no-card" after a delay to simulate no card selection
                setTimeout(() => {
                  onCardSelected("no-card-selected");
                  setShowCardOptions(false);
                  setTimerActive(false);
                }, 3000);
              }
            }
          }
        } catch (error) {
          console.error("Error checking for mind control effects:", error);
        }
      };

      checkForMindControl();
    } else {
      // Reset when not player's turn
      setHasMindControl(false);
      setMindControlActive(false);
    }
  }, [isMyTurn, onCardSelected]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-120">
      {/* Only show turn indicator when it's NOT the player's turn */}
      {!isMyTurn && (
        <div className="absolute inset-0 flex items-center top-[100px] justify-center z-20">
          <div className="text-white text-3xl font-bold animate-pulse">
            {`${opponentName}'s turn`}
          </div>
        </div>
      )}

      {isMyTurn && (
        <>
          <AnimatePresence onExitComplete={handleBackCardExitComplete}>
            {showBackCard && (
              <motion.div
                className="w-[220px] h-[320px] overflow-hidden shadow-lg shadow-purple-500/30"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  transformStyle: "preserve-3d",
                  transform: showBackCard ? "rotateY(0deg)" : "rotateY(90deg)",
                }}
                transition={{
                  duration: 0.7,
                  exit: { duration: 0.5 },
                }}
              >
                <img
                  src={cardBackImage}
                  alt="Card Back"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer display when it's the player's turn and options are shown */}
          {showCardOptions && backCardExitComplete && (
            <div className="absolute top-[150px] text-white text-2xl font-bold">
              Time remaining:{" "}
              <span
                className={selectionTimer <= 3 ? "text-red-500" : "text-white"}
              >
                {selectionTimer}s
              </span>
            </div>
          )}

          <AnimatePresence>
            {showCardOptions && backCardExitComplete && !mindControlActive && (
              <div className="flex gap-4">
                {selectedCards.map((card, index) => {
                  // Only render this card if it's in the visibleCardIndices array
                  if (!visibleCardIndices.includes(index) && hasCardBlocking) {
                    return null; // Skip this card if it's blocked
                  }

                  return (
                    <motion.div
                      key={card.id + "-" + index} // Add index to key to ensure uniqueness when the same card appears twice
                      className={`w-[200px] h-[300px] rounded-xl overflow-hidden cursor-pointer shadow-lg relative ${getCardBackground(
                        card.type
                      )} border-2 border-white/20`}
                      initial={{ opacity: 0, y: 20, rotateY: -90 }}
                      animate={{ opacity: 1, y: 0, rotateY: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.15,
                        ease: "easeOut",
                      }}
                      onClick={() => handleCardSelect(card.id, index)}
                      whileHover={{
                        y: -10,
                        scale: 1.05,
                        transition: { duration: 0.2 },
                      }}
                    >
                      {/* For all cards, display the card name and info */}
                      <div className="flex flex-col h-full p-4 text-white">
                        <div className="text-lg font-bold mb-2">
                          {card.name}
                        </div>
                        <div className="text-xs italic mb-4">{card.type}</div>
                        <div className="border-t border-white/20 my-2 pt-2">
                          <p className="text-sm">{card.description}</p>
                        </div>
                        <div className="mt-auto flex justify-end">
                          <div className="text-xs italic opacity-60">
                            Card ID: {card.id}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          {showCardOptions && backCardExitComplete && (
            <div className="absolute bottom-[170px] text-white text-xl font-semibold">
              Choose a card to use in this round
            </div>
          )}

          {/* Show information about mind control if active */}
          {mindControlActive && showCardOptions && (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-yellow-600 text-white py-4 px-8 rounded-lg text-xl font-bold shadow-lg border-2 border-yellow-500/50">
                Mind Control Active: Cannot select a card!
              </div>
              <div className="text-white text-lg">
                Opponent used Mind Control - proceeding without a card...
              </div>
            </div>
          )}
        </>
      )}

      {/* Show notification if cards are blocked */}
      {hasCardBlocking && blockedCardCount > 0 && isMyTurn && (
        <div className="absolute top-[100px] text-red-400 text-xl font-semibold">
          {blockedCardCount === 1
            ? "Your opponent used Answer Shield: 1 card has been blocked!"
            : `Your opponent used Answer Shield: ${blockedCardCount} cards have been blocked!`}
        </div>
      )}

      {/* Show notification if mind control is active */}
      {hasMindControl && mindControlActive && isMyTurn && (
        <div className="absolute top-[100px] text-red-400 text-xl font-semibold">
          Mind Control: Your opponent has prevented you from using cards this
          turn!
        </div>
      )}
    </div>
  );
};

export default CardSelection;
