import React, { useState, useEffect, useCallback } from "react";
import { useGameLogic } from "../../hooks/useGameLogic";
import FlashCard from "../../components/common/FlashCard";
import Header from "../../components/common/Header";
import Timer from "../../components/common/Timer";
import axios from "axios";
import "./../../styles/setupques.css";
import { useAudio } from "../../../../../contexts/AudioContext";
import { nanoid } from "nanoid";
import { useUser } from "../../../../../contexts/UserContext";
import { useNavigate } from "react-router-dom";

interface TimePressuredModeProps {
  mode: string;
  material: any;
  selectedTypes: string[];
  timeLimit?: number;
}

interface SessionReportResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  error?: string;
}

interface SessionData {
  correctCount: number;
  incorrectCount: number;
  highestStreak: number;
  earnedXP: number;
  timeSpent: string;
}

interface SessionPayload {
  session_id: string;
  study_material_id: string;
  title: string;
  summary: string;
  session_by_user_id: string;
  session_by_username: string;
  status: string;
  ends_at: string;
  exp_gained: number;
  coins_gained: number | null;
  game_mode: string | null;
  total_time: string;
  mastered: number;
  unmastered: number;
}

const TimePressuredMode: React.FC<TimePressuredModeProps> = ({
  mode,
  material,
  selectedTypes,
  timeLimit,
}) => {
  // 1. First, declare all hooks at the top
  const navigate = useNavigate(); // Move useNavigate to the top with other hooks
  const { user } = useUser();
  const {
    playCorrectAnswerSound,
    playIncorrectAnswerSound,
    playTimePressuredAudio,
    pauseAudio,
  } = useAudio();

  // 2. Then declare all useState hooks
  const [isGeneratingAI, setIsGeneratingAI] = useState(true);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [sessionId] = useState(nanoid());
  const [hasSessionSaved, setHasSessionSaved] = useState(false);
  const [isGameEndedByUser, setIsGameEndedByUser] = useState(false);
  const [startTime] = useState(new Date());
  const [inputAnswer, setInputAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // 3. Then useRef declarations
  const previousTimerRef = React.useRef<number | null>(null);

  // 4. Fix whitespace and case sensitivity
  const normalizedMode = String(mode).trim();

  // 5. Game logic hook
  const {
    currentQuestion,
    isFlipped,
    handleFlip,
    handleAnswerSubmit: originalHandleAnswerSubmit,
    correctCount,
    incorrectCount,
    showResult,
    showNextButton,
    handleNextQuestion: originalHandleNextQuestion,
    getButtonStyle,
    questionTimer,
    timerProgress,
    currentStreak,
    highestStreak,
    masteredCount,
    unmasteredCount,
    handleRevealAnswer,
    cardDisabled,
  } = useGameLogic({
    mode,
    material,
    selectedTypes,
    timeLimit,
    aiQuestions,
  });

  // 6. Helper functions (move these outside useEffect)
  const calculateExpGained = useCallback((isComplete: boolean, totalItems: number): number => {
    if (!isComplete) {
      return 0; // Always return 0 for incomplete sessions
    }
    return Math.floor(totalItems / 10) * 5;
  }, []);

  const calculateTimeSpent = useCallback((start: Date, end: Date) => {
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // 7. useEffect hooks
  useEffect(() => {
    if (normalizedMode === "Time Pressured") {
      pauseAudio();
      playTimePressuredAudio(30);
    }
    return () => {
      pauseAudio();
    };
  }, [normalizedMode, pauseAudio, playTimePressuredAudio]);

  useEffect(() => {
    const generateAIQuestions = async () => {
      // Skip if we already have questions or are currently generating
      if (aiQuestions.length > 0 || isGenerating) {
        console.log("Questions already exist or generation in progress, skipping...");
        return;
      }

      try {
        setIsGenerating(true);
        console.log("Starting AI question generation in TimePressuredMode");
        console.log("Selected question types:", selectedTypes);
        console.log("Mode received:", mode);
        setIsGeneratingAI(true);

        // Clear existing questions with explicit game mode
        const clearEndpoint = `${import.meta.env.VITE_BACKEND_URL}/api/openai/clear-questions/${material.study_material_id}`;
        try {
          const clearResponse = await axios.delete<{success: boolean, error?: string}>(clearEndpoint, {
            params: { gameMode: "time-pressured" }
          });
          
          if (!clearResponse.data.success) {
            console.warn("Failed to clear existing questions:", clearResponse.data.error);
          } else {
            console.log("Successfully cleared time-pressured questions");
          }
        } catch (clearError) {
          console.warn("Error clearing existing questions:", clearError);
        }

        // Create an array of items and shuffle it
        const items = [...material.items];
        const shuffledItems = items.sort(() => Math.random() - 0.5);

        // Calculate how many questions of each type we need
        const totalItems = items.length;
        const typesCount = selectedTypes.length;
        
        // Validate selected types
        const validTypes = ['identification', 'multiple-choice', 'true-false'];
        selectedTypes.forEach(type => {
          if (!validTypes.includes(type)) {
            console.warn(`Warning: Unknown question type "${type}"`);
          }
        });

        const distribution = selectedTypes.reduce((acc, type, index) => {
          // For the last type, assign all remaining items
          if (index === typesCount - 1) {
            acc[type] = totalItems - Object.values(acc).reduce((sum, val) => sum + val, 0);
          } else {
            // Otherwise, distribute items evenly with a minimum of 1
            acc[type] = Math.max(1, Math.floor(totalItems / typesCount));
          }
          return acc;
        }, {} as Record<string, number>);

        console.log("Question distribution for", totalItems, "items:");
        Object.entries(distribution).forEach(([type, count]) => {
          console.log(`- ${type}: ${count} questions`);
        });

        // Validate total matches number of items
        const totalQuestions = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        console.log(`Total questions to generate: ${totalQuestions} (should equal number of items: ${totalItems})`);

        // Keep track of which items have been used
        let currentItemIndex = 0;

        // Generate questions according to the distribution
        const generatedQuestions = [];
        for (const type of selectedTypes) {
          const questionsOfThisType = distribution[type];
          console.log(`\nGenerating ${questionsOfThisType} questions of type "${type}":`);

          for (let i = 0; i < questionsOfThisType; i++) {
            const item = shuffledItems[currentItemIndex];
            console.log(`[${type}] Question ${i + 1}/${questionsOfThisType} using item: "${item.term}"`);

            const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/openai/generate-${type}`;
            const requestPayload = {
              term: item.term,
              definition: item.definition,
              numberOfItems: 1,
              studyMaterialId: material.study_material_id,
              itemId: currentItemIndex + 1,
              gameMode: "time-pressured",  // Ensure this is consistent
              timestamp: new Date().getTime()
            };

            const response = await axios.post<any[]>(endpoint, requestPayload);
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              const questionsWithItemInfo = response.data.map(q => ({
                ...q,
                itemInfo: {
                  term: item.term,
                  definition: item.definition,
                  itemId: currentItemIndex + 1
                },
                gameMode: "time-pressured"  // Add game mode to question object
              }));
              
              generatedQuestions.push(...questionsWithItemInfo);
              console.log(`✓ Successfully generated ${type} question for "${item.term}"`);
            } else {
              console.warn(`⚠ No question generated for "${item.term}" of type ${type}`);
            }

            currentItemIndex++;
          }
        }

        console.log("\nQuestion generation summary:");
        console.log(`- Total items: ${totalItems}`);
        console.log(`- Questions generated: ${generatedQuestions.length}`);
        console.log(`- Types distribution:`, distribution);

        // Shuffle the questions for final presentation
        const shuffledQuestions = generatedQuestions.sort(() => Math.random() - 0.5);
        setAiQuestions(shuffledQuestions);
      } catch (error) {
        console.error("Error generating AI questions:", error);
      } finally {
        setIsGeneratingAI(false);
        setIsGenerating(false);
      }
    };

    generateAIQuestions();
  }, [material?.study_material_id, selectedTypes, mode]);

  useEffect(() => {
    if (questionTimer !== null) {
      const isSpeedUpThreshold = questionTimer <= 5;
      const shouldUpdateAudio =
        (isSpeedUpThreshold && (previousTimerRef.current ?? Infinity) > 5) ||
        (!isSpeedUpThreshold && (previousTimerRef.current ?? 0) <= 5) ||
        previousTimerRef.current === null;

      if (shouldUpdateAudio) {
        playTimePressuredAudio(questionTimer);
      }
      previousTimerRef.current = questionTimer;
    }
  }, [questionTimer, playTimePressuredAudio]);

  useEffect(() => {
    const saveSession = async () => {
      if (correctCount + incorrectCount === aiQuestions.length && aiQuestions.length > 0 && !hasSessionSaved) {
        const sessionData: SessionData = {
          correctCount,
          incorrectCount,
          highestStreak,
          earnedXP: calculateExpGained(true, material?.items?.length || 0),
          timeSpent: calculateTimeSpent(startTime, new Date())
        };

        try {
          await saveSessionReport(sessionData, true);
        } catch (error) {
          console.error("Failed to save completed session:", error);
        }
      }
    };

    saveSession();
  }, [correctCount, incorrectCount, aiQuestions.length, highestStreak, hasSessionSaved]);

  // Custom answer submit handler with sound effects
  const handleAnswerSubmit = (answer: string) => {
    let isAnswerCorrect = false;

    if (currentQuestion?.questionType === "identification") {
      isAnswerCorrect =
        answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    } else {
      isAnswerCorrect =
        answer.toLowerCase() === currentQuestion?.correctAnswer.toLowerCase();
    }

    // Play appropriate sound using AudioContext
    if (isAnswerCorrect) {
      playCorrectAnswerSound();
    } else {
      playIncorrectAnswerSound();
    }

    // Call the original handler
    originalHandleAnswerSubmit(answer);
  };

  // Create a wrapper for handleNextQuestion that also clears the input
  const handleNextQuestion = () => {
    setInputAnswer(''); // Clear the input
    originalHandleNextQuestion(); // Call the original handler
  };

  // Remove the custom loading UI since LoadingScreen.tsx is already handling this
  if (isGeneratingAI) {
    return null; // Return null to let the parent component handle loading state
  }

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.questionType) {
      case "multiple-choice":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[1000px] mx-auto">
            {currentQuestion.options?.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSubmit(option)}
                disabled={showResult}
                className={`h-[100px] w-full bg-transparent 
                          ${getButtonStyle(option)}
                          rounded-lg text-white hover:bg-gray-800/20 transition-colors
                          disabled:cursor-not-allowed px-4 text-center`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case "identification":
        return (
          <div className="w-full max-w-[500px] mt-3 mx-auto">
            <input
              type="text"
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !showResult) {
                  handleAnswerSubmit(inputAnswer);
                }
              }}
              disabled={showResult}
              className={`w-full p-4 rounded-lg bg-transparent py-10 px-10 border-2 text-center
                                ${
                                  showResult
                                    ? currentQuestion?.isCorrect
                                      ? "border-[#52A647]" // Green border for correct answers
                                      : "border-[#FF3B3F]" // Red border for incorrect answers
                                    : "border-gray-600" // Default gray border
                                }
                                text-white focus:outline-none placeholder:text-[#6F658D]`}
              placeholder="Type your answer here..."
            />
          </div>
        );

      case "true-false":
        return (
          <div className="flex gap-4 justify-center">
            {["true", "false"].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerSubmit(option)}
                disabled={showResult}
                className={`h-[100px] w-[200px] bg-transparent 
                                    ${getButtonStyle(option)}
                                    rounded-lg text-white hover:bg-gray-800/20 transition-colors
                                    disabled:cursor-not-allowed`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        );
    }
  };

  const getHeartbeatClass = () => {
    if (questionTimer === null || questionTimer === 0) return "";
    if (questionTimer <= 1) return "animate-heartbeat-1";
    if (questionTimer <= 2) return "animate-heartbeat-2";
    if (questionTimer <= 3) return "animate-heartbeat-3";
    return "";
  };

  const getBorderClass = () => {
    if (questionTimer === null) return "";
    if (questionTimer <= (timeLimit ?? 30) / 2) {
      return "animate-danger-pulse rounded-lg backdrop-blur-sm";
    }
    return "";
  };

  const getLowHealthEffects = () => {
    if (questionTimer === null || questionTimer === 0) return "";
    if (questionTimer <= (timeLimit ?? 30) / 2) {
      return "animate-screen-shake";
    }
    return "";
  };

  const renderVignette = () => {
    if (questionTimer === null || questionTimer > (timeLimit ?? 30) / 2)
      return null;
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-red-500/20 to-red-500/70 animate-pulse-vignette" />
      </div>
    );
  };

  const saveSessionReport = async (sessionData: SessionData, isComplete: boolean = true) => {
    if (hasSessionSaved) {
      console.log("Session already saved, skipping duplicate save");
      return;
    }

    try {
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/session-report/save`;
      
      // Get total number of items from material
      const totalItems = material?.items?.length || 0;
      
      // Calculate XP based on completion status
      const expGained = calculateExpGained(isComplete, totalItems);
      
      // Log the values we're about to send
      console.log("Preparing session report with values:", {
        timeSpent: sessionData.timeSpent,
        correctCount: sessionData.correctCount,
        incorrectCount: sessionData.incorrectCount
      });

      const payload: SessionPayload = {
        session_id: sessionId,
        study_material_id: material.study_material_id,
        title: material.title || '',
        summary: material.summary || '',
        session_by_user_id: user?.firebase_uid || '',
        session_by_username: user?.username || '',
        status: isComplete ? "completed" : "incomplete",
        ends_at: new Date().toISOString(),
        exp_gained: expGained,
        coins_gained: null,
        game_mode: mode.toLowerCase(),
        total_time: sessionData.timeSpent,        // Using timeSpent directly
        mastered: sessionData.correctCount,       // Using correctCount directly
        unmastered: sessionData.incorrectCount    // Using incorrectCount directly
      };

      console.log("Sending payload to server:", payload);

      const response = await axios.post<SessionReportResponse>(endpoint, payload);
      
      if (response.data.success) {
        console.log("Session report saved successfully:", response.data);
        setHasSessionSaved(true);
        return response.data;
      } else {
        console.error("Failed to save session report:", response.data);
        throw new Error(response.data.message || "Failed to save session report");
      }
    } catch (error: unknown) {
      console.error("Error in saveSessionReport:", error);
      if (error && typeof error === 'object' && 'isAxiosError' in error) {
        const axiosError = error as any;
        console.error("Axios error details:", {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
      }
      throw error;
    }
  };

  // Update the handleEndGame function
  const handleEndGame = async () => {
    console.log("Handling early game end...");
    
    if (hasSessionSaved) {
      console.log("Session already saved, skipping save");
      return;
    }

    const timeSpent = calculateTimeSpent(startTime, new Date());
    const navigationState = {
      timeSpent,
      correctCount,
      incorrectCount,
      mode,
      material: material?.title || "Unknown Material",
      earlyEnd: true,
      highestStreak,
      masteredCount,
      unmasteredCount,
      earnedXP: 0
    };

    try {
      // First save the session
      const sessionData: SessionData = {
        correctCount,
        incorrectCount,
        highestStreak,
        earnedXP: 0, // Force 0 XP for early end
        timeSpent
      };

      await saveSessionReport(sessionData, false);
      
      setIsGameEndedByUser(true);
      setHasSessionSaved(true);

      // Log navigation attempt
      console.log("Attempting navigation to summary with state:", navigationState);

      // Navigate after successful save
      navigate("/dashboard/study/session-summary", {
        replace: true,
        state: navigationState
      });
    } catch (error) {
      console.error("Failed to save incomplete session:", error);
      
      // Still try to navigate even if save fails
      console.log("Save failed, attempting navigation anyway");
      navigate("/dashboard/study/session-summary", {
        replace: true,
        state: navigationState
      });
    }
  };

  return (
    <div className={`min-h-screen relative ${getBorderClass()}`}>
      {renderVignette()}
      <div className={`relative ${getLowHealthEffects()}`}>
        <Header
          material={material}
          mode={mode}
          correct={correctCount}
          incorrect={incorrectCount}
          startTime={startTime}
          highestStreak={highestStreak}
          masteredCount={masteredCount}
          unmasteredCount={unmasteredCount}
          onEndGame={handleEndGame}
        />
        <main className="pt-24 px-4">
          <div className="mx-auto max-w-[1200px] flex flex-col items-center gap-8 h-[calc(100vh-96px)] justify-center">
            <div
              className={`w-[1200px] flex flex-col items-center gap-8 ${getHeartbeatClass()}`}
            >
              <FlashCard
                question={currentQuestion?.question || ""}
                correctAnswer={currentQuestion?.correctAnswer || ""}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                onReveal={handleRevealAnswer}
                timeRemaining={questionTimer}
                type={currentQuestion?.type}
                disabled={cardDisabled}
              />
            </div>
            {renderQuestionContent()}
            {showNextButton && (
              <button
                onClick={handleNextQuestion}
                className="mt-6 px-8 py-3 bg-[#4D18E8] text-white rounded-lg hover:bg-[#3A12B0] transition-colors"
              >
                Next Question
              </button>
            )}
          </div>
        </main>
        <Timer
          timeRemaining={questionTimer}
          progress={timerProgress}
          timeLimit={timeLimit ?? 30}
          currentStreak={currentStreak}
          highestStreak={highestStreak}
        />
      </div>
    </div>
  );
};

export default TimePressuredMode;