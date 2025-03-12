import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGameLogic } from "../../hooks/useGameLogic";
import FlashCard from "../../components/common/FlashCard";
import Header from "../../components/common/Header";
import Timer from "../../components/common/Timer";
import axios from "axios";

interface PeacefulModeProps {
  mode: string;
  material: any;
  selectedTypes: string[];
}

const PeacefulMode: React.FC<PeacefulModeProps> = ({
  mode,
  material,
  selectedTypes,
}) => {
  const location = useLocation();
  const [isGeneratingAI, setIsGeneratingAI] = useState(true);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const { timeLimit } = location.state || {};
  
  // Generate AI questions when component mounts
  useEffect(() => {
    const generateAIQuestions = async () => {
      console.log("Starting AI question generation in PeacefulMode");
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
            
            const response = await axios.post<{ data: any[] }>(endpoint, requestPayload);
            console.log(`Response received for ${type} question:`, response.data);
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
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
    masteredCount,
    unmasteredCount,
    showResult,
    isCorrect,
    inputAnswer,
    setInputAnswer,
    handleUnmastered,
    handleMastered,
    getButtonStyle,
    handleNextQuestion,
    handleRevealAnswer, // Add this
    cardDisabled, // Add this
  } = useGameLogic({ 
    mode, 
    material, 
    selectedTypes, 
    aiQuestions
  });

  const [startTime] = useState(new Date());

  // Show loading state while AI questions are being generated
  if (isGeneratingAI) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Generating Questions...</h1>
          <p className="text-lg">Please wait while our AI prepares your study content.</p>
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
                                    ? isCorrect 
                                      ? "border-[#52A647]" // Use isCorrect instead of direct comparison
                                      : "border-[#FF3B3F]"
                                    : "border-gray-600"
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

  return (
    <div className="min-h-screen relative">
      <Header
        material={material}
        mode={mode}
        correct={0}
        incorrect={0}
        startTime={startTime}
        highestStreak={0}
        masteredCount={masteredCount}
        unmasteredCount={unmasteredCount}
      />
      <main className="pt-24 px-4">
        <div className="mx-auto max-w-[1200px] flex flex-col items-center gap-8 h-[calc(100vh-96px)] justify-center">
          <FlashCard
            question={currentQuestion?.question || ""}
            correctAnswer={currentQuestion?.correctAnswer || ""}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            onReveal={handleRevealAnswer} // Add this line
            type={currentQuestion?.type}
            disabled={cardDisabled} // Add this line
          />
          {renderQuestionContent()}
          <Timer
            timeRemaining={30}
            progress={100}
            timeLimit={1}
            currentStreak={0}
            highestStreak={0}
            showTimerUI={false}
          />
          {showResult && isCorrect === false && (
            <button
              onClick={handleNextQuestion}
              className="mt-6 px-8 py-3 bg-[#4D18E8] text-white rounded-lg hover:bg-[#3A12B0] transition-colors"
            >
              Next Question
            </button>
          )}
          {showResult && isCorrect === true && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8 mb-6">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-1 h-24 bg-gray-800 absolute left-0"></div>{" "}
                  {/* Flagpole */}
                  <div
                    className="bg-[#FF3B3F] text-white rounded-lg p-4 text-3xl animate-waving-flag cursor-pointer"
                    onClick={handleUnmastered}
                  >
                    <span>Unmastered</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-1 h-24 bg-gray-800 absolute right-0"></div>{" "}
                  {/* Flagpole */}
                  <div
                    className="bg-[#52A647] text-white rounded-lg p-4 text-3xl animate-waving-flag cursor-pointer"
                    onClick={handleMastered}
                  >
                    <span>Mastered</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PeacefulMode;
