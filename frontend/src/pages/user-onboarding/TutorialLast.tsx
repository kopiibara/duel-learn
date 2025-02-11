import React, { useEffect, useState } from "react";
import Typewriter from "typewriter-effect"; // Import the Typewriter component
import "./styles/EffectUserOnboarding.css";
import { useNavigate } from "react-router-dom";
import useWandCursor from "./data/useWandCursor";

const TutorialLast: React.FC = () => {
  const [animate, setAnimate] = useState<boolean>(false);
  const [showFullText, setShowFullText] = useState<boolean>(false); // New state for skipping animation
  const navigate = useNavigate();

  // Use the wand cursor effect
  useWandCursor();

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 500); // Delay for animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-[#080511] relative overflow-hidden cursor-none"
      onClick={() => {
        console.log("Screen clicked, navigating...");
        navigate("/dashboard/my-preferences");
      }}
    >
      {/* Sparkles Container */}
      <div id="sparkles-container"></div>

      {/* Magic Wand Cursor */}
      <div className="wand-cursor"></div>

      {/* Animated Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#6B21A8] blur-[250px] rounded-full opacity-40 animate-pulse"></div>

      {/* Dialogue Box */}
      <div
        className={`relative z-10 bg-[#2C2A35] text-white py-9 px-14 rounded-lg shadow-lg max-w-[580px] transition-transform duration-1000 ${
          animate ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
        style={{ position: "relative" }}
        onClick={() => setShowFullText(true)} // Skip animation on click
      >
        <div className="text-center text-[18px]">
          {showFullText ? ( // Show full text if skipped
            <span>
              Congratulations on stepping into the magical world of{" "}
              <span className="font-bold">Dark Learn</span>! Let me show you the
              spells you'll be casting here.
            </span>
          ) : (
            <Typewriter
              onInit={(typewriter) => {
                typewriter
                  .typeString(
                    `Ready to embark on your journey, <span class="font-bold">Magician</span>? Well then, let's get started.`
                  )
                  .start();
              }}
              options={{
                autoStart: true,
                loop: false,
                delay: 40,
              }}
            />
          )}
        </div>
        {/* Triangle for the speech bubble */}
        <div className="absolute w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-[#2C2A35] left-[50%] translate-x-[-50%] top-full"></div>
      </div>

      {/* Image Container */}
      <div
        className={`relative z-10 w-[210px] h-[210px] bg-[#D9D9D9] rounded mt-16 mb-28 transition-transform duration-1000 ${
          animate ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      ></div>

      {/* Click to Continue Text */}
      <p
        className={`absolute bottom-[10%] text-[18px] text-[#9F9BAE] transition-opacity duration-1000 ${
          animate ? "opacity-100" : "opacity-0"
        }`}
        style={{ animation: "fadeInOut 3s infinite" }}
      >
        Tap anywhere on the screen to continue
      </p>
    </div>
  );
};

export default TutorialLast;
