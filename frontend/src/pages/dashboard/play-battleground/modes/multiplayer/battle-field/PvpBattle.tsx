"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import playerCharacter from "../../../../../../assets/pvp-battle/playerCharacter.png";
import enemyCharacter from "../../../../../../assets/pvp-battle/enemyCharacter.gif";

export default function PvpBattle() {
  const [timeLeft, setTimeLeft] = useState(25);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 30;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="w-full h-screen  flex flex-col">
      {/* Top UI Bar */}
      <div className="w-full py-4 px-80 mt-12 flex items-center justify-between">
        {/* Left Player */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-16 h-16 bg-white rounded-lg"></div>
          <div className="flex flex-col gap-1">
            <div className="text-white text-sm">JING009</div>
            <div className="flex items-center gap-1">
              <span className="text-white text-xs">90 HP</span>
              <span className="text-gray-500 text-xs">/100</span>
            </div>
            <div className="w-64 h-2.5 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full w-[90%] bg-purple-600 rounded-full"></div>
            </div>
            <div className="w-3 h-3 bg-white rounded-full ml-1 mt-1"></div>
          </div>
        </div>

        {/* Center Timer */}
        <div className="flex flex-col items-center min-w-[140px]">
          <div className="text-white text-2xl font-bold">
            {formatTime(timeLeft)}
          </div>
          <div className="text-gray-400 text-xs">
            QUESTION {currentQuestion} out of {totalQuestions}
          </div>
        </div>

        {/* Right Player */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex flex-col gap-1 items-end">
            <div className="text-white text-sm">JING009</div>
            <div className="flex items-center gap-1 justify-end">
              <span className="text-white text-xs">90 HP</span>
              <span className="text-gray-500 text-xs">/100</span>
            </div>
            <div className="w-64 h-2.5 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full w-[90%] bg-purple-600 rounded-full"></div>
            </div>
            <div className="w-3 h-3 bg-white rounded-full ml-auto mr-1 mt-1"></div>
          </div>
          <div className="w-16 h-16 bg-white rounded-lg"></div>
        </div>

        {/* Settings button */}
        <button className="absolute right-4 top-4 text-white">
          <Settings size={20} />
        </button>
      </div>

      {/* Main Battle Area */}
      <div className="flex-1 relative">
        {/* Purple battlefield floor */}
        <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-purple-900/20"></div>

        {/* Opponent character (center) */}
        <div className="absolute top-[285px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80">
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={enemyCharacter}
              alt="Enemy Character"
              className="w-96 h-96 object-contain"
            />
          </div>
        </div>

        {/* Player character (bottom) */}
        <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 w-80 h-80">
          <div className="w-full flex items-end justify-center">
            <img
              src={playerCharacter}
              alt="Player Character"
              className="w-[300px] h-[300px] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
