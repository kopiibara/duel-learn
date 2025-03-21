import React, { useState, useEffect } from "react";
import { useGameLogic } from "../../hooks/useGameLogic";
import FlashCard from "../../components/common/FlashCard";
import Header from "../../components/common/Header";
import Timer from "../../components/common/Timer";
import axios from "axios";
import { useAudio } from "../../../../../contexts/AudioContext";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

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
      // Skip if we already have questions for this material
      if (aiQuestions.length > 0) {
        console.log("Questions already generated, skipping...");
        return;
      }

      console.log("Starting AI question generation in PeacefulMode");
      console.log("Selected question types:", selectedTypes);
      console.log("Material received:", material);
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

        // Enhanced debugging for item IDs
        if (material.items && material.items.length > 0) {
          console.log("Item ID examples:", material.items.slice(0, 3).map((item: any) => ({
            id: item.id,
            type: typeof item.id,
            stringified: JSON.stringify(item.id),
            item_number: item.item_number
          })));
        }

        // Create an array of items and shuffle it
        const items = [...material.items];
        const shuffledItems = items.sort(() => Math.random() - 0.5);
        const totalItems = items.length;
        const typesCount = selectedTypes.length;

        // Validate selected types
        const validTypes = ['identification', 'multiple-choice', 'true-false'];
        selectedTypes.forEach(type => {
          if (!validTypes.includes(type)) {
            console.warn(`Warning: Unknown question type "${type}"`);
          }
        });

        // Calculate distribution of questions per type
        const distribution = selectedTypes.reduce((acc, type, index) => {
          if (index === typesCount - 1) {
            acc[type] = totalItems - Object.values(acc).reduce((sum, val) => sum + val, 0);
          } else {
            acc[type] = Math.max(1, Math.floor(totalItems / typesCount));
          }
          return acc;
        }, {} as Record<string, number>);

        console.log("Question distribution for", totalItems, "items:");
        Object.entries(distribution).forEach(([type, count]) => {
          console.log(`- ${type}: ${count} questions`);
        });

        // Generate questions according to the distribution
        let currentItemIndex = 0;

        for (const type of selectedTypes) {
          const questionsOfThisType = distribution[type];
          console.log(`\nGenerating ${questionsOfThisType} questions of type "${type}":`);

          for (let i = 0; i < questionsOfThisType; i++) {
            const item = shuffledItems[currentItemIndex];
            if (!item || !item.term || !item.definition) {
              console.error(`Invalid item at index ${currentItemIndex}:`, item);
              continue;
            }

            console.log(`[${type}] Question ${i + 1}/${questionsOfThisType} using item: "${item.term}" (ID: ${item.id}, type: ${typeof item.id}, item_number: ${item.item_number})`);

            // Log ID format in proper format
            console.log(`[${type}] Item ID format check: "${item.id}" (${typeof item.id}, length: ${String(item.id).length})`);

            const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/openai/generate-${type}`;
            const requestPayload = {
              term: item.term,
              definition: item.definition,
              numberOfItems: 1,
              studyMaterialId: material.study_material_id,
              itemId: String(item.id), // Ensure ID is passed as string
              itemNumber: item.item_number, // Ensure we're sending the actual item_number
              gameMode: "peaceful",
              timestamp: new Date().getTime()
            };

            // Enhanced logging to debug the ID format
            console.log("Request payload for item:", {
              term: item.term,
              studyMaterialId: material.study_material_id,
              itemId: item.id,
              idType: typeof item.id,
              itemNumber: item.item_number
            });

            try {
              const response = await axios.post<any[]>(endpoint, requestPayload);
              
              if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                // When adding itemInfo to questions, ensure we pass the string ID
                const questionsWithItemInfo = response.data.map(q => ({
                  ...q,
                  itemInfo: {
                    term: item.term,
                    definition: item.definition,
                    itemId: String(item.id) // Ensure it's a string
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
        setAiQuestions([]);
      } finally {
        setIsGeneratingAI(false);
      }
    };

    generateAIQuestions();
  }, [material?.study_material_id, selectedTypes]); // Only depend on material ID and selectedTypes

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

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showResult && isCorrect) {
        if (event.key === 'ArrowLeft') {
          handleMastered();
        } else if (event.key === 'ArrowRight') {
          handleUnmastered();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showResult, isCorrect, handleMastered, handleUnmastered]);

  // Remove the custom loading UI since LoadingScreen.tsx is already handling this
  if (isGeneratingAI) {
    return null; // Return null to let the parent component handle loading state
  }

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    // Common styles for Mastered/Retake buttons with strokes
    const masterButtonStyle = "relative h-[100px] w-[200px] bg-[#16251C] rounded-lg text-white hover:opacity-90 transition-colors border-2 border-[#6DBE45] flex items-center justify-center";
    const retakeButtonStyle = "relative h-[100px] w-[200px] bg-[#39101B] rounded-lg text-white hover:opacity-90 transition-colors border-2 border-[#FF3B3F] flex items-center justify-center";
    
    // Updated sizes for the arrow indicators (25x25)
    const leftArrowStyle = "absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#080511] rounded-full w-[25px] h-[25px] flex items-center justify-center border border-[#6DBE45]";
    const rightArrowStyle = "absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-[#080511] rounded-full w-[25px] h-[25px] flex items-center justify-center border border-[#FF3B3F]";

    const renderMasteredRetakeButtons = () => (
      <div className="w-full flex flex-col items-center">
        <div className="text-sm text-gray-400 whitespace-nowrap opacity-80 mb-2">
          Use ← → arrow keys or click buttons
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleMastered}
            className={masterButtonStyle}
          >
            <div className={leftArrowStyle}>
              <KeyboardArrowLeftIcon sx={{ fontSize: 20 }} />
            </div>
            Mastered!
          </button>
          <button
            onClick={handleUnmastered}
            className={retakeButtonStyle}
          >
            Retake
            <div className={rightArrowStyle}>
              <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
            </div>
          </button>
        </div>
      </div>
    );

    switch (currentQuestion.questionType) {
      case "multiple-choice":
        return (
          <div className="w-full max-w-[1000px] mx-auto">
            {showResult && isCorrect ? (
              renderMasteredRetakeButtons()
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            )}
          </div>
        );

      case "identification":
        return (
          <div className="w-full max-w-[500px] mt-3 mx-auto">
            {showResult && isCorrect ? (
              renderMasteredRetakeButtons()
            ) : (
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
            )}
          </div>
        );

      case "true-false":
        return (
          <div className="w-full flex justify-center">
            {showResult && isCorrect ? (
              renderMasteredRetakeButtons()
            ) : (
              ["true", "false"].map((option) => (
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
              ))
            )}
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
        </div>
      </main>
    </div>
  );
};

export default PeacefulMode;