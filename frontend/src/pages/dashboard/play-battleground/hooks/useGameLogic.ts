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
}

export const useGameLogic = ({
  mode,
  material,
  selectedTypes,
  timeLimit,
  aiQuestions,
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
    
    return {
      questionType: rawQuestion.questionType || rawQuestion.type,
      type: rawQuestion.type,
      question: rawQuestion.question,
      correctAnswer: correctAnswer, // Use the preserved answer
      answer: correctAnswer, // Keep both for compatibility
      options: rawQuestion.options,
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
      
      // If in retake mode, use retake questions array
      if (isInRetakeMode && retakeQuestions.length > 0) {
        const question = retakeQuestions[questionIndex];
        if (question) {
          console.log("Processing retake question:", question);
          const processedQuestion = processQuestion(question);
          console.log("Processed retake question:", processedQuestion);
          setCurrentQuestion(processedQuestion);
        }
      } else {
        // Normal mode - use regular questions
        const question = aiQuestions[questionIndex];
        if (question) {
          console.log("Processing regular question:", question);
          const processedQuestion = processQuestion(question);
          console.log("Processed regular question:", processedQuestion);
          setCurrentQuestion(processedQuestion);
        }
      }
    }
  }, [aiQuestions, questionIndex, isInRetakeMode, retakeQuestions, showResult]);

  // Update isLastQuestion to account for retake mode
  const isLastQuestion = isInRetakeMode 
    ? questionIndex === retakeQuestions.length - 1
    : aiQuestions 
      ? questionIndex === aiQuestions.length - 1
      : currentQuestionIndex === filteredQuestions.length - 1;

  // Timer logic for Time Pressured mode
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (mode === "Time Pressured" && timeLimit && !showResult) {
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
  }, [currentQuestionIndex, timeLimit, showResult, mode]);

  const handleAnswerSubmit = (answer: string) => {
    if (showResult || !currentQuestion) return;

    // Ensure we have a valid answer to compare against
    const correctAnswer = currentQuestion.correctAnswer || currentQuestion.answer;
    if (!correctAnswer) {
      console.error("No correct answer found for question:", currentQuestion);
      return;
    }

    const isAnswerCorrect = answer.toLowerCase() === correctAnswer.toLowerCase();
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
      
      // If in retake mode and answer is correct, remove from retake list
      if (isInRetakeMode) {
        setRetakeQuestions(prev => prev.filter(q => 
          q.question !== currentQuestion.question || 
          q.correctAnswer !== correctAnswer
        ));
      }
    } else {
      setIncorrectCount((prev) => prev + 1);
      setUnmasteredCount((prev) => prev + 1);
      setCurrentStreak(0);
      setShowNextButton(true);
      
      // Add incorrect question to retake list if not already there
      if (!retakeQuestions.some(q => 
        q.question === currentQuestion.question && 
        q.correctAnswer === correctAnswer
      )) {
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
    
    // Remove transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600); // Match the transition duration
  };

  const handleGameComplete = () => {
    const totalQuestions = aiQuestions?.length || 0;
    
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
    
    // Only increment mastered count if not already mastered
    if (!masteredQuestions.includes(questionId)) {
      // Calculate new mastered count
      const newMasteredCount = masteredCount + 1;
      
      console.log("Mastering question:", {
        currentMasteredCount: masteredCount,
        newMasteredCount,
        totalQuestions,
        questionId,
        retakeQuestionsLength: retakeQuestions.length
      });

      // Update mastered questions list first
      setMasteredQuestions(prev => [...prev, questionId]);
      
      // Remove from retake list if in retake mode
      if (isInRetakeMode) {
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
        console.log("Final question mastered, completing game");
        setMasteredCount(newMasteredCount);
        handleGameComplete();
        return;
      }

      // If not the last question, update count and continue
      setMasteredCount(newMasteredCount);
    }
    
    handleNextQuestion();
  };

  const handleUnmastered = () => {
    // Create a unique identifier for this question
    const questionId = `${currentQuestion.question}-${currentQuestion.correctAnswer}`;
    
    // Only increment unmastered count if not already in retake list
    if (!retakeQuestions.some(q => 
      q.question === currentQuestion.question && 
      q.correctAnswer === currentQuestion.correctAnswer
    )) {
      setUnmasteredCount((prev) => prev + 1);
    }
    
    // Add the current question to retake list if not already there
    if (!retakeQuestions.some(q => 
      q.question === currentQuestion.question && 
      q.correctAnswer === currentQuestion.correctAnswer
    )) {
      setRetakeQuestions(prev => {
        const newRetakeQuestions = [...prev, currentQuestion];
        console.log(`Added question to retake list. New count: ${newRetakeQuestions.length}`);
        return newRetakeQuestions;
      });
    }
    
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
        return "border-2 border-[#52A647] bg-[#16251C]";
      }
      return "border-2 border-[#FF3B3F] bg-[#39101B]";
    }

    // Handle other question types
    if (option?.toLowerCase() === currentQuestion?.correctAnswer?.toLowerCase()) {
      return "border-2 border-[#52A647] bg-[#16251C]";
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
