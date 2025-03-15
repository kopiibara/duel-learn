import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DefaultUnknownPic from "../../../../assets/General/DefaultUnknownPic.png";
import { useAudio } from "../../../../contexts/AudioContext"; // Import the useAudio hook
import peacefulModeAsset from "/game-mode-selection/peaceful-mode.svg";
import timePressuredModeAsset from "/game-mode-selection/time-pressured-mode.svg";
import pvpModeAsset from "/game-mode-selection/pvp-mode.svg";

const WelcomeGameMode: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, material } = location.state || {};
  const [fadeOut, setFadeOut] = useState(false);
  const [setupIsReady, setSetupIsReady] = useState(false);
  const { playPeacefulModeAudio } = useAudio(); // Use the playPeacefulModeAudio function
  // Add console log to debug
  console.log("WelcomeGameMode received state:", { mode, material });

  // Function to determine which asset to use based on the mode
  const getModeAsset = () => {
    if (mode === "Peaceful" || mode === "Peaceful Mode") {
      return peacefulModeAsset;
    } else if (mode === "Time Pressured" || mode === "Time Pressured Mode") {
      return timePressuredModeAsset;
    } else if (mode === "PvP" || mode === "PvP Mode") {
      return pvpModeAsset;
    }
    return DefaultUnknownPic; // Fallback to default if mode is unknown
  };

  // Check if SetUpQuestionType is ready
  useEffect(() => {
    const checkSetupComponent = async () => {
      try {
        // Preload the SetUpQuestionType component
        await import("../components/setup/SetUpQuestionType");
        setSetupIsReady(true);
      } catch (error) {
        console.error("Error loading setup component:", error);
      }
    };

    checkSetupComponent();
  }, []);

  // Only start transition when setup is ready
  useEffect(() => {
    if (setupIsReady) {
      // Add 1.5 second delay before starting transition
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          navigate("/dashboard/setup/questions", {
            state: {
              mode,
              material:
                typeof material === "string" ? { title: material } : material,
              fromWelcome: true,
            },
          });
        }, 1000);
      }, 1500); // 1.5 second delay
    }
  }, [setupIsReady, navigate, mode, material]);

  // Play peaceful mode audio when the component mounts
  useEffect(() => {
    playPeacefulModeAudio();
  }, [playPeacefulModeAudio]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center h-screen text-center px-6 sm:px-8 md:px-12 lg:px-16"
      style={{ opacity: fadeOut ? 0 : 1, transition: "opacity 1s ease-in-out" }}
    >
      {mode && (
        <>
          <motion.img
            src={getModeAsset()}
            alt={`${mode} Mode`}
            className="w-60 sm:w-60 md:w-68 lg:w-64 xl:w-[382px] mb-6 sm:mb-8 md:mb-10 lg:mb-12"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.p
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {mode} Mode Activated!
          </motion.p>
          <motion.p
            className="text-sm sm:text-base md:text-lg lg:text-xl mt-16"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{
              color: "#6F658D",
              maxWidth: "700px",
              margin: "31px auto",
              marginTop: "1.7rem",
            }}
          >
            {(mode === "Peaceful" || mode === "Peaceful Mode") &&
              "Take your time, master at your own pace! ✨"}
            {(mode === "Time Pressured" || mode === "Time Pressured Mode") &&
              "Beat the clock, unleash your magical prowess! ⚡"}
            {(mode === "PvP" || mode === "PvP Mode") &&
              "Battle head-to-head for magical supremacy! 🏆"}
          </motion.p>
        </>
      )}
    </motion.div>
  );
};

export default WelcomeGameMode;
