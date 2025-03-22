import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import CardBackImg from "/General/CardDesignBack.png";
import DefaultBackHoverCard from "/cards/DefaultCardInside.png";

// Utility function for conditional class names
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

export default function DifficultySelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lobbyCode, hostUsername, guestUsername } = location.state || {};

  console.log("DifficultySelection state:", {
    lobbyCode,
    hostUsername,
    guestUsername,
    locationState: location.state,
  });

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<string>("Easy Mode");
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Responsive window width tracking
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCardDimensions = () => {
    let width = 120;
    let height = 168;
    if (windowWidth >= 768) {
      width = 150;
      height = 210;
    }
    if (windowWidth >= 1024) {
      width = 180;
      height = 250;
    }
    return { width: `${width}px`, height: `${height}px` };
  };

  const handleStartGame = async () => {
    if (!selectedDifficulty || !lobbyCode) return;

    try {
      // First update difficulty in battle_invitations
      await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/battle/invitations-lobby/difficulty`,
        {
          lobby_code: lobbyCode,
          difficulty: selectedDifficulty,
        }
      );

      // Then initialize entry in battle_gameplay
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/initialize`,
        {
          lobby_code: lobbyCode,
          host_id: hostUsername,
          guest_id: guestUsername,
          host_username: hostUsername,
          guest_username: guestUsername,
          host_in_battle: true, // Mark host as entered
        }
      );

      navigate("/dashboard/pvp-battle", {
        state: {
          lobbyCode,
          difficulty: selectedDifficulty,
          isHost: true,
          hostUsername,
          guestUsername,
        },
      });
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const handleDifficultyChange = (direction: "left" | "right") => {
    const difficulties = ["Easy Mode", "Average Mode", "Hard Mode"];
    const currentIndex = difficulties.indexOf(selectedDifficulty);
    const newIndex =
      direction === "left"
        ? (currentIndex - 1 + difficulties.length) % difficulties.length
        : (currentIndex + 1) % difficulties.length;
    setSelectedDifficulty(difficulties[newIndex]);
  };

  const getDifficultyDescription = () => {
    switch (selectedDifficulty) {
      case "Easy Mode":
        return "Easy mode includes cards that belong to easy mode only.";
      case "Average Mode":
        return "Average mode includes cards that belong to average mode only.";
      case "Hard Mode":
        return "Hard mode includes cards that belong to hard mode only.";
      default:
        return "";
    }
  };

  const cardVariants = {
    hover: { rotateY: 180, transition: { duration: 0.5, ease: "easeInOut" } },
    initial: { rotateY: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  const cardDimensions = getCardDimensions();

  return (
    <div className="min-h-screen flex items-center justify-center text-white p-4 md:p-8 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto mt-10 md:mt-16 lg:mt-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1fr] gap-8 lg:gap-16 xl:gap-24">
          {/* Left Column - Difficulty Selection */}
          <div className="flex flex-col items-center lg:items-start gap-4 px-4 md:px-8 order-2 lg:order-1">
            <div className="w-full text-center lg:text-left mb-4 md:mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold mb-2">
                SELECT DIFFICULTY
              </h1>
              <p className="text-gray-400 text-base md:text-lg">
                Choose a difficulty level that matches your skill!
              </p>
            </div>

            <div className="w-full space-y-3 md:space-y-5 mb-4 md:mb-7">
              {["Easy Mode", "Average Mode", "Hard Mode"].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={cn(
                    "w-full md:max-w-[550px] py-6 md:py-10 pl-5 md:pl-10 rounded-xl text-lg md:text-xl font-medium text-left transition-all duration-200",
                    selectedDifficulty === difficulty
                      ? "bg-[#49347e] border-2 md:border-4 border-[#3d2577]"
                      : "bg-[#3B354D]"
                  )}
                >
                  {difficulty}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartGame}
              className="w-full md:w-[240px] py-3 md:py-4 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors font-bold text-lg text-white"
            >
              Start Game
            </button>
          </div>

          {/* Right Column - Card Display */}
          <div className="flex flex-col items-center order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-12 mx-auto lg:ml-28 lg:mt-[-25px] mb-8 md:mb-14 relative">
              <div
                className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[600px] lg:h-[600px] bg-[#6B21A8] blur-[150px] md:blur-[200px] lg:blur-[250px] rounded-full opacity-40 animate-pulse"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 0,
                  animation: "pulse 3s infinite alternate",
                }}
              ></div>

              {[0, 1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  className="relative z-10 perspective mx-auto"
                  style={{
                    width: cardDimensions.width,
                    height: cardDimensions.height,
                    perspective: "1000px",
                    transformStyle: "preserve-3d",
                  }}
                  initial="initial"
                  whileHover="hover"
                  variants={cardVariants}
                >
                  <motion.div
                    className="absolute w-full h-full backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <img
                      src={CardBackImg}
                      alt="Card back design"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <motion.div
                    className="absolute w-full h-full backface-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <img
                      src={DefaultBackHoverCard}
                      alt="Card hover design"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-between items-center mx-auto lg:ml-28 w-full max-w-[530px] px-4">
              <button
                onClick={() => handleDifficultyChange("left")}
                aria-label="Previous difficulty"
              >
                <ChevronLeft size={28} />
              </button>
              <p className="text-center text-base md:text-lg text-gray-300 px-4">
                {getDifficultyDescription()}
              </p>
              <button
                onClick={() => handleDifficultyChange("right")}
                aria-label="Next difficulty"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
