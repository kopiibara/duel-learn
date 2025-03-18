import React, { useState, useEffect } from "react";
import { useGameLogic } from "../../hooks/useGameLogic";
import FlashCard from "../../components/common/FlashCard";
import Header from "../../components/common/Header";
import Timer from "../../components/common/Timer";
import axios from "axios";
import "./../../styles/setupques.css";
import { useAudio } from "../../../../../contexts/AudioContext";

interface TimePressuredModeProps {
  mode: string;
  material: any;
  selectedTypes: string[];
  timeLimit?: number;
}

const TimePressuredMode: React.FC<TimePressuredModeProps> = ({
  mode,
  material,
  selectedTypes,
  timeLimit,
}) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(true);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const {
    playCorrectAnswerSound,
    playIncorrectAnswerSound,
    playTimePressuredAudio,
    pauseAudio,
  } = useAudio();

  // Fix whitespace and case sensitivity issues
  const normalizedMode = String(mode).trim();

  // Initialize time-pressured audio when component mounts
  useEffect(() => {
    if (normalizedMode === "Time Pressured") {
      // Pause any existing audio first
      pauseAudio();
      // Start with regular time-pressured audio (not speed-up)
      // Using 30 as a default time remaining value to ensure we start with regular audio, not speed-up
      playTimePressuredAudio(30);
    }

    // Clean up when component unmounts
    return () => {
      pauseAudio();
    };
  }, [normalizedMode, pauseAudio, playTimePressuredAudio]);

  // Generate AI questions when component mounts
  useEffect(() => {
    const generateAIQuestions = async () => {
      console.log("Starting AI question generation in TimePressuredMode");
      console.log("Selected question types:", selectedTypes);
      setIsGeneratingAI(true);
      const generatedQuestions = [];

      try {
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
              numberOfItems: 1
            };

            const response = await axios.post<{ data: any[] }>(endpoint, requestPayload);
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              generatedQuestions.push(...response.data);
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
      }
    };

    generateAIQuestions();
  }, [material, selectedTypes]);

  const {
    currentQuestion,
    isFlipped,
    handleFlip,
    handleAnswerSubmit: originalHandleAnswerSubmit,
    correctCount,
    incorrectCount,
    showResult,
    showNextButton,
    handleNextQuestion,
    getButtonStyle,
    inputAnswer,
    setInputAnswer,
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

  // Effect to update time-pressured audio based on remaining time
  useEffect(() => {
    if (questionTimer !== null) {
      // Only update audio if it's actually changed (i.e., crossed the 5-second threshold)
      const isSpeedUpThreshold = questionTimer <= 5;
      const shouldUpdateAudio =
        (isSpeedUpThreshold && (previousTimerRef.current ?? Infinity) > 5) || // Just crossed below 5
        (!isSpeedUpThreshold && (previousTimerRef.current ?? 0) <= 5) || // Just crossed above 5
        previousTimerRef.current === null; // First time

      if (shouldUpdateAudio) {
        console.log(`Timer audio update: ${questionTimer} seconds remaining`);
        playTimePressuredAudio(questionTimer);
      }

      // Store the current timer value for next comparison
      previousTimerRef.current = questionTimer;
    }
  }, [questionTimer, playTimePressuredAudio]);

  // Track previous timer value for optimized audio updates
  const previousTimerRef = React.useRef<number | null>(null);

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

  const [startTime] = useState(new Date());

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
