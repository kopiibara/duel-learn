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
            { id: "rare-2", name: "Poison Type", type: "Rare Power Card", description: "It gives the enemy a poison type effect that last 3 rounds" },
            { id: "rare-3", name: "STEAL!", type: "Rare Power Card", description: "Swipe a random power-up card from your opponent's hand and turn the tides in your favor" }
        ]
    };

    // Probability distribution for each card type based on difficulty level
    const probabilityDistribution = {
        easy: {
            basic: 70,
            normal: { total: 30, distribution: { "Time Manipulation": 15, "Quick Draw": 15 } },
            epic: { total: 0, distribution: { "Answer Shield": 0, "Regeneration": 0 } },
            rare: { total: 0, distribution: { "Mind Control": 0, "Poison Type": 0, "STEAL!": 0 } }
        },
        average: {
            basic: 70,
            normal: { total: 20, distribution: { "Time Manipulation": 10, "Quick Draw": 10 } },
            epic: { total: 10, distribution: { "Answer Shield": 5, "Regeneration": 5 } },
            rare: { total: 0, distribution: { "Mind Control": 0, "Poison Type": 0, "STEAL!": 0 } }
        },
        hard: {
            basic: 70,
            normal: { total: 15, distribution: { "Time Manipulation": 8, "Quick Draw": 8 } },
            epic: { total: 10, distribution: { "Answer Shield": 5, "Regeneration": 5 } },
            rare: { total: 5, distribution: { "Mind Control": 2.5, "Poison Type": 2.5, "STEAL!": 0 } }
        }
    };

    // Choose cards based on probability distribution
    const selectCardsByProbability = (difficulty: string): Card[] => {
        // Extract just the first word (hard, easy, average) from strings like "Hard Mode"
        const difficultyWord = difficulty?.toLowerCase().split(' ')[0] || "average";

        // Map it to our expected keys
        let normalizedDifficulty: "easy" | "average" | "hard";
        if (difficultyWord.includes("easy")) normalizedDifficulty = "easy";
        else if (difficultyWord.includes("hard")) normalizedDifficulty = "hard";
        else normalizedDifficulty = "average"; // Default

        console.log(`Original difficulty: "${difficulty}", normalized to: "${normalizedDifficulty}"`);

        const dist = probabilityDistribution[normalizedDifficulty] || probabilityDistribution.average;

        const selectedCards: Card[] = [];

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

        // Select cards based on probability until we have 3
        while (selectedCards.length < 3) {
            const random = Math.random() * 100;

            // Basic cards selection
            if (random < dist.basic) {
                const basicCard = cardsByType.basic[Math.floor(Math.random() * cardsByType.basic.length)];
                // Only add if not already in the selection
                if (!selectedCards.some(card => card.type === basicCard.type)) {
                    selectedCards.push(basicCard);
                }
            }
            // Normal cards selection
            else if (random < dist.basic + dist.normal.total) {
                const normalCard = selectRandomCard(cardsByType.normal, dist.normal.distribution);
                if (!selectedCards.some(card => card.name === normalCard.name)) {
                    selectedCards.push(normalCard);
                }
            }
            // Epic cards selection
            else if (random < dist.basic + dist.normal.total + dist.epic.total) {
                const epicCard = selectRandomCard(cardsByType.epic, dist.epic.distribution);
                if (!selectedCards.some(card => card.name === epicCard.name)) {
                    selectedCards.push(epicCard);
                }
            }
            // Rare cards selection
            else {
                const rareCard = selectRandomCard(cardsByType.rare, dist.rare.distribution);
                if (!selectedCards.some(card => card.name === rareCard.name)) {
                    selectedCards.push(rareCard);
                }
            }

            // Break if we've tried many times to avoid infinite loop
            if (selectedCards.length === 0 && random > 95) {
                selectedCards.push(cardsByType.basic[0]);
            }
        }

        return selectedCards.slice(0, 3);
    };

    // Declare state for selected cards
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);

    useEffect(() => {
        if (isMyTurn) {
            // Reset animation states
            setShowBackCard(true);
            setShowCardOptions(false);
            setBackCardExitComplete(false);
            setAnimationComplete(false);

            // Re-randomize the cards each time it's the player's turn
            setSelectedCards(selectCardsByProbability(difficultyMode || "average"));

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

    const handleCardSelect = (cardId: string) => {
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
                                        key={card.id}
                                        className={`w-[200px] h-[300px] rounded-xl overflow-hidden cursor-pointer shadow-lg relative ${getCardBackground(card.type)} border-2 border-white/20`}
                                        initial={{ opacity: 0, y: 20, rotateY: -90 }}
                                        animate={{ opacity: 1, y: 0, rotateY: 0 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: index * 0.15,
                                            ease: "easeOut"
                                        }}
                                        onClick={() => handleCardSelect(card.id)}
                                        whileHover={{
                                            y: -10,
                                            scale: 1.05,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        {card.name === "STEAL!" ? (
                                            // Use image for STEAL! card
                                            <img
                                                src={cardFrontImage}
                                                alt="STEAL! Card"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            // For other cards, display the card name and info
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
                                        )}
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