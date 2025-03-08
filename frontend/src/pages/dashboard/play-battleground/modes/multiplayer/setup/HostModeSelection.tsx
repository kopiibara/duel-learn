"use client";

import { useState } from "react";
import "./styles/HostModeSelection.css";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "../../../../../user-onboarding/styles/EffectUserOnboarding.css";
import CardBackImg from "../../../../../../assets/General/CardDesignBack.png";

export default function HostModeSelection() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("Easy Mode");

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

  return (
    <div className="flex justify-center items-center min-h-screen  text-white p-8">
      <div className="max-w-7xl  w-full mt-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-60 max-w-6xl mx-auto">
          <div className="flex flex-col ml-[-70px]  items-start gap-4">
            <div className="w-full text-left mb-8">
              <h1 className="text-[48px] font-bold mb-2">SELECT DIFFICULTY</h1>
              <p className="text-gray-400 text-xl">
                Choose a difficulty level that matches your skill!
              </p>
            </div>

            <div className="w-full space-y-5 mb-7">
              {/* Easy Mode Button */}
              <button
                onClick={() => setSelectedDifficulty("Easy Mode")}
                className={`w-[550px] py-12 pl-10 rounded-xl text-xl font-medium text-left transition-all duration-200 
                  ${
                    selectedDifficulty === "Easy Mode"
                      ? "bg-[#49347e] border-4 border-[#3d2577]"
                      : "bg-[#3B354D]"
                  }`}
              >
                Easy Mode
              </button>

              {/* Average Mode Button */}
              <button
                onClick={() => setSelectedDifficulty("Average Mode")}
                className={`w-[550px] py-12 pl-10 rounded-xl text-xl font-medium text-left transition-all duration-200 
                  ${
                    selectedDifficulty === "Average Mode"
                      ? "bg-[#49347e] border-4 border-[#3d2577]"
                      : "bg-[#3B354D]"
                  }`}
              >
                Average Mode
              </button>

              {/* Hard Mode Button */}
              <button
                onClick={() => setSelectedDifficulty("Hard Mode")}
                className={`w-[550px] py-12 pl-10 rounded-xl text-xl font-medium text-left transition-all duration-200 
                  ${
                    selectedDifficulty === "Hard Mode"
                      ? "bg-[#49347e] border-4 border-[#3d2577]"
                      : "bg-[#3B354D]"
                  }`}
              >
                Hard Mode
              </button>
            </div>

            {/* Start Game Button */}
            <button className="w-[240px] py-6 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors font-bold text-lg text-white">
              Start Game
            </button>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col">
              {/* Card grid - no gaps between cards */}
              <div className="grid grid-cols-2 gap-12 gap-x-22 mb-14 max-w-lg mx-auto relative">
                {/* Single centered glow effect with animation from EffectUserOnboarding.css */}
                <div
                  className="absolute w-[600px] h-[600px] bg-[#6B21A8] blur-[250px] rounded-full opacity-40 animate-glow"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 0,
                  }}
                ></div>

                {/* Top Row Cards */}
                <div className="flip-card relative z-10">
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

                <div className="flip-card relative z-10">
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

                {/* Bottom Row Cards */}
                <div className="flip-card relative z-10">
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

                <div className="flip-card relative z-10">
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
              </div>

              <div className="flex justify-between ml-[-10px] w-[530px] items-center">
                <button
                  className="p-9 bg-transparent"
                  onClick={() => handleDifficultyChange("left")}
                >
                  <KeyboardArrowLeft />
                </button>
                <p className="text-center text-xl text-gray-300">
                  {selectedDifficulty === "Easy Mode" &&
                    "Easy mode includes cards that belong to easy mode only."}
                  {selectedDifficulty === "Average Mode" &&
                    "Average mode includes cards that belong to average mode only."}
                  {selectedDifficulty === "Hard Mode" &&
                    "Hard mode includes cards that belong to hard mode only."}
                </p>
                <button
                  className="p-2 ml-10 bg-transparent"
                  onClick={() => handleDifficultyChange("right")}
                >
                  <KeyboardArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
