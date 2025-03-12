import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGameLogic } from "../../hooks/useGameLogic";
import FlashCard from "../../components/common/FlashCard";
import Header from "../../components/common/Header";
import Timer from "../../components/common/Timer";
import axios from "axios";
import "./../../styles/setupques.css";

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
  const location = useLocation();
  const [isGeneratingAI, setIsGeneratingAI] = useState(true);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  
  // Fix whitespace and case sensitivity issues
  const normalizedMode = String(mode).trim();

  if (normalizedMode === "Time Pressured") {
    // ...
  }

  // Generate AI questions when component mounts
  useEffect(() => {
    const generateAIQuestions = async () => {
      console.log("Starting AI question generation in TimePressuredMode");
      setIsGeneratingAI(true);
      const generatedQuestions = [];

      try {
        for (const type of selectedTypes) {
          console.log(`Generating questions for type: ${type}`);
          
          for (const item of material.items) {
            console.log(`Requesting ${type} question for term: "${item.term}"`);
            
            const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/openai/generate-${type}`;
            console.log(`Making API request to: ${endpoint}`);
            
            const requestPayload = {
              term: item.term,
              definition: item.definition,
              numberOfItems: 1
            };
            
            const response = await axios.post(endpoint, requestPayload);
            console.log(`Response received for ${type} question:`, response.data);
            
            if (Array.isArray(response.data) && response.data.length > 0) {
              generatedQuestions.push(...response.data);
            }
          }
        }
        
        console.log("All AI questions generated:", generatedQuestions);
        setAiQuestions(generatedQuestions);
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
    handleAnswerSubmit,
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
    handleRevealAnswer, // Add this
    cardDisabled, // Add this
  } = useGameLogic({ 
    mode, 
    material, 
    selectedTypes,
    timeLimit, 
    aiQuestions
  });

  const [startTime] = useState(new Date());

  // Show loading state while AI questions are being generated
  if (isGeneratingAI) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Generating Questions...</h1>
          <p className="text-lg">Please wait while our AI prepares your timed challenge.</p>
        </div>
      </div>
    );
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
                                    : "border-gray-600"    // Default gray border
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
                onReveal={handleRevealAnswer} // Add this line
                timeRemaining={questionTimer}
                type={currentQuestion?.type}
                disabled={cardDisabled} // Add this line
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
