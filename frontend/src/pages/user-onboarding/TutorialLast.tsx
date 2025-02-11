import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWandCursor from "./data/useWandCursor";
import GateRabbit from "../../assets/UserOnboarding/Gate.gif";

const TutorialLast: React.FC = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useWandCursor();

  useEffect(() => {
    const fadeInTimer = setTimeout(() => setFadeIn(true), 500); // Start fade-in after 500ms
    return () => clearTimeout(fadeInTimer);
  }, []);

  const handleNavigate = () => {
    console.log("Navigating to /dashboard/home...");
    navigate("/dashboard/home");
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-[#080511] overflow-hidden cursor-none relative"
      onClick={handleNavigate}
    >
      {/* GIF Wrapper */}
      <div className="relative">
        {/* Welcome GIF */}
        <img
          src={GateRabbit}
          alt="Gate Rabbit"
          className="z-0 w-[700px] h-auto"
        />

        {/* Grouped Fade-in Text Overlapping GIF */}
        <div
          className={`absolute top-[80%] left-1/2 transform -translate-x-1/2 text-center text-white transition-opacity duration-1000 z-10 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-xl whitespace-nowrap">
            Get ready to embark on your journey,{" "}
            <span className="font-bold">Magician</span>.
          </p>
          <p
            className="text-[18px] text-[#9F9BAE] mt-5"
            style={{ animation: "fadeInOut 3s infinite" }}
          >
            Tap anywhere on the screen or press any key to continue
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorialLast;
