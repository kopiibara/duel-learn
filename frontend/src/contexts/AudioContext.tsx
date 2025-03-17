import type React from "react";
import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";

interface AudioContextType {
  playStartAudio: () => Promise<void>;
  playLoopAudio: () => Promise<void>;
  playPeacefulModeAudio: () => Promise<void>;
  playUserOnboardingAudio: () => Promise<void>;
  playCorrectAnswerSound: () => Promise<void>;
  playIncorrectAnswerSound: () => Promise<void>;
  playSessionCompleteSound: () => Promise<void>;
  playTimePressuredAudio: (timeRemaining: number) => Promise<void>;
  setActiveModeAudio: (mode: string) => Promise<void>;
  pauseAudio: () => void;
  stopAllAudio: () => void;
  isPlaying: boolean;
  activeAudio: string | null;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const loopAudioRef = useRef<HTMLAudioElement | null>(null);
  const peacefulModeAudioRef = useRef<HTMLAudioElement | null>(null);
  const userOnboardingAudioRef = useRef<HTMLAudioElement | null>(null);
  const correctAnswerSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectAnswerSoundRef = useRef<HTMLAudioElement | null>(null);
  const sessionCompleteSoundRef = useRef<HTMLAudioElement | null>(null);
  const timePressuredAudioRef = useRef<HTMLAudioElement | null>(null);
  const timePressuredSpeedUpAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const location = useLocation();

  // Initialize audio elements
  const initializeAudio = () => {
    startAudioRef.current = new Audio("/sounds-sfx/welcome-start.mp3");
    loopAudioRef.current = new Audio("/sounds-sfx/welcome-loop.mp3");
    peacefulModeAudioRef.current = new Audio("/sounds-sfx/peaceful-mode.mp3");
    userOnboardingAudioRef.current = new Audio(
      "/sounds-sfx/user-onboarding.mp3"
    );
    correctAnswerSoundRef.current = new Audio("/sounds-sfx/right-answer.mp3");
    incorrectAnswerSoundRef.current = new Audio("/sounds-sfx/wrong-answer.mp3");
    sessionCompleteSoundRef.current = new Audio(
      "/sounds-sfx/session-report-completed.mp3"
    );
    timePressuredAudioRef.current = new Audio("/sounds-sfx/time-pressured.mp3");
    timePressuredSpeedUpAudioRef.current = new Audio(
      "/sounds-sfx/time-pressured-speed-up.mp3"
    );

    loopAudioRef.current.loop = true;
    peacefulModeAudioRef.current.loop = true;
    userOnboardingAudioRef.current.loop = true;
    timePressuredAudioRef.current.loop = true;
    timePressuredSpeedUpAudioRef.current.loop = true;

    const handleStartAudioEnded = () => {
      if (loopAudioRef.current) {
        loopAudioRef.current
          .play()
          .catch((error) => console.error("Error playing loop audio:", error));
      }
    };

    if (startAudioRef.current) {
      startAudioRef.current.addEventListener("ended", handleStartAudioEnded);
    }
  };

