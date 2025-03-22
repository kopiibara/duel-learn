import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
}

/**
 * CardSelection component handles the card selection UI during the battle
 */
const CardSelection: React.FC<CardSelectionProps> = ({
  isMyTurn,
  opponentName,
  playerName,
  onCardSelected,
}) => {
  const [showBackCard, setShowBackCard] = useState(true);
  const [showCardOptions, setShowCardOptions] = useState(false);
  const [backCardExitComplete, setBackCardExitComplete] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Sample cards - in a real app, these would be fetched or passed as props
  const cards: Card[] = [
    {
      id: "card1",
      name: "STEAL!",
      type: "Rare Power Card",
      description:
        "Swipe a random power-up card from your opponent's hand and turn the tides in your favor.",
    },
    {
      id: "card2",
      name: "STEAL!",
      type: "Rare Power Card",
      description:
        "Swipe a random power-up card from your opponent's hand and turn the tides in your favor.",
    },
    {
      id: "card3",
      name: "STEAL!",
      type: "Rare Power Card",
      description:
        "Swipe a random power-up card from your opponent's hand and turn the tides in your favor.",
    },
  ];

  useEffect(() => {
    if (isMyTurn) {
      // Reset animation states
      setShowBackCard(true);
      setShowCardOptions(false);
      setBackCardExitComplete(false);
      setAnimationComplete(false);

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
  }, [isMyTurn]);

  // Handle when back card exit animation is complete
  const handleBackCardExitComplete = () => {
    setBackCardExitComplete(true);
    setShowCardOptions(true);
  };

  const handleCardSelect = (cardId: string) => {
    onCardSelected(cardId);
    setShowCardOptions(false);
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

          <AnimatePresence>
            {showCardOptions && backCardExitComplete && (
              <div className="flex gap-4">
                {cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    className="w-[200px] h-[300px] rounded-xl overflow-hidden cursor-pointer shadow-md relative"
                    initial={{ opacity: 0, y: 20, rotateY: -90 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.15,
                      ease: "easeOut",
                    }}
                    onClick={() => handleCardSelect(card.id)}
                    whileHover={{
                      y: -10,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <img
                      src={cardFrontImage}
                      alt={`${card.name} Card`}
                      className="w-full h-full object-contain"
                    />
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
