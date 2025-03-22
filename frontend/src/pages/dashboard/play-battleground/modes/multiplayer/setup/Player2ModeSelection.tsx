import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/HostModeSelection.css";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "../../../../../user-onboarding/styles/EffectUserOnboarding.css";
import CardBackImg from "/General/CardDesignBack.png";
import DefaultBackHoverCard from "/cards/DefaultCardInside.png";

export default function Player2ModeSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hostUsername, guestUsername, lobbyCode } = location.state || {};
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<string>("Easy Mode");
  const [hostSelectedDifficulty, setHostSelectedDifficulty] = useState<
    string | null
  >(null);

  // Poll for host's difficulty selection
  useEffect(() => {
    const checkDifficulty = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/battle/invitations-lobby/difficulty/${lobbyCode}`
        );

        if (response.data.success && response.data.data.difficulty) {
          setHostSelectedDifficulty(response.data.data.difficulty);
          setSelectedDifficulty(response.data.data.difficulty);

          // When host has selected, update battle_gameplay to mark guest as ready
          await axios.post(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/gameplay/battle/initialize`,
            {
              lobby_code: lobbyCode,
              host_id: hostUsername,
              guest_id: guestUsername,
              host_username: hostUsername,
              guest_username: guestUsername,
              guest_in_battle: true, // Mark guest as entered (don't set current_turn - use the one set by host)
            }
          );

          // Navigate to battle
          navigate("/dashboard/pvp-battle", {
            state: {
              lobbyCode,
              difficulty: response.data.data.difficulty,
              isHost: false,
              hostUsername,
              guestUsername,
            },
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

  return (
    <div className="flex justify-center items-center min-h-screen text-white p-4 md:p-8">
      <div className="w-full max-w-5xl mt-10 md:mt-20 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-xl sm:text-2xl md:text-[33px] mt-[-20px] md:mt-[-40px] font-bold mb-3 px-3 mb-5 sm:px-0">
            {hostUsername ? `${hostUsername.toUpperCase()} IS` : "HOST"}{" "}
            CURRENTLY SELECTING DIFFICULTY
            <span className="dot-1">.</span>
            <span className="dot-2">.</span>
            <span className="dot-3">.</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-lg">
            Please wait while the host makes their selection
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex justify-center w-full mb-8 md:mb-16 relative z-10 overflow-x-auto">
          <div className="flex space-x-3 md:space-x-10">
            <button
              onClick={() => handleManualSelection("Easy Mode")}
              className={`px-4 md:px-8 py-2 md:py-3 text-sm md:text-base transition-all cursor-pointer ${
                selectedDifficulty === "Easy Mode"
                  ? "text-[#6B21A8] font-bold border-b-2 border-[#6B21A8]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              EASY MODE
            </button>
            <button
              onClick={() => handleManualSelection("Average Mode")}
              className={`px-4 md:px-8 py-2 md:py-3 text-sm md:text-lg transition-all cursor-pointer ${
                selectedDifficulty === "Average Mode"
                  ? "text-[#6B21A8] font-bold border-b-2 border-[#6B21A8]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              AVERAGE MODE
            </button>
            <button
              onClick={() => handleManualSelection("Hard Mode")}
              className={`px-4 md:px-8 py-2 md:py-3 text-sm md:text-lg transition-all cursor-pointer ${
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
            className="absolute w-3/4 md:w-[600px] h-3/4 md:h-[600px] bg-[#6B21A8] blur-[150px] md:blur-[250px] rounded-full opacity-40 animate-glow"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 0,
            }}
          ></div>

          {/* Cards with responsive spacing */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 lg:gap-14 mb-8 md:mb-14 relative z-10 mx-auto px-2"
            style={{ maxWidth: "fit-content" }}
          >
            {[1, 2, 3, 4].map((card) => (
              <div
                key={card}
                className="flip-card relative z-10"
                style={{
                  width: "clamp(120px, 20vw, 180px)",
                  height: "clamp(160px, 28vw, 250px)",
                  margin: "0 auto",
                }}
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
        <div className="flex justify-center items-center w-full max-w-xl mt-6 md:mt-10 px-4">
          <button
            className="p-1 md:p-2 bg-transparent"
            onClick={() => handleDifficultyChange("left")}
          >
            <KeyboardArrowLeft />
          </button>
          <p className="text-center text-sm md:text-lg text-gray-300 mx-2 md:mx-8">
            {selectedDifficulty === "Easy Mode" &&
              "Easy mode includes cards that belong to easy mode only."}
            {selectedDifficulty === "Average Mode" &&
              "Average mode includes cards that belong to average mode only."}
            {selectedDifficulty === "Hard Mode" &&
              "Hard mode includes cards that belong to hard mode only."}
          </p>
          <button
            className="p-1 md:p-2 bg-transparent"
            onClick={() => handleDifficultyChange("right")}
          >
            <KeyboardArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
