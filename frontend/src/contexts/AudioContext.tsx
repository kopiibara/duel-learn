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
  pauseAudio: () => void;
  isPlaying: boolean;
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
  const [isPlaying, setIsPlaying] = useState(false);
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

    loopAudioRef.current.loop = true;
    peacefulModeAudioRef.current.loop = true;
    userOnboardingAudioRef.current.loop = true;

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

  useEffect(() => {
    initializeAudio();

    return () => {
      // Cleanup function
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
      setIsPlaying(false);
    };
  }, []);

  const playStartAudio = useCallback(async () => {
    if (startAudioRef.current && !isPlaying) {
      try {
        await startAudioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing start audio:", error);
      }
    }
  }, [isPlaying]);

  const playLoopAudio = useCallback(async () => {
    if (loopAudioRef.current && !isPlaying) {
      try {
        await loopAudioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing loop audio:", error);
      }
    }
  }, [isPlaying]);

  const playPeacefulModeAudio = useCallback(async () => {
    if (peacefulModeAudioRef.current && !isPlaying) {
      try {
        await peacefulModeAudioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing peaceful mode audio:", error);
      }
    }
  }, [isPlaying]);

  const playUserOnboardingAudio = useCallback(async () => {
    if (userOnboardingAudioRef.current && !isPlaying) {
      try {
        await userOnboardingAudioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing user onboarding audio:", error);
      }
    }
  }, [isPlaying]);

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

  const fadeOutAudio = (
    audioRef: React.MutableRefObject<HTMLAudioElement | null>,
    duration: number
  ) => {
    if (audioRef.current) {
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

  useEffect(() => {
    if (location.pathname === "/welcome") {
      initializeAudio(); // Reinitialize audio when returning to welcome
      playStartAudio();
    } else if (location.pathname === "/my-preferences") {
      pauseAudio();
    } else if (location.pathname === "/tutorial/step-two") {
      initializeAudio(); // Reinitialize audio when starting tutorial
      playUserOnboardingAudio();
    } else if (location.pathname === "/dashboard/home") {
      pauseAudio();
    }
  }, [location.pathname, playStartAudio, playUserOnboardingAudio, pauseAudio]);

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
        pauseAudio,
        isPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
