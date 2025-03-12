"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/HostModeSelection.css";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "../../../../../user-onboarding/styles/EffectUserOnboarding.css";
import CardBackImg from "../../../../../../assets/General/CardDesignBack.png";
import DefaultBackHoverCard from "../../../../../../assets/General/DefaultBackHoverCard.png";

export default function Player2ModeSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hostUsername, guestUsername, lobbyCode } = location.state || {};
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [autoCycling, setAutoCycling] = useState(true);

  // Add polling effect to check for difficulty updates
  useEffect(() => {
    const checkDifficulty = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/battle/invitations-lobby/difficulty/${lobbyCode}`
        );

        if (response.data.success && response.data.data.difficulty) {
          setSelectedDifficulty(response.data.data.difficulty);
          setAutoCycling(false);

          // Navigate to battle when difficulty is received
          navigate("/dashboard/pvp-battle", {
            state: {
              lobbyCode,
              difficulty: response.data.data.difficulty,
              isHost: false,
              hostUsername,
              guestUsername
            }
          });
        }
      } catch (error) {
        console.error("Error checking difficulty:", error);
      }
    };

    // Check immediately
    checkDifficulty();

    // Then check every 1.2 seconds
    const interval = setInterval(checkDifficulty, 1200);

    return () => clearInterval(interval);
  }, [lobbyCode, navigate, hostUsername, guestUsername]);

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
          <h1 className="text-[33px] mt-[-40px] font-bold mb-3">
            {hostUsername ? `${hostUsername.toUpperCase()} IS` : 'HOST'} CURRENTLY SELECTING DIFFICULTY
            <span className="dot-1">.</span>
            <span className="dot-2">.</span>
            <span className="dot-3">.</span>
          </h1>
          <p className="text-gray-400 text-lg">Please wait while the host makes their selection</p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex justify-center w-full mb-16 relative z-10">
          <div className="flex space-x-10">
            <button
              onClick={() => handleManualSelection("Easy Mode")}
              className={`px-8 py-3 text-base transition-all cursor-pointer ${selectedDifficulty === "Easy Mode"
                ? "text-[#6B21A8] font-bold border-b-2 border-[#6B21A8]"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              EASY MODE
            </button>
            <button
              onClick={() => handleManualSelection("Average Mode")}
              className={`px-8 py-3 text-lg transition-all cursor-pointer ${selectedDifficulty === "Average Mode"
                ? "text-[#6B21A8] font-bold border-b-2 border-[#6B21A8]"
                : "text-gray-400 hover:text-gray-300"
                }`}
            >
              AVERAGE MODE
            </button>
            <button
              onClick={() => handleManualSelection("Hard Mode")}
              className={`px-8 py-3 text-lg transition-all cursor-pointer ${selectedDifficulty === "Hard Mode"
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
              <div
                key={card}
                className="flip-card relative z-10"
                style={{ width: "180px", height: "250px" }}
              >
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <img
                      src={CardBackImg}
                      alt="Card back design"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flip-card-back">
                    <img
                      src={DefaultBackHoverCard}
                      alt="Card hover design"
                      className="w-full h-full object-contain"
                    />
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
          <p className="text-center text-lg text-gray-300 mx-8">
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
