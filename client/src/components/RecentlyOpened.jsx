import React, { useState } from "react";
import CardComponent from "./CardComponent";
import { ArrowBack, ArrowForward } from "@mui/icons-material"; // Import MUI icons

const RecentlyOpened = () => {
  const cards = [
    { title: "Card 1", description: "Content for card 1" },
    { title: "Card 2", description: "Content for card 2" },
    { title: "Card 3", description: "Content for card 3" },
    { title: "Card 4", description: "Content for card 4" },
    { title: "Card 5", description: "Content for card 5" },
    { title: "Card 6", description: "Content for card 6" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle navigation
  const handleNext = () => {
    if (currentIndex + 2 < cards.length) {
      setCurrentIndex(currentIndex + 2);
    }
  };

  const handlePrev = () => {
    if (currentIndex - 2 >= 0) {
      setCurrentIndex(currentIndex - 2);
    }
  };

  // Determine visible cards
  const visibleCards = cards.slice(currentIndex, currentIndex + 2);

  // Check if buttons should be visible (only when cards > 2)
  const showButtons = cards.length > 2;

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Card Container */}
      <div className="grid grid-cols-2 mt-6 gap-4 w-full max-w-[800px]">
        {visibleCards.map((card, index) => (
          <CardComponent key={index} title={card.title} description={card.description} />
        ))}
      </div>

      {/* Navigation Buttons */}
      {showButtons && (
        <>
          {/* Prev Button */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-opacity duration-300 opacity-0 hover:opacity-100 p-1.5"
              aria-label="Previous"
            >
              <ArrowBack fontSize="medium" />
            </button>
          )}

          {/* Next Button */}
          {currentIndex + 2 < cards.length && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-opacity duration-300 opacity-0 hover:opacity-100 p-1.5"
              aria-label="Next"
            >
              <ArrowForward fontSize="medium" />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default RecentlyOpened;
