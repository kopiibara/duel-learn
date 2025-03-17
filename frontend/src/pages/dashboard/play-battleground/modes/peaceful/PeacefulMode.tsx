import React, { useState, useEffect } from "react";
import { useGameLogic } from "../../hooks/useGameLogic";
import FlashCard from "../../components/common/FlashCard";
import Header from "../../components/common/Header";
import Timer from "../../components/common/Timer";
import axios from "axios";
import { useAudio } from "../../../../../contexts/AudioContext";

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
  const [isGeneratingAI, setIsGeneratingAI] = useState(true);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const { playCorrectAnswerSound, playIncorrectAnswerSound } = useAudio();

  // Generate AI questions when component mounts
  useEffect(() => {
    const generateAIQuestions = async () => {
      console.log("Starting AI question generation in PeacefulMode");
      console.log("Selected question types:", selectedTypes);
      console.log("Material received:", material);
      console.log("Selected question types:", selectedTypes);
      setIsGeneratingAI(true);
      const generatedQuestions = [];

      try {
        // Validate material and items
        if (!material) {
          console.error("No material provided");
          return;
        }

        if (!Array.isArray(material.items) || material.items.length === 0) {
          console.error("Material has no valid items array:", material);
          return;
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
            if (!item || !item.term || !item.definition) {
              console.error(`Invalid item at index ${currentItemIndex}:`, item);
              continue;
            }

            console.log(`[${type}] Question ${i + 1}/${questionsOfThisType} using item: "${item.term}"`);

            const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/openai/generate-${type}`;
            const requestPayload = {
              term: item.term,
              definition: item.definition,
              numberOfItems: 1
              studyMaterialId: material.study_material_id,
              itemId: currentItemIndex + 1,
              gameMode: "peaceful",
              timestamp: new Date().getTime()
            };

            try {
              const response = await axios.post<any[]>(endpoint, requestPayload);
              
              if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                // Add the item information to each question for reference
                const questionsWithItemInfo = response.data.map(q => ({
                  ...q,
                  itemInfo: {
                    term: item.term,
                    definition: item.definition,
                    itemId: currentItemIndex + 1
                  }
                }));
                
                generatedQuestions.push(...questionsWithItemInfo);
                console.log(`✓ Successfully generated ${type} question for "${item.term}"`);
              } else {
                console.warn(`⚠ No question generated for "${item.term}" of type ${type}`);
              }
            } catch (error) {
              console.error(`Error generating ${type} question for "${item.term}":`, error);
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
        console.log("Setting AI questions:", shuffledQuestions);
        setAiQuestions(shuffledQuestions);
      } catch (error) {
        console.error("Error generating AI questions:", error);
        // Set empty array to prevent undefined errors
        setAiQuestions([]);
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
    handleRevealAnswer,
    cardDisabled,
  } = useGameLogic({
    mode,
    material,
    selectedTypes,
    aiQuestions,
  });

  const [startTime] = useState(new Date());

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
                                    ? isCorrect
                                      ? "border-[#52A647]"
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
            onReveal={handleRevealAnswer}
            type={currentQuestion?.type}
            disabled={cardDisabled}
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