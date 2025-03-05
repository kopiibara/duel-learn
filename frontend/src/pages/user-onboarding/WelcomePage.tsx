import { useEffect, useState, useRef } from "react";
import "./styles/EffectUserOnboarding.css";
import { useNavigate } from "react-router-dom";
import useWandCursor from "./data/useWandCursor"; // Import the custom hook
import WelcomePhoto from "../../assets/UserOnboarding/WelcomePhoto.gif";
import { useUser } from "../../contexts/UserContext"; // Import the useUser hook
import PageTransition from "../../styles/PageTransition";
import { useAudio } from "../../contexts/AudioContext"; // Import the useAudio hook

const WelcomePage = () => {
  
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const { playStartAudio, playLoopAudio, isPlaying } = useAudio();
  const startAudioRef = useRef<HTMLAudioElement | null>(null);

  useWandCursor();

  const handleNavigate = () => {
    console.log("Navigating to /tutorial/step-one...");
    navigate("/dashboard/tutorial/step-one");
  };

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 500);

    const initAudio = async () => {
      if (!isPlaying) {
        await playStartAudio();
      }
    };

    initAudio();

    const handleKeyDown = (_event: KeyboardEvent) => {
      handleNavigate();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, playStartAudio, handleNavigate]);

  useEffect(() => {
    const handleStartAudioEnded = async () => {
      await playLoopAudio();
    };

    if (startAudioRef.current) {
      startAudioRef.current.addEventListener("ended", handleStartAudioEnded);
    }

    return () => {
      if (startAudioRef.current) {
        startAudioRef.current.removeEventListener(
          "ended",
          handleStartAudioEnded
        );
      }
    };
  }, [playLoopAudio]);

  return (
    <PageTransition>
      <div
        className="flex flex-col items-center justify-center h-screen bg-[#080511] relative overflow-hidden cursor-none"
        onClick={handleNavigate}
      >
        {/* Animated Background Glow */}
        <div className="absolute w-[500px] h-[500px] bg-[#6B21A8] blur-[250px] rounded-full opacity-40 animate-pulse"></div>

        {/* Welcome Photo as Background */}
        <div
          className="relative mt-30 z-10 w-96 h-96 rounded bg-center"
          style={{
            backgroundImage: `url(${WelcomePhoto})`,
            backgroundSize: "contain", // Ensure the image fits without cropping
            backgroundRepeat: "no-repeat", // Prevents repeating the image
            backgroundPosition: "center", // Keeps the image centered
          }}
        ></div>

        {/* Welcome Text */}
        <p
          className={`text-[24px] mt-14 text-white transition-opacity duration-1000 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          You've finally made it here,{" "}
          <span className="font-bold">{user?.username}</span>!
        </p>

        {/* Click to Continue Text */}
        <p
          className={`text-[18px] mt-20 text-[#3B354D] transition-opacity duration-1000 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
          style={{ animation: "fadeInOut 3s infinite" }}
        >
          Tap anywhere on the screen or press any key to continue
        </p>
      </div>
    </PageTransition>
  );
};

export default WelcomePage;
