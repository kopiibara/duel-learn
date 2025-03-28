import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import the actual card images
import cardBackImage from "../../../../../../../assets/General/CardDesignBack.png";
import cardFrontImage from "../../../../../../../assets/cards/DefaultCardInside.png";

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
    difficultyMode = "average" // Default to average difficulty if not provided
}) => {
    const [showBackCard, setShowBackCard] = useState(true);
    const [showCardOptions, setShowCardOptions] = useState(false);
    const [backCardExitComplete, setBackCardExitComplete] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);

    // Card state management
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const [persistentCards, setPersistentCards] = useState<Card[]>([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
    const [isFirstTurn, setIsFirstTurn] = useState(true);

    // Cards grouped by type for easier selection
    const cardsByType = {
        basic: [
            { id: "basic-1", name: "Basic Card", type: "Basic Card", description: "No effect" }
        ],
        normal: [
            { id: "normal-1", name: "Time Manipulation", type: "Normal Power Card", description: "Reduce your opponent's answer time" },
            { id: "normal-2", name: "Quick Draw", type: "Normal Power Card", description: "Answer twice in a row without waiting for your opponent's turn" }
        ],
        epic: [
            { id: "epic-1", name: "Answer Shield", type: "Epic Power Card", description: "Block one card used by your opponent" },
            { id: "epic-2", name: "Regeneration", type: "Epic Power Card", description: "Gain +10 hp if the question is answered correctly" }
        ],
        rare: [
            { id: "rare-1", name: "Mind Control", type: "Rare Power Card", description: "Forces the opponent to answer the next question without any power-ups" },
            { id: "rare-2", name: "Poison Type", type: "Rare Power Card", description: "It gives the enemy a poison type effect that last 3 rounds" }
        ]
    };

    // Probability distribution for each card type based on difficulty level
    const probabilityDistribution = {
        easy: {
            basic: 70,
            normal: { total: 30, distribution: { "Time Manipulation": 15, "Quick Draw": 15 } },
            epic: { total: 0, distribution: { "Answer Shield": 0, "Regeneration": 0 } },
            rare: { total: 0, distribution: { "Mind Control": 0, "Poison Type": 0 } }
        },
        average: {
            basic: 70,
            normal: { total: 20, distribution: { "Time Manipulation": 10, "Quick Draw": 10 } },
            epic: { total: 10, distribution: { "Answer Shield": 5, "Regeneration": 5 } },
            rare: { total: 0, distribution: { "Mind Control": 0, "Poison Type": 0 } }
        },
        hard: {
            basic: 70,
            normal: { total: 15, distribution: { "Time Manipulation": 8, "Quick Draw": 8 } },
            epic: { total: 10, distribution: { "Answer Shield": 5, "Regeneration": 5 } },
            rare: { total: 5, distribution: { "Mind Control": 2.5, "Poison Type": 2.5 } }
        }
    };

    // Choose a single card based on probability distribution
    const selectSingleCardByProbability = (difficulty: string): Card => {
        // Extract just the first word (hard, easy, average) from strings like "Hard Mode"
        const difficultyWord = difficulty?.toLowerCase().split(' ')[0] || "average";

        // Map it to our expected keys
        let normalizedDifficulty: "easy" | "average" | "hard";
        if (difficultyWord.includes("easy")) normalizedDifficulty = "easy";
        else if (difficultyWord.includes("hard")) normalizedDifficulty = "hard";
        else normalizedDifficulty = "average"; // Default

        const dist = probabilityDistribution[normalizedDifficulty] || probabilityDistribution.average;

        // Helper function to select a random card based on weights
        const selectRandomCard = (cardPool: Card[], weights: Record<string, number>): Card => {
            const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
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
            return cardsByType.basic[Math.floor(Math.random() * cardsByType.basic.length)];
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
        return Array(3).fill(null).map(() => selectSingleCardByProbability(difficulty));
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

    useEffect(() => {
        if (isMyTurn) {
            // Reset animation states
            setShowBackCard(true);
            setShowCardOptions(false);
            setBackCardExitComplete(false);
            setAnimationComplete(false);

            // Generate cards for this turn
            const cardsForThisTurn = generateCardsForTurn(difficultyMode || "average");
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
        }
    }, [isMyTurn, difficultyMode]);

    // Handle when back card exit animation is complete
    const handleBackCardExitComplete = () => {
        setBackCardExitComplete(true);
        setShowCardOptions(true);
    };

    // Handle card selection
    const handleCardSelect = (cardId: string, index: number) => {
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
                                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                                exit={{ rotateY: 90, opacity: 0 }}
                                transition={{
                                    duration: 0.7,
                                    exit: { duration: 0.5 }
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

                    <AnimatePresence>
                        {showCardOptions && backCardExitComplete && (
                            <div className="flex gap-4">
                                {selectedCards.map((card, index) => (
                                    <motion.div
                                        key={card.id + "-" + index} // Add index to key to ensure uniqueness when the same card appears twice
                                        className={`w-[200px] h-[300px] rounded-xl overflow-hidden cursor-pointer shadow-lg relative ${getCardBackground(card.type)} border-2 border-white/20`}
                                        initial={{ opacity: 0, y: 20, rotateY: -90 }}
                                        animate={{ opacity: 1, y: 0, rotateY: 0 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: index * 0.15,
                                            ease: "easeOut"
                                        }}
                                        onClick={() => handleCardSelect(card.id, index)}
                                        whileHover={{
                                            y: -10,
                                            scale: 1.05,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        {/* For all cards, display the card name and info */}
                                        <div className="flex flex-col h-full p-4 text-white">
                                            <div className="text-lg font-bold mb-2">{card.name}</div>
                                            <div className="text-xs italic mb-4">{card.type}</div>
                                            <div className="border-t border-white/20 my-2 pt-2">
                                                <p className="text-sm">{card.description}</p>
                                            </div>
                                            <div className="mt-auto flex justify-end">
                                                <div className="text-xs italic opacity-60">Card ID: {card.id}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>

                    {showCardOptions && backCardExitComplete && (
                        <div className="absolute bottom-[170px] text-white text-xl font-semibold">
                            Choose a card to use in this round
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CardSelection; 