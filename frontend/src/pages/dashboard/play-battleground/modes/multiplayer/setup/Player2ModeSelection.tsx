"use client";

import { useState, useEffect } from "react";
import "./styles/HostModeSelection.css";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "../../../../../user-onboarding/styles/EffectUserOnboarding.css";
import CardBackImg from "../../../../../../assets/General/CardDesignBack.png";

export default function Player2ModeSelection() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("Easy Mode");
  const [autoCycling, setAutoCycling] = useState(true);

  const handleManualSelection = (mode: string) => {
    setSelectedDifficulty(mode);
    setAutoCycling(false);

    // Resume auto-cycling after 10 seconds
    setTimeout(() => {
      setAutoCycling(true);
    }, 10000);
  };

  const handleDifficultyChange = (direction: "left" | "right") => {
    if (direction === "left") {
      if (selectedDifficulty === "Easy Mode") {
        setSelectedDifficulty("Hard Mode"); // Loop back to Hard Mode
      } else if (selectedDifficulty === "Average Mode") {
        setSelectedDifficulty("Easy Mode");
      } else if (selectedDifficulty === "Hard Mode") {
        setSelectedDifficulty("Average Mode");
      }
    } else if (direction === "right") {
      if (selectedDifficulty === "Easy Mode") {
        setSelectedDifficulty("Average Mode");
      } else if (selectedDifficulty === "Average Mode") {
        setSelectedDifficulty("Hard Mode");
      } else if (selectedDifficulty === "Hard Mode") {
        setSelectedDifficulty("Easy Mode"); // Loop back to Easy Mode
      }
    }
  };

  // Auto-change the mode only when autoCycling is true
  useEffect(() => {
    if (!autoCycling) return;

    const timer = setInterval(() => {
      handleDifficultyChange("right");
    }, 3000);

    return () => clearInterval(timer);
  }, [selectedDifficulty, autoCycling]);

  return (
    <div className="flex justify-center items-center min-h-screen text-white p-8">
      <div className="max-w-5xl w-full mt-20 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[42px] mt-[-40px] font-bold mb-3">
            HOST CURRENTLY SELECTING DIFFICULTY
            <span className="dot-1">.</span>
            <span className="dot-2">.</span>
            <span className="dot-3">.</span>
          </h1>
          <p className="text-gray-400 text-xl">Please wait badadladidas</p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex justify-center w-full mb-16 relative z-10">
          <div className="flex space-x-10">
            <button
              onClick={() => handleManualSelection("Easy Mode")}
              className={`px-8 py-3 text-lg transition-all cursor-pointer ${
                selectedDifficulty === "Easy Mode"
                  ? "text-[#6B21A8] font-bold border-b-2 border-[#6B21A8]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              EASY MODE
            </button>
            <button
              onClick={() => handleManualSelection("Average Mode")}
              className={`px-8 py-3 text-lg transition-all cursor-pointer ${
                selectedDifficulty === "Average Mode"
                  ? "text-[#6B21A8] font-bold border-b-2 border-[#6B21A8]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              AVERAGE MODE
            </button>
            <button
              onClick={() => handleManualSelection("Hard Mode")}
              className={`px-8 py-3 text-lg transition-all cursor-pointer ${
                selectedDifficulty === "Hard Mode"
                  ? "text-[#6B21A8] font-bold border-b-2 border-[#6B21A8]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              HARD MODE
            </button>
          </div>
        </div>

        {/* Card Grid */}
        <div className="relative w-full flex justify-center">
          {/* Glow effect */}
          <div
            className="absolute w-[600px] h-[600px] bg-[#6B21A8] blur-[250px] rounded-full opacity-40 animate-glow"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 0,
            }}
          ></div>

          {/* Cards with explicit spacing */}
          <div
            className="grid grid-cols-4 mb-14 relative z-10 mx-auto"
            style={{ columnGap: "3.5rem", maxWidth: "fit-content" }}
          >
            {[1, 2, 3, 4].map((card) => (
              <div key={card} className="flip-card relative z-10">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <img
                      src={CardBackImg}
                      alt="Card back design"
                      className="w-full h-full object-contain"
                      style={{ borderRadius: "0.5rem" }}
                    />
                  </div>
                  <div className="flip-card-back">
                    <div className="card-content p-0 w-full h-full">
                      <p>MSMSMSMS</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="flex justify-center items-center w-full max-w-xl mt-10">
          <button
            className="p-2 bg-transparent"
            onClick={() => handleDifficultyChange("left")}
          >
            <KeyboardArrowLeft />
          </button>
          <p className="text-center text-xl text-gray-300 mx-8">
            {selectedDifficulty === "Easy Mode" &&
              "Easy mode includes cards that belong to easy mode only."}
            {selectedDifficulty === "Average Mode" &&
              "Average mode includes cards that belong to average mode only."}
            {selectedDifficulty === "Hard Mode" &&
              "Hard mode includes cards that belong to hard mode only."}
          </p>
          <button
            className="p-2 bg-transparent"
            onClick={() => handleDifficultyChange("right")}
          >
            <KeyboardArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
