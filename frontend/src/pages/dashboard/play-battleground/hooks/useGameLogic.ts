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
  const [seenQuestions, setSeenQuestions] = useState<Set<string>>(new Set()); // Track seen questions to prevent duplicates
  const [processedQuestionIds, setProcessedQuestionIds] = useState<Set<string>>(new Set()); // Track which questions have been processed
  const [questionDisplayOrder, setQuestionDisplayOrder] = useState<string[]>([]); // Track the order of questions to display
  const [lastProcessedQuestionId, setLastProcessedQuestionId] = useState<string | null>(null); // Track the last processed question ID
  const [uniqueQuestionIds, setUniqueQuestionIds] = useState<Set<string>>(new Set());
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);

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

  // Add a function to initialize the question display order
  useEffect(() => {
    if (aiQuestions && aiQuestions.length > 0 && questionDisplayOrder.length === 0) {
      console.log("Initializing question display order");
      
      // Create a unique ID for each question
      const questionIds = aiQuestions.map((q, index) => {
        const questionId = `${q.question}-${q.answer || (q as any).correctAnswer}`;
        return questionId;
      });
      
      // Shuffle the question IDs to randomize the order
      const shuffledIds = [...questionIds].sort(() => Math.random() - 0.5);
      
      console.log(`Created display order with ${shuffledIds.length} questions`);
      setQuestionDisplayOrder(shuffledIds);
    }
  }, [aiQuestions, questionDisplayOrder.length]);

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

  // Modify the useEffect that processes questions
  useEffect(() => {
    if (!aiQuestions || aiQuestions.length === 0 || isTransitioning) return;

    // Skip processing if showing results or transitioning
    if (showResult) {
      console.log("Not updating current question - showing results");
      return;
    }

    const processCurrentQuestion = () => {
      let questionToProcess: any = null;
      let newQuestionId: string | null = null;

      const findNextUnmasteredQuestion = (startIndex: number, questions: any[], isRetake: boolean) => {
        let index = startIndex;
        const maxLength = isRetake ? retakeQuestions.length : questionDisplayOrder.length;

        while (index < maxLength) {
          const currentQuestion = isRetake ? questions[index] : 
            aiQuestions.find(q => {
              const qId = `${q.question}-${q.answer || q.correctAnswer}`;
              return qId === questionDisplayOrder[index];
            });

          if (currentQuestion) {
            const qId = `${currentQuestion.question}-${currentQuestion.correctAnswer || currentQuestion.answer}`;
            if (!masteredQuestions.includes(qId)) {
              return { question: currentQuestion, index };
            }
          }
          index++;
        }
        return null;
      };

      if (isInRetakeMode && retakeQuestions.length > 0) {
        const result = findNextUnmasteredQuestion(questionIndex, retakeQuestions, true);
        if (result) {
          questionToProcess = result.question;
          if (result.index !== questionIndex) {
            setQuestionIndex(result.index);
          }
          newQuestionId = `${questionToProcess.question}-${questionToProcess.correctAnswer}`;
        }
      } else {
        const result = findNextUnmasteredQuestion(questionIndex, [], false);
        if (result) {
          questionToProcess = result.question;
          if (result.index !== questionIndex) {
            setQuestionIndex(result.index);
          }
          newQuestionId = `${questionToProcess.question}-${questionToProcess.correctAnswer}`;
        }
      }

      // If no unmastered question found at or after current index, handle completion or mode switch
      if (!questionToProcess) {
        if (isInRetakeMode) {
          // If in retake mode and no questions found, clean up retake list
          setRetakeQuestions(prev => prev.filter(q => {
            const qId = `${q.question}-${q.correctAnswer}`;
            return !masteredQuestions.includes(qId);
          }));
          
          // If no more retake questions, check if all items are mastered
          if (masteredCount >= (material?.items?.length || 0)) {
            handleGameComplete();
          } else {
            // Switch back to normal mode if there are still unmastered questions
            setIsInRetakeMode(false);
            setQuestionIndex(0);
          }
        } else {
          // In normal mode, check if we should switch to retake mode
          const remainingRetakes = retakeQuestions.filter(q => {
            const qId = `${q.question}-${q.correctAnswer}`;
            return !masteredQuestions.includes(qId);
          });

          if (remainingRetakes.length > 0) {
            setIsInRetakeMode(true);
            setRetakeQuestions(remainingRetakes);
            setQuestionIndex(0);
          } else if (masteredCount >= (material?.items?.length || 0)) {
            handleGameComplete();
          } else {
            // Reset to beginning if there are still unmastered questions
            setQuestionIndex(0);
          }
        }
        return;
      }

      // Process the found question
      if (questionToProcess && newQuestionId !== currentQuestionId) {
        const processedQuestion = processQuestion(questionToProcess);
        setCurrentQuestion(processedQuestion);
        if (newQuestionId) {
          setCurrentQuestionId(newQuestionId);
          setProcessedQuestionIds(prev => new Set(prev).add(newQuestionId));
          setUniqueQuestionIds(prev => {
            const newSet = new Set(prev);
            newSet.add(newQuestionId);
            return newSet;
          });
        }
        setIsQuestionInitiallyLoaded(true);
      }
    };

    processCurrentQuestion();
  }, [
    aiQuestions,
    questionIndex,
    isInRetakeMode,
    retakeQuestions,
    showResult,
    isTransitioning,
    questionDisplayOrder,
    masteredQuestions,
    currentQuestionId,
    material?.items?.length,
    masteredCount
  ]);

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
    } else {
      setIncorrectCount((prev) => prev + 1);
      setCurrentStreak(0);
      setShowNextButton(true);

      // Automatically mark incorrect answers as unmastered
      const questionId = `${currentQuestion.question}-${currentQuestion.correctAnswer}`;
      
      // Remove from mastered list if it was there
      if (masteredQuestions.includes(questionId)) {
        setMasteredQuestions(prev => prev.filter(id => id !== questionId));
        setMasteredCount(prev => Math.max(0, prev - 1));
      }

      // Add to retake list if not already there
      const isAlreadyInRetakeList = retakeQuestions.some(q => 
        q.question === currentQuestion.question && 
        q.correctAnswer === currentQuestion.correctAnswer
      );

      if (!isAlreadyInRetakeList) {
        setUnmasteredCount(prev => prev + 1);
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

  // Modify handleNextQuestion to use uniqueQuestionIds for tracking
  const handleNextQuestion = () => {
    // Prevent multiple rapid transitions
    if (isTransitioning) return;

    // Reset the current question tracking
    setCurrentQuestionId(null);
    setLastProcessedQuestionId(null);
    
    const totalItems = material?.items?.length || 0;
    
    // Check if all items are mastered
    if (masteredCount >= totalItems) {
      console.log("All items are mastered, ending game");
      handleGameComplete();
      return;
    }

    // Filter out mastered questions from retake list
    if (isInRetakeMode) {
      setRetakeQuestions(prev => prev.filter(q => {
        const questionId = `${q.question}-${q.correctAnswer}`;
        return !masteredQuestions.includes(questionId);
      }));
    }

    // Handle mode-specific transitions
    if (isInRetakeMode) {
      if (questionIndex < retakeQuestions.length - 1) {
        resetQuestionState();
      } else if (retakeQuestions.length > 0) {
        setRetakePhase(prev => prev + 1);
        resetQuestionState();
      } else {
        if (masteredCount >= totalItems) {
          handleGameComplete();
        } else {
          setIsInRetakeMode(false);
          resetQuestionState();
        }
      }
    } else {
      if (questionIndex < questionDisplayOrder.length - 1) {
        resetQuestionState();
      } else if (retakeQuestions.length > 0) {
        setIsInRetakeMode(true);
        setRetakePhase(1);
        resetQuestionState();
      } else {
        if (masteredCount >= totalItems) {
          handleGameComplete();
        } else {
          resetQuestionState();
        }
      }
    }
  };

  const resetQuestionState = () => {
    // First set transition state
    setIsTransitioning(true);
    
    // Wait briefly to ensure transition state is applied
    setTimeout(() => {
      // Reset all question-related states
      setIsFlipped(false);
      setSelectedAnswer(null);
      setInputAnswer("");
      setShowResult(false);
      setShowNextButton(false);
      setIsCorrect(null);
      setIsQuestionInitiallyLoaded(false);
      setCurrentQuestionId(null);
      
      // Update question index after states are reset
      if (isInRetakeMode) {
        if (questionIndex < retakeQuestions.length - 1) {
          setQuestionIndex(prev => prev + 1);
        } else {
          setQuestionIndex(0);
        }
      } else {
        if (questionIndex < questionDisplayOrder.length - 1) {
          setQuestionIndex(prev => prev + 1);
        } else {
          setQuestionIndex(0);
        }
      }

      // Remove transition state after a short delay
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 50);
  };

  const handleGameComplete = () => {
    const totalItems = material?.items?.length || 0;
    
    console.log("Final game completion check:", {
      masteredCount,
      totalItems,
      retakeQuestionsCount: retakeQuestions.length
    });

    // Double-check that we really should end the game
    if (masteredCount < totalItems) {
      console.log("Game completion prevented - not all items mastered yet");
      return;
    }

    if (retakeQuestions.length > 0) {
      console.log("Game completion prevented - still have questions in retake list");
      setIsInRetakeMode(true);
      setRetakePhase(prev => prev + 1);
      setQuestionIndex(0);
      resetQuestionState();
      return;
    }

    const endTime = new Date();
    const timeDiff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(timeDiff / 60000);
    const seconds = Math.floor((timeDiff % 60000) / 1000);
    const timeSpent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    navigate("/dashboard/study/session-summary", {
      state: {
        timeSpent,
        correctCount: totalItems,
        incorrectCount: 0,
        mode,
        material,
        highestStreak,
        masteredCount: totalItems,
        unmasteredCount: 0,
        totalQuestions: totalItems,
        aiQuestions: aiQuestions || [],
      },
    });
  };

  const handleMastered = () => {
    // Create a unique identifier for this question
    const questionId = `${currentQuestion.question}-${currentQuestion.correctAnswer}`;
    const totalItems = material?.items?.length || 0;
    
    console.log("Processing mastered question:", {
      questionId,
      currentMasteredCount: masteredCount,
      totalItems,
      retakeQuestionsCount: retakeQuestions.length
    });

    // Only increment mastered count if not already mastered
    if (!masteredQuestions.includes(questionId)) {
      // Add to mastered questions list
      setMasteredQuestions(prev => [...prev, questionId]);
      setMasteredCount(prev => prev + 1);

      // Immediately remove from retake list
      setRetakeQuestions(prev => prev.filter(q => {
        const currentId = `${q.question}-${q.correctAnswer}`;
        return currentId !== questionId;
      }));

      // Update unmastered count if it was in retake list
      if (retakeQuestions.some(q => {
        const currentId = `${q.question}-${q.correctAnswer}`;
        return currentId === questionId;
      })) {
        setUnmasteredCount(prev => Math.max(0, prev - 1));
      }

      // Check if this was the last item to master
      if (masteredCount + 1 >= totalItems) {
        console.log("Last item mastered, ending game");
        handleGameComplete();
        return;
      }
    }

    // Always move to next question after marking as mastered
    handleNextQuestion();
  };

  const handleUnmastered = () => {
    // Create a unique identifier for this question
    const questionId = `${currentQuestion.question}-${currentQuestion.correctAnswer}`;
    
    console.log("Marking question as unmastered:", {
      questionId,
      currentUnmasteredCount: unmasteredCount,
      isAlreadyInRetakeList: retakeQuestions.some(q => 
        q.question === currentQuestion.question && 
        q.correctAnswer === currentQuestion.correctAnswer
      )
    });

    // Remove from mastered list if it was there
    if (masteredQuestions.includes(questionId)) {
      setMasteredQuestions(prev => prev.filter(id => id !== questionId));
      setMasteredCount(prev => Math.max(0, prev - 1));
    }

    // Only add to retake list and increment unmastered if not already there
    const isAlreadyInRetakeList = retakeQuestions.some(q => 
      q.question === currentQuestion.question && 
      q.correctAnswer === currentQuestion.correctAnswer
    );

    if (!isAlreadyInRetakeList) {
      setUnmasteredCount(prev => prev + 1);
      setRetakeQuestions(prev => [...prev, currentQuestion]);
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
  correctAnswer?: string;
}
