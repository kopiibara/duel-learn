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
  const [isPlaying, setIsPlaying] = useState(false);
  const location = useLocation();

  useEffect(() => {
    startAudioRef.current = new Audio("/sounds-sfx/WELCOME_START.mp3");
    loopAudioRef.current = new Audio("/sounds-sfx/WELCOME_LOOP.mp3");
    peacefulModeAudioRef.current = new Audio("/sounds-sfx/peacefulMode.mp3");
    userOnboardingAudioRef.current = new Audio(
      "/sounds-sfx/user_onboarding.mp3"
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

    return () => {
      if (startAudioRef.current) {
        startAudioRef.current.removeEventListener(
          "ended",
          handleStartAudioEnded
        );
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
          setIsPlaying(false); // Reset isPlaying state
        }
      }, fadeOutInterval);
    }
  };

  const pauseAudio = useCallback(() => {
    fadeOutAudio(startAudioRef, 1000);
    fadeOutAudio(loopAudioRef, 1000);
    fadeOutAudio(peacefulModeAudioRef, 1000);
    fadeOutAudio(userOnboardingAudioRef, 1000);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (location.pathname === "/welcome") {
      playStartAudio();
    } else if (location.pathname === "/my-preferences") {
      fadeOutAudio(startAudioRef, 1000);
    } else if (location.pathname === "/tutorial/step-two") {
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
        pauseAudio,
        isPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