  // Function to ensure audio capabilities after user interaction
  const initAudioContext = useCallback(() => {
    // Create and immediately use an audio context to enable audio
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const audioCtx = new AudioContext();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    }
  }, []);

  useEffect(() => {
    // Add click listener to initialize audio on first user interaction
    document.addEventListener("click", initAudioContext, { once: true });

    initializeAudio();

    // Check if we have a stored active audio state
    const storedAudio = sessionStorage.getItem("activeAudio");
    if (storedAudio) {
      setActiveAudio(storedAudio);

      // Resume the appropriate audio based on stored state
      setTimeout(() => {
        if (storedAudio === "peaceful") {
          playPeacefulModeAudio();
        } else if (storedAudio === "timePressured") {
          playTimePressuredAudio(30);
        }
      }, 100); // Small delay to ensure audio refs are initialized
    }

    return () => {
      // Cleanup function
      document.removeEventListener("click", initAudioContext);

      if (startAudioRef.current) {
        startAudioRef.current.pause();
        startAudioRef.current = null;
      }
      if (loopAudioRef.current) {
        loopAudioRef.current.pause();
        loopAudioRef.current = null;
      }
      if (peacefulModeAudioRef.current) {
        peacefulModeAudioRef.current.pause();
        peacefulModeAudioRef.current = null;
      }
      if (userOnboardingAudioRef.current) {
        userOnboardingAudioRef.current.pause();
        userOnboardingAudioRef.current = null;
      }
      if (correctAnswerSoundRef.current) {
        correctAnswerSoundRef.current.pause();
        correctAnswerSoundRef.current = null;
      }
      if (incorrectAnswerSoundRef.current) {
        incorrectAnswerSoundRef.current.pause();
        incorrectAnswerSoundRef.current = null;
      }
      if (sessionCompleteSoundRef.current) {
        sessionCompleteSoundRef.current.pause();
        sessionCompleteSoundRef.current = null;
      }
      if (timePressuredAudioRef.current) {
        timePressuredAudioRef.current.pause();
        timePressuredAudioRef.current = null;
      }
      if (timePressuredSpeedUpAudioRef.current) {
        timePressuredSpeedUpAudioRef.current.pause();
        timePressuredSpeedUpAudioRef.current = null;
      }
      setIsPlaying(false);
      setActiveAudio(null);
      sessionStorage.removeItem("activeAudio");
    };
  }, []);

  const playStartAudio = useCallback(async () => {
    if (startAudioRef.current) {
      pauseAudio(); // Stop other audio first
      try {
        startAudioRef.current.currentTime = 0;
        await startAudioRef.current.play();
        setIsPlaying(true);
        setActiveAudio("start");
      } catch (error) {
        console.error("Error playing start audio:", error);
      }
    }
  }, []);

  const playLoopAudio = useCallback(async () => {
    if (loopAudioRef.current) {
      pauseAudio(); // Stop other audio first
      try {
        loopAudioRef.current.currentTime = 0;
        await loopAudioRef.current.play();
        setIsPlaying(true);
        setActiveAudio("loop");
      } catch (error) {
        console.error("Error playing loop audio:", error);
      }
    }
  }, []);

  const playPeacefulModeAudio = useCallback(async () => {
    if (peacefulModeAudioRef.current) {
      // If this is already the active audio and it's playing, don't restart it
      if (activeAudio === "peaceful" && !peacefulModeAudioRef.current.paused) {
        return;
      }

      pauseAudio(); // Stop other audio first
      try {
        peacefulModeAudioRef.current.currentTime = 0;
        await peacefulModeAudioRef.current.play();
        setIsPlaying(true);
        setActiveAudio("peaceful");
      } catch (error) {
        console.error("Error playing peaceful mode audio:", error);
      }
    }
  }, [activeAudio]);

  const playUserOnboardingAudio = useCallback(async () => {
    if (userOnboardingAudioRef.current) {
      pauseAudio(); // Stop other audio first
      try {
        userOnboardingAudioRef.current.currentTime = 0;
        await userOnboardingAudioRef.current.play();
        setIsPlaying(true);
        setActiveAudio("onboarding");
      } catch (error) {
        console.error("Error playing user onboarding audio:", error);
      }
    }
  }, []);

  const playCorrectAnswerSound = useCallback(async () => {
    if (correctAnswerSoundRef.current) {
      try {
        correctAnswerSoundRef.current.currentTime = 0;
        await correctAnswerSoundRef.current.play();
      } catch (error) {
        console.error("Error playing correct answer sound:", error);
      }
    }
  }, []);

  const playIncorrectAnswerSound = useCallback(async () => {
    if (incorrectAnswerSoundRef.current) {
      try {
        incorrectAnswerSoundRef.current.currentTime = 0;
        await incorrectAnswerSoundRef.current.play();
      } catch (error) {
        console.error("Error playing incorrect answer sound:", error);
      }
    }
  }, []);

  const playSessionCompleteSound = useCallback(async () => {
    if (sessionCompleteSoundRef.current) {
      try {
        // Ensure the audio is properly initialized
        if (!sessionCompleteSoundRef.current.src) {
          sessionCompleteSoundRef.current = new Audio(
            "/sounds-sfx/session-report-completed.mp3"
          );
        }
        sessionCompleteSoundRef.current.currentTime = 0;
        sessionCompleteSoundRef.current.volume = 1;
        await sessionCompleteSoundRef.current.play();
      } catch (error) {
        console.error("Error playing session complete sound:", error);
      }
    }
  }, []);

  const playTimePressuredAudio = useCallback(
    async (timeRemaining: number) => {
      // If this is already the active audio and playing appropriate version, don't restart
      if (
        activeAudio === "timePressured" &&
        ((timeRemaining > 5 &&
          timePressuredAudioRef.current &&
          !timePressuredAudioRef.current.paused) ||
          (timeRemaining <= 5 &&
            timePressuredSpeedUpAudioRef.current &&
            !timePressuredSpeedUpAudioRef.current.paused))
      ) {
        return;
      }

      if (timeRemaining <= 5) {
        // Switch to speed-up audio if 5 seconds or less remain
        if (timePressuredSpeedUpAudioRef.current) {
          try {
            // Pause the regular time-pressured audio if it's playing
            if (
              timePressuredAudioRef.current &&
              !timePressuredAudioRef.current.paused
            ) {
              timePressuredAudioRef.current.pause();
              timePressuredAudioRef.current.currentTime = 0;
            }

            // Only play if not already playing
            if (timePressuredSpeedUpAudioRef.current.paused) {
              await timePressuredSpeedUpAudioRef.current.play();
              setIsPlaying(true);
              setActiveAudio("timePressured");
            }
          } catch (error) {
            console.error(
              "Error playing time-pressured speed-up audio:",
              error
            );
          }
        }
      } else {
        // Play regular time-pressured audio
        if (timePressuredAudioRef.current) {
          try {
            // Pause the speed-up audio if it's playing
            if (
              timePressuredSpeedUpAudioRef.current &&
              !timePressuredSpeedUpAudioRef.current.paused
            ) {
              timePressuredSpeedUpAudioRef.current.pause();
              timePressuredSpeedUpAudioRef.current.currentTime = 0;
            }

            // Only play if not already playing
            if (timePressuredAudioRef.current.paused) {
              await timePressuredAudioRef.current.play();
              setIsPlaying(true);
              setActiveAudio("timePressured");
            }
          } catch (error) {
            console.error("Error playing time-pressured audio:", error);
          }
        }
      }
    },
    [activeAudio]
  );

  const fadeOutAudio = (
    audioRef: React.MutableRefObject<HTMLAudioElement | null>,
    duration: number
  ) => {
    if (audioRef.current && !audioRef.current.paused) {
      const fadeOutInterval = 50;
      const fadeOutStep =
        audioRef.current.volume / (duration / fadeOutInterval);

      const fadeOut = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0) {
          audioRef.current.volume = Math.max(
            0,
            audioRef.current.volume - fadeOutStep
          );
        } else {
          clearInterval(fadeOut);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.volume = 1; // Reset volume for next play
          }
        }
      }, fadeOutInterval);
    }
  };

  const pauseAudio = useCallback(() => {
    // Quick fade out for background music
    fadeOutAudio(startAudioRef, 300);
    fadeOutAudio(loopAudioRef, 300);
    fadeOutAudio(peacefulModeAudioRef, 300);
    fadeOutAudio(userOnboardingAudioRef, 300);
    fadeOutAudio(timePressuredAudioRef, 300);
    fadeOutAudio(timePressuredSpeedUpAudioRef, 300);

    // Stop sound effects immediately
    if (correctAnswerSoundRef.current) {
      correctAnswerSoundRef.current.pause();
      correctAnswerSoundRef.current.currentTime = 0;
    }
    if (incorrectAnswerSoundRef.current) {
      incorrectAnswerSoundRef.current.pause();
      incorrectAnswerSoundRef.current.currentTime = 0;
    }
    // Don't stop session complete sound in pauseAudio
    setIsPlaying(false);
  }, []);

  // Central function to set the active mode audio - MOVED AFTER REQUIRED FUNCTIONS
  const setActiveModeAudio = useCallback(
    async (mode: string) => {
      const normalizedMode = String(mode || "").trim();
      console.log("Setting active mode audio for:", normalizedMode);

      // Pause current audio before starting new one
      pauseAudio();

      // Small delay to ensure audio doesn't overlap
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (normalizedMode.includes("Peaceful")) {
        console.log("Starting peaceful mode audio");
        // Always reset the audio to the beginning
        if (peacefulModeAudioRef.current) {
          peacefulModeAudioRef.current.currentTime = 0;
          try {
            await peacefulModeAudioRef.current.play();
            setIsPlaying(true);
            setActiveAudio("peaceful");
            sessionStorage.setItem("activeAudio", "peaceful");
          } catch (error) {
            console.error("Error playing peaceful mode audio:", error);
          }
        }
      } else if (
        normalizedMode.includes("Time Pressured") ||
        normalizedMode.includes("Time Pressed")
      ) {
        console.log("Starting time pressured mode audio");
        // Always reset the audio to the beginning
        if (timePressuredAudioRef.current) {
          timePressuredAudioRef.current.currentTime = 0;
          try {
            await timePressuredAudioRef.current.play();
            setIsPlaying(true);
            setActiveAudio("timePressured");
            sessionStorage.setItem("activeAudio", "timePressured");
          } catch (error) {
            console.error("Error playing time pressured audio:", error);
          }
        }
      } else {
        // For other modes or no mode, clear the active audio
        console.log("No recognized audio mode, clearing active audio");
        setActiveAudio(null);
        sessionStorage.removeItem("activeAudio");
      }
    },
    [pauseAudio]
  );

  // Create a function to completely stop audio (without fade)
  const stopAllAudio = useCallback(() => {
    console.log("Stopping all audio completely");

    // Stop all audio references immediately
    if (startAudioRef.current) {
      startAudioRef.current.pause();
      startAudioRef.current.currentTime = 0;
    }
    if (loopAudioRef.current) {
      loopAudioRef.current.pause();
      loopAudioRef.current.currentTime = 0;
    }
    if (peacefulModeAudioRef.current) {
      peacefulModeAudioRef.current.pause();
      peacefulModeAudioRef.current.currentTime = 0;
    }
    if (userOnboardingAudioRef.current) {
      userOnboardingAudioRef.current.pause();
      userOnboardingAudioRef.current.currentTime = 0;
    }
    if (timePressuredAudioRef.current) {
      timePressuredAudioRef.current.pause();
      timePressuredAudioRef.current.currentTime = 0;
    }
    if (timePressuredSpeedUpAudioRef.current) {
      timePressuredSpeedUpAudioRef.current.pause();
      timePressuredSpeedUpAudioRef.current.currentTime = 0;
    }
    if (correctAnswerSoundRef.current) {
      correctAnswerSoundRef.current.pause();
      correctAnswerSoundRef.current.currentTime = 0;
    }
    if (incorrectAnswerSoundRef.current) {
      incorrectAnswerSoundRef.current.pause();
      incorrectAnswerSoundRef.current.currentTime = 0;
    }
    if (sessionCompleteSoundRef.current) {
      sessionCompleteSoundRef.current.pause();
      sessionCompleteSoundRef.current.currentTime = 0;
    }

    // Reset state
    setIsPlaying(false);
    setActiveAudio(null);
    sessionStorage.removeItem("activeAudio");
  }, []);

  // Route-based audio management (keep this for specific routes)
  useEffect(() => {
    // Check current location path
    const currentPath = location.pathname;
    console.log("Route changed to:", currentPath, "Active audio:", activeAudio);

    // Welcome/onboarding specific routes
    if (currentPath === "/welcome") {
      // Reinitialize audio when returning to welcome
      initializeAudio();
      playStartAudio();
    } else if (currentPath === "/my-preferences") {
      // Fully stop all audio on preferences
      stopAllAudio();
    } else if (currentPath === "/tutorial/step-two") {
      // Reinitialize audio when starting tutorial
      initializeAudio();
      playUserOnboardingAudio();
    }
    // For game related routes, don't interrupt game mode audio
    else if (
      (currentPath.includes("/dashboard/play") ||
        currentPath.includes("/dashboard/setup") ||
        currentPath === "/dashboard/summary") &&
      (activeAudio === "peaceful" || activeAudio === "timePressured")
    ) {
      // Don't interrupt game mode audio on game-related paths
      console.log("Preserving game audio on path:", currentPath);
    }
    // For dashboard home, stop mode audio
    else if (currentPath === "/dashboard/home") {
      // Always stop game audio when returning to home
      console.log("Stopping game audio on dashboard home");
      stopAllAudio();
    }
    // Session complete page should stop mode audio
    else if (currentPath.includes("/dashboard/session-complete")) {
      console.log("Stopping mode audio on session complete");
      stopAllAudio();
    }
  }, [
    location.pathname,
    playStartAudio,
    playUserOnboardingAudio,
    stopAllAudio,
    activeAudio,
  ]);

  return (
    <AudioContext.Provider
      value={{
        playStartAudio,
        playLoopAudio,
        playPeacefulModeAudio,
        playUserOnboardingAudio,
        playCorrectAnswerSound,
        playIncorrectAnswerSound,
        playSessionCompleteSound,
        playTimePressuredAudio,
        setActiveModeAudio,
        pauseAudio,
        stopAllAudio,
        isPlaying,
        activeAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
