import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { questionsData } from "../data/questions";

// Define StudyMaterial interface directly without importing the conflicting one
interface StudyMaterial {
  study_material_id: string;
  title: string;
  tags: string[];
  summary: string;
  total_items: number;
  items: {
    term: string;
    definition: string;
  }[];
}

interface UseGameLogicProps {
  mode: string;
  material: StudyMaterial;
  selectedTypes: string[];
  timeLimit?: number | null;
  aiQuestions?: Question[];
  isGameReady?: boolean;
}

export const useGameLogic = ({
  mode,
  material,
  selectedTypes,
  timeLimit,
  aiQuestions,
  isGameReady = false,
}: UseGameLogicProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [inputAnswer, setInputAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [startTime] = useState(new Date());
  const [timerProgress, setTimerProgress] = useState(100);
  const [questionTimer, setQuestionTimer] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [unmasteredCount, setUnmasteredCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [retakeQuestions, setRetakeQuestions] = useState<any[]>([]);
  const [isInRetakeMode, setIsInRetakeMode] = useState(false);
  const [retakePhase, setRetakePhase] = useState(0); // Track retake phases
  const [masteredQuestions, setMasteredQuestions] = useState<string[]>([]); // Track mastered questions
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isQuestionInitiallyLoaded, setIsQuestionInitiallyLoaded] = useState(false); // Flag to track initial question load

  const navigate = useNavigate();

  // Filter questions based on mode and selected types
  const filteredQuestions = questionsData.filter(
    (question) =>
      question.mode.toLowerCase() === mode.toLowerCase() &&
      selectedTypes.includes(question.questionType)
  );

  // Add a debug log when hook first loads with props
  useEffect(() => {
    console.log("useGameLogic initialized with props:", {
      mode,
      materialTitle: material?.title,
      selectedTypes,
      timeLimit,
      aiQuestionsCount: aiQuestions?.length || 0
    });
    
    if (aiQuestions) {
      console.log("AI questions received in hook:", aiQuestions);
    }
  }, []);

  const processQuestion = (rawQuestion: any) => {
    console.log("Processing raw question:", rawQuestion);

    // Ensure we preserve the answer field correctly
    const correctAnswer = rawQuestion.correctAnswer || rawQuestion.answer;
    
    // Determine the type of options (object or array)
    let processedOptions = rawQuestion.options;
    
    // If options is a string (JSON), try to parse it
    if (typeof rawQuestion.options === 'string') {
      try {
        processedOptions = JSON.parse(rawQuestion.options);
        console.log("Parsed options from JSON string:", processedOptions);
      } catch (e) {
        console.error("Failed to parse options JSON:", e);
      }
    }
    
    return {
      questionType: rawQuestion.questionType || rawQuestion.type,
      type: rawQuestion.type,
      question: rawQuestion.question,
      correctAnswer: correctAnswer, // Use the preserved answer
      answer: correctAnswer, // Keep both for compatibility
      options: processedOptions,
      rawOptions: rawQuestion.rawOptions,
      itemInfo: rawQuestion.itemInfo || {
        image: rawQuestion.image,
        term: rawQuestion.term,
        definition: rawQuestion.definition,
        itemId: rawQuestion.item_id,
        itemNumber: rawQuestion.item_number
      }
    };
  };

  useEffect(() => {
    if (aiQuestions && aiQuestions.length > 0) {
      console.log(`Processing AI question at index ${questionIndex} of ${aiQuestions.length}`);
      
      // Don't update the current question if we're showing results
      if (showResult) {
        console.log("Not updating current question because results are being shown");
        return;
      }
      
      // Don't update the question if it's already been loaded for this index
      // unless we're explicitly transitioning to a new question
      if (isQuestionInitiallyLoaded && !isTransitioning) {
        console.log("Question already loaded for this index, skipping update");
        return;
      }
      
      // If in retake mode, use retake questions array
      if (isInRetakeMode && retakeQuestions.length > 0) {
        const question = retakeQuestions[questionIndex];
        if (question) {
          console.log("Processing retake question:", question);
          const processedQuestion = processQuestion(question);
          console.log("Processed retake question:", processedQuestion);
          setCurrentQuestion(processedQuestion);
          setIsQuestionInitiallyLoaded(true);
        }
      } else {
        // Normal mode - use regular questions
        const question = aiQuestions[questionIndex];
        if (question) {
          console.log("Processing regular question:", question);
          const processedQuestion = processQuestion(question);
          console.log("Processed regular question:", processedQuestion);
          setCurrentQuestion(processedQuestion);
          setIsQuestionInitiallyLoaded(true);
        }
      }
    }
  }, [aiQuestions, questionIndex, isInRetakeMode, retakeQuestions, showResult, isTransitioning, isQuestionInitiallyLoaded]);

  // Update isLastQuestion to account for retake mode
  const isLastQuestion = isInRetakeMode 
    ? questionIndex === retakeQuestions.length - 1
    : aiQuestions 
      ? questionIndex === aiQuestions.length - 1
      : currentQuestionIndex === filteredQuestions.length - 1;

  // Timer logic for Time Pressured mode
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (mode === "Time Pressured" && timeLimit && !showResult && isGameReady) {
      setQuestionTimer(timeLimit);
      setTimerProgress(100);

      timer = setInterval(() => {
        setQuestionTimer((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            if (!showResult) {
              handleAnswerSubmit("");
            }
            return 0;
          }
          const progress = ((prev - 1) / timeLimit) * 100;
          setTimerProgress(progress);
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [currentQuestionIndex, timeLimit, showResult, mode, isGameReady]);

  const handleAnswerSubmit = (answer: string) => {
    if (showResult || !currentQuestion) return;

    // Get correct answer - with fallbacks
    let correctAnswer = currentQuestion.correctAnswer || currentQuestion.answer;
    
    // Handle special case for multiple-choice: correctAnswer might be in format "A. term"
    if (currentQuestion.questionType === "multiple-choice" && typeof correctAnswer === 'string' && correctAnswer.includes('. ')) {
      // Extract just the term part after the letter
      const answerParts = correctAnswer.split('. ');
      if (answerParts.length > 1) {
        correctAnswer = answerParts.slice(1).join('. ').trim();
        console.log(`Using extracted multiple-choice answer: "${correctAnswer}"`);
      }
    }

    // Multi-stage fallback for correct answer
    if (!correctAnswer && currentQuestion.itemInfo?.term) {
      correctAnswer = currentQuestion.itemInfo.term;
      console.log(`Using term as fallback answer: "${correctAnswer}"`);
    }
    
    if (!correctAnswer) {
      console.error("No correct answer found for question:", currentQuestion);
      return;
    }

    // Safe string conversion and comparison
    const answerString = String(answer || "").toLowerCase().trim();
    const correctAnswerString = String(correctAnswer).toLowerCase().trim();
    
    console.log(`Comparing answer "${answerString}" with correct answer "${correctAnswerString}"`);
    const isAnswerCorrect = answerString === correctAnswerString;
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    if (isAnswerCorrect) {
      setCorrectCount((prev) => prev + 1);
      setCurrentStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > highestStreak) {
          setHighestStreak(newStreak);
        }
        return newStreak;
      });
      setShowNextButton(false);
      
      // Check if this question was in the retake list
      const wasInRetakeList = retakeQuestions.some(q => 
        q.question === currentQuestion.question && 
        q.correctAnswer === correctAnswer
      );
      
      // If it was in retake list, decrease unmastered count
      if (wasInRetakeList) {
        console.log("Question was in retake list and answered correctly, decreasing unmastered count");
        setUnmasteredCount(prev => Math.max(0, prev - 1));
      }
      
      // If in retake mode and answer is correct, remove from retake list
      if (isInRetakeMode) {
        setRetakeQuestions(prev => prev.filter(q => 
          q.question !== currentQuestion.question || 
          q.correctAnswer !== correctAnswer
        ));
      }
    } else {
      setIncorrectCount((prev) => prev + 1);
      
      // Only increment unmastered count if the question is not already in retake list
      const alreadyInRetakeList = retakeQuestions.some(q => 
        q.question === currentQuestion.question && 
        q.correctAnswer === correctAnswer
      );
      
      if (!alreadyInRetakeList) {
        setUnmasteredCount((prev) => prev + 1);
      }
      
      setCurrentStreak(0);
      setShowNextButton(true);
      
      // Add incorrect question to retake list if not already there
      if (!alreadyInRetakeList) {
        setRetakeQuestions(prev => [...prev, currentQuestion]);
      }
    }

    setSelectedAnswer(answer);
    setIsFlipped(true);
    setShowNextButton(true);
  };

  const handleRevealAnswer = () => {
    if (showResult) return;
    
    console.log("User revealed answer without attempting a solution");
    
    // First, reveal the current question's answer
    setIsCorrect(false);
    setIncorrectCount(prev => prev + 1);
    setCurrentStreak(0);
    setShowResult(true);
    setShowNextButton(true);
    setIsFlipped(true);
    
    // Add revealed question to retake list if not already in it
    if (!retakeQuestions.some(q => 
      q.question === currentQuestion.question && 
      q.correctAnswer === currentQuestion.correctAnswer
    )) {
      setRetakeQuestions(prev => [...prev, currentQuestion]);
    }
    
    // Do NOT automatically move to the next question
    // The user must click "Next Question", "Mastered", or "Retake" button
  };

  const handleNextQuestion = () => {
    // Check if all questions are mastered
    const totalQuestions = aiQuestions?.length || 0;
    console.log("Checking next question:", {
      masteredCount,
      totalQuestions,
      retakeQuestionsCount: retakeQuestions.length
    });

    if (masteredCount === totalQuestions && retakeQuestions.length === 0) {
      console.log("All questions mastered, ending game");
      handleGameComplete();
      return;
    }

    if (isInRetakeMode) {
      console.log(`Current retake phase: ${retakePhase}, question index: ${questionIndex}, retake questions: ${retakeQuestions.length}`);
      
      if (questionIndex < retakeQuestions.length - 1) {
        // Move to next retake question
        setQuestionIndex(prev => prev + 1);
        resetQuestionState();
      } else if (retakeQuestions.length > 0) {
        // If there are still unmastered questions, move to next retake phase
        setRetakePhase(prev => prev + 1);
        console.log(`Moving to retake phase ${retakePhase + 1} with ${retakeQuestions.length} questions`);
        setQuestionIndex(0);
        resetQuestionState();
      } else {
        // All questions mastered, complete the game
        handleGameComplete();
      }
    } else if (aiQuestions && questionIndex < aiQuestions.length - 1) {
      // Move to next regular question
      setQuestionIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      // Finished regular questions, check if we have retakes
      if (retakeQuestions.length > 0) {
        // Start retake mode
        setIsInRetakeMode(true);
        setRetakePhase(1);
        console.log(`Starting retake phase 1 with ${retakeQuestions.length} questions`);
        setQuestionIndex(0);
        resetQuestionState();
      } else {
        // No retakes needed, complete the game
        handleGameComplete();
      }
    }
  };

  const resetQuestionState = () => {
    setIsTransitioning(true); // Start transition
    setIsFlipped(false);
    setSelectedAnswer(null);
    setInputAnswer("");
    setShowResult(false);
    setShowNextButton(false);
    setIsCorrect(null);
    setIsQuestionInitiallyLoaded(false); // Reset the flag when intentionally changing questions
    
    // Remove transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600); // Match the transition duration
  };

  const handleGameComplete = () => {
    const totalQuestions = aiQuestions?.length || 0;
    
    // Double-check that there are really no questions in the retake list
    if (retakeQuestions.length > 0) {
      console.log("Game completion prevented - still have questions in retake list", {
        retakeQuestionsCount: retakeQuestions.length
      });
      
      // If we have retake questions, go to retake mode instead of ending
      setIsInRetakeMode(true);
      setRetakePhase(prev => prev + 1);
      setQuestionIndex(0);
      resetQuestionState();
      return;
    }
    
    console.log("Game completion check:", {
      masteredCount,
      totalQuestions,
      retakeQuestionsCount: retakeQuestions.length,
      masteredQuestionsCount: masteredQuestions.length
    });

    const endTime = new Date();
    const timeDiff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(timeDiff / 60000);
    const seconds = Math.floor((timeDiff % 60000) / 1000);
    const timeSpent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    navigate("/dashboard/study/session-summary", {
      state: {
        timeSpent,
        correctCount: totalQuestions,
        incorrectCount: 0,
        mode,
        material,
        highestStreak,
        masteredCount: totalQuestions,
        unmasteredCount: 0,
        totalQuestions,
        aiQuestions: aiQuestions || [],
      },
    });
  };

  const handleMastered = () => {
    // Create a unique identifier for this question
    const questionId = `${currentQuestion.question}-${currentQuestion.correctAnswer}`;
    const totalQuestions = aiQuestions?.length || 0;
    
    // Check if this question was in the retake list before we modify it
    const wasInRetakeList = retakeQuestions.some(q => 
      q.question === currentQuestion.question && 
      q.correctAnswer === currentQuestion.correctAnswer
    );
    
    // Only increment mastered count if not already mastered
    if (!masteredQuestions.includes(questionId)) {
      // Calculate new mastered count
      const newMasteredCount = masteredCount + 1;
      
      console.log("Mastering question:", {
        currentMasteredCount: masteredCount,
        newMasteredCount,
        totalQuestions,
        questionId,
        retakeQuestionsLength: retakeQuestions.length,
        wasInRetakeList
      });

      // Update mastered questions list first
      setMasteredQuestions(prev => [...prev, questionId]);
      
      // If this question was in the retake list, reduce the unmastered count
      if (wasInRetakeList) {
        console.log("Question was in retake list and marked as mastered, decreasing unmastered count");
        setUnmasteredCount(prev => Math.max(0, prev - 1));
      }
      
      // Remove from retake list if in retake mode
      if (isInRetakeMode || wasInRetakeList) {
        setRetakeQuestions(prev => {
          const newRetakeQuestions = prev.filter(q => 
            q.question !== currentQuestion.question || 
            q.correctAnswer !== currentQuestion.correctAnswer
          );
          console.log("Updated retake questions:", {
            previousLength: prev.length,
            newLength: newRetakeQuestions.length
          });
          return newRetakeQuestions;
        });
      }

      // Check if this will be the last question
      if (newMasteredCount === totalQuestions) {
        // Instead of immediately completing, first check if there are any retake questions left
        // after removing the current one from the retake list if applicable
        setMasteredCount(newMasteredCount);
        
        // Wait a moment for retakeQuestions state to update before checking
        setTimeout(() => {
          if (retakeQuestions.length === 0) {
            console.log("Final question mastered and no retakes remain, completing game");
            handleGameComplete();
            return;
          } else {
            console.log("Final question mastered but retake questions exist, continuing to retake mode");
            handleNextQuestion();
          }
        }, 10);
        return;
      }

      // If not the last question, update count and continue
      setMasteredCount(newMasteredCount);
    }
    
    handleNextQuestion();
  };

  const handleUnmastered = () => {
    // Check if the current question is already in the retake list
    const isAlreadyInRetakeList = retakeQuestions.some(q => 
      q.question === currentQuestion.question && 
      q.correctAnswer === currentQuestion.correctAnswer
    );
    
    // Add to retake list first (before any navigation logic) if not already there
    if (!isAlreadyInRetakeList) {
      // Increment unmastered count
      setUnmasteredCount((prev) => prev + 1);
      
      // Add the current question to retake list
      setRetakeQuestions(prev => {
        const newRetakeQuestions = [...prev, currentQuestion];
        console.log(`Added question to retake list. New count: ${newRetakeQuestions.length}`);
        return newRetakeQuestions;
      });
    } else {
      console.log("Question already in retake list, not incrementing unmastered count");
    }
    
    // For the last question case, we need to force retake mode if this is the last question
    if (questionIndex === (aiQuestions?.length || 0) - 1) {
      console.log("Last question marked for retake - ensuring we stay in retake mode");
      
      // Force retake mode if not already in it
      if (!isInRetakeMode) {
        setIsInRetakeMode(true);
        setRetakePhase(1);
        setQuestionIndex(0);
        resetQuestionState();
        return; // Skip handleNextQuestion since we're explicitly navigating
      }
    }
    
    // Now proceed with navigation
    handleNextQuestion();
  };

  const getButtonStyle = (option: string) => {
    if (!showResult) {
      return "border-2 border-gray-600";
    }

    // Handle true/false questions differently
    if (currentQuestion?.type === "true-false") {
      const normalizedOption = String(option).toLowerCase();
      const normalizedAnswer = String(currentQuestion.correctAnswer).toLowerCase();
      
      if (normalizedOption === normalizedAnswer) {
        return "border-2 border-[#6DBE45] bg-[#16251C]";
      }
      return "border-2 border-[#FF3B3F] bg-[#39101B]";
    }

    // Handle other question types
    if (option?.toLowerCase() === currentQuestion?.correctAnswer?.toLowerCase()) {
      return "border-2 border-[#6DBE45] bg-[#16251C]";
    }
    return "border-2 border-[#FF3B3F] bg-[#39101B]";
  };

  // Add a computed value for retake questions count that includes both initial and new retakes
  const retakeQuestionsCount = retakeQuestions.length;

  return {
    currentQuestion,
    isFlipped,
    selectedAnswer,
    showResult,
    showNextButton,
    correctCount,
    incorrectCount,
    questionTimer,
    timerProgress,
    inputAnswer,
    currentStreak,
    highestStreak,
    timeLimit,
    masteredCount,
    unmasteredCount,
    isCorrect,
    isInRetakeMode,
    retakeQuestionsCount,
    retakePhase,
    isTransitioning,
    handleFlip: () => setIsFlipped(!isFlipped),
    handleAnswerSubmit,
    handleNextQuestion,
    getButtonStyle,
    setInputAnswer,
    handleMastered,
    handleUnmastered,
    handleRevealAnswer,
    cardDisabled: showResult,
  };
};

export interface Question {
  id: string;
  question: string;
  questionType: string;
  options?: { [key: string]: string };
  type: string;
  answer: string;
}
