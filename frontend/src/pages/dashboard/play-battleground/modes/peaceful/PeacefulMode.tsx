import React, { useState, useEffect } from "react";
import { useGameLogic } from "../../hooks/useGameLogic";
import FlashCard from "../../components/common/FlashCard";
import Header from "../../components/common/Header";
import Timer from "../../components/common/Timer";
import axios from "axios";
import { useAudio } from "../../../../../contexts/AudioContext";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { nanoid } from "nanoid";
import { useUser } from "../../../../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import GeneralLoadingScreen from "../../../../../components/LoadingScreen";

interface PeacefulModeProps {
  mode: string;
  material: any;
  selectedTypes: string[];
}

// Add interface for API response
interface SessionReportResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  error?: string;
}

// Add interface for session data
interface SessionData {
  correctCount: number;
  incorrectCount: number;
  highestStreak: number;
  earnedXP: number;
  timeSpent: string;
}

// Add interface for session payload
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

const PeacefulMode: React.FC<PeacefulModeProps> = ({
  mode,
  material,
  selectedTypes,
}) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(true);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const { playCorrectAnswerSound, playIncorrectAnswerSound } = useAudio();
  const { user } = useUser();
  const navigate = useNavigate();

  // Add state for session ID
  const [sessionId] = useState(nanoid());

  // Add state to track if session has been saved
  const [hasSessionSaved, setHasSessionSaved] = useState(false);

  // Add state to track if game is ended by user
  const [isGameEndedByUser, setIsGameEndedByUser] = useState(false);

  // Generate AI questions when component mounts
  useEffect(() => {
    const generateAIQuestions = async () => {
      if (aiQuestions.length > 0) {
        console.log("Questions already exist in state, skipping generation");
        setIsGeneratingAI(false);
        return;
      }

      if (!material?.study_material_id) {
        console.error("No study material ID provided");
        setIsGeneratingAI(false);
        return;
      }

      console.log("Starting AI question generation in PeacefulMode");
      setIsGeneratingAI(true);
      
      try {
        // Clear existing questions first
        const clearEndpoint = `${import.meta.env.VITE_BACKEND_URL}/api/openai/clear-questions/${material.study_material_id}`;
        try {
          const clearResponse = await axios.delete<{success: boolean, error?: string}>(clearEndpoint);
          
          if (!clearResponse.data.success) {
            console.warn("Failed to clear existing questions:", clearResponse.data.error);
            // Continue with generation despite clearing error
            console.log("Continuing with question generation despite clearing error");
          } else {
            console.log("Successfully cleared existing questions:", clearResponse.data);
          }
        } catch (clearError) {
          // Log the error but continue with generation
          console.warn("Error clearing existing questions:", clearError);
          console.log("Continuing with question generation despite clearing error");
        }

        // Continue with question generation
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

        // Log the first few items to verify the data structure
        console.log("First few items:", shuffledItems.slice(0, 3).map(item => ({
          item_id: item.item_id, // Use item_id instead of id
          item_number: item.item_number,
          term: item.term
        })));

        // Create a temporary array to store generated questions
        const generatedQuestions: any[] = [];

        // Generate questions according to the distribution
        let currentItemIndex = 0;

        for (const type of selectedTypes) {
          const questionsOfThisType = distribution[type];
          console.log(`\nGenerating ${questionsOfThisType} questions of type "${type}":`);

          for (let i = 0; i < questionsOfThisType; i++) {
            const item = shuffledItems[currentItemIndex];
            
            console.log(`Processing item:`, {
              item_id: item.item_id,
              item_number: item.item_number,
              term: item.term
            });

            const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/openai/generate-${type}`;
            const requestPayload = {
              term: item.term,
              definition: item.definition,
              numberOfItems: 1,
              studyMaterialId: material.study_material_id,
              itemId: item.item_id,
              itemNumber: item.item_number,
              gameMode: "peaceful",
              timestamp: new Date().getTime()
            };

            try {
              const response = await axios.post<any[]>(endpoint, requestPayload);
              
              if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const questionsWithItemInfo = response.data.map(q => ({
                  ...q,
                  item_id: item.item_id,
                  item_number: item.item_number,
                  itemInfo: {
                    term: item.term,
                    definition: item.definition,
                    itemId: item.item_id,
                    itemNumber: item.item_number
                  }
                }));
                
                // Push to temporary array instead of aiQuestions
                generatedQuestions.push(...questionsWithItemInfo);
                console.log(`✓ Successfully generated ${type} question for "${item.term}" with item_id: ${item.item_id}`);
              } else {
                console.warn(`⚠ No question generated for "${item.term}" of type ${type}`);
              }
            } catch (error) {
              console.error(`Error generating ${type} question:`, error);
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
        
        // Set the state with the complete array of questions
        setAiQuestions(shuffledQuestions);
      } catch (error) {
        console.error("Error in question generation process:", error);
        setAiQuestions([]);
      } finally {
        setIsGeneratingAI(false);
      }
    };

    generateAIQuestions();
  }, [material?.study_material_id, selectedTypes]);

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
    correctCount,
    incorrectCount,
    highestStreak,
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

  // Update the handleEndGame function
  const handleEndGame = async () => {
    console.log("Handling early game end in peaceful mode...");
    
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
      earnedXP: 0 // Always 0 for early end
    };

    try {
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

      // Use navigate instead of window.location
      navigate("/dashboard/study/session-summary", {
        replace: true,
        state: navigationState
      });
    } catch (error) {
      console.error("Failed to save incomplete session:", error);
      
      // Still try to navigate even if save fails
      navigate("/dashboard/study/session-summary", {
        replace: true,
        state: navigationState
      });
    }
  };

  // Add this helper function to calculate XP based on number of items
  const calculateExpGained = (isComplete: boolean, gameMode: string, totalItems: number): number => {
    if (gameMode.toLowerCase() === 'peaceful') {
      return isComplete ? 5 : 0; // Peaceful mode: 5 XP if complete, 0 if incomplete
    } else if (gameMode.toLowerCase() === 'time-pressured') {
      // Calculate XP based on number of items (5 XP per 10 items)
      return Math.floor(totalItems / 10) * 5;
    }
    return 0; // Default case
  };

  // Update the saveSessionReport function
  const saveSessionReport = async (sessionData: SessionData, isComplete: boolean = true) => {
    if (hasSessionSaved) {
      console.log("Session already saved, skipping duplicate save");
      return;
    }

    try {
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/session-report/save`;
      
      // Get total number of items from material
      const totalItems = material?.items?.length || 0;
      
      // Calculate XP based on game mode and number of items
      const expGained = calculateExpGained(isComplete, mode, totalItems);
      
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

  // Remove the cleanup effect since we're handling early endings explicitly through handleEndGame
  useEffect(() => {
    const saveSession = async () => {
      // Only save when the session is complete (all questions answered)
      if (correctCount + incorrectCount === aiQuestions.length && aiQuestions.length > 0 && !hasSessionSaved) {
        const sessionData: SessionData = {
          correctCount,
          incorrectCount,
          highestStreak,
          earnedXP: 5,
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

  // Helper function to calculate time spent
  const calculateTimeSpent = (start: Date, end: Date) => {
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000); // difference in seconds
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show loading screen while generating questions
  if (isGeneratingAI) {
    return <GeneralLoadingScreen text="Generating Questions" isLoading={isGeneratingAI} />;
  }

  // Show loading screen if we don't have questions yet
  if (aiQuestions.length === 0) {
    return <GeneralLoadingScreen text="Preparing Study Session" isLoading={true} />;
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
