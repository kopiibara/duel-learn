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
  const [remainingQuestions, setRemainingQuestions] = useState<any[]>([]);

  const navigate = useNavigate();

  // Initialize remaining questions when aiQuestions are received
  useEffect(() => {
    if (aiQuestions && aiQuestions.length > 0) {
      setRemainingQuestions(aiQuestions);
      setQuestionIndex(0);
    }
  }, [aiQuestions]);

  // Handle question updates
  useEffect(() => {
    if (remainingQuestions.length > 0 && questionIndex < remainingQuestions.length) {
      const question = remainingQuestions[questionIndex];
      console.log(`Processing question ${questionIndex + 1} of ${remainingQuestions.length}`);
      
      if (!question) {
        console.error(`No question found at index ${questionIndex}`);
        return;
      }

      console.log("Current question data:", question);
      
      // For multiple choice, extract answer from format like "D. AI"
      let displayAnswer = question.answer;
      if (question.type === 'multiple-choice' && question.answer && question.answer.includes('. ')) {
        const parts = question.answer.split('. ');
        displayAnswer = parts[1] || parts[0];
      }

      const processedQuestion = {
        questionType: question.type,
        type: question.type,
        question: question.question || "Question loading...",
        correctAnswer: displayAnswer || "Answer loading...",
        options: question.type === 'multiple-choice' && question.options ? 
          Object.values(question.options) : 
          undefined,
        rawOptions: question.options,
        answer: question.answer
      };

      console.log("Processed question for UI:", processedQuestion);
      setCurrentQuestion(processedQuestion);
    } else if (remainingQuestions.length > 0 && questionIndex >= remainingQuestions.length) {
      // All questions have been answered, navigate to summary
      handleGameComplete();
    }
  }, [remainingQuestions, questionIndex]);

  const handleNextQuestion = () => {
    if (questionIndex < remainingQuestions.length - 1) {
      setIsFlipped(false);
      setSelectedAnswer(null);
      setInputAnswer("");
      setShowResult(false);
      setShowNextButton(false);
      setQuestionIndex(prev => prev + 1);
    } else {
      handleGameComplete();
    }
  };

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

    let isAnswerCorrect = false;
    
    if (currentQuestion.type === 'multiple-choice') {
      // For multiple choice, find the letter prefix from the correct answer
      const correctAnswerParts = currentQuestion.answer.split('. ');
      const correctLetter = correctAnswerParts[0];
      
      // Get the selected option's letter based on the answer
      const selectedLetter = Object.entries(currentQuestion.rawOptions || {})
        .find(([_, value]) => value === answer)?.[0];
        
      console.log('Answer check:', { correctLetter, selectedLetter, answer });
      isAnswerCorrect = selectedLetter === correctLetter;
    } else if (currentQuestion.type === 'true-false') {
      // For true-false, normalize both answers and detect various forms of true/false
      const normalizedUserAnswer = answer.toLowerCase().trim();
      const normalizedCorrectAnswer = currentQuestion.answer.toLowerCase().trim();
      
      console.log('True-False answer check:', { 
        userAnswer: normalizedUserAnswer, 
        correctAnswer: normalizedCorrectAnswer,
        exactMatch: normalizedUserAnswer === normalizedCorrectAnswer
      });
      
      // Check for exact match or if both are some form of true/false
      if (normalizedUserAnswer === normalizedCorrectAnswer) {
        isAnswerCorrect = true;
      } else {
        // Check various forms of "true"/"false" responses
        const trueValues = ['true', 't', 'yes', 'y', '1'];
        const falseValues = ['false', 'f', 'no', 'n', '0'];
        
        const userAnswerIsTruthy = trueValues.includes(normalizedUserAnswer);
        const userAnswerIsFalsy = falseValues.includes(normalizedUserAnswer);
        const correctAnswerIsTruthy = trueValues.includes(normalizedCorrectAnswer);
        const correctAnswerIsFalsy = falseValues.includes(normalizedCorrectAnswer);
        
        isAnswerCorrect = (userAnswerIsTruthy && correctAnswerIsTruthy) || 
                           (userAnswerIsFalsy && correctAnswerIsFalsy);
      }
    } else {
      // For other types (like identification)
      isAnswerCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    }

    // Store the correctness in the question object for reference
    currentQuestion.isCorrect = isAnswerCorrect;
    
    setIsCorrect(isAnswerCorrect);

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
      setUnmasteredCount((prev) => prev + 1);
      setCurrentStreak(0);
      setShowNextButton(true);
    }

    setSelectedAnswer(answer);
    setIsFlipped(true);
    setShowResult(true);
    setShowNextButton(true);
  };

  // Handle revealing the answer (user gives up)
  const handleRevealAnswer = () => {
    if (showResult) return; // Don't process if already showing result
    
    console.log("User revealed answer without attempting a solution");
    
    // Mark as incorrect and reveal the answer
    setIsCorrect(false);
    setIncorrectCount(prev => prev + 1);
    setCurrentStreak(0);
    setShowResult(true);
    setShowNextButton(true);
    setIsFlipped(true);
  };

  const handleGameComplete = () => {
    const endTime = new Date();
    const timeDiff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(timeDiff / 60000);
    const seconds = Math.floor((timeDiff % 60000) / 1000);
    const timeSpent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    console.log("Game Complete:", {
      timeSpent,
      correctCount,
      incorrectCount,
      mode,
      material,
    });

    console.log("Highest Streak before navigating:", highestStreak);

    navigate("/dashboard/study/session-summary", {
      state: {
        timeSpent,
        correctCount,
        incorrectCount,
        mode,
        material,
        highestStreak,
        masteredCount,
        unmasteredCount,
      },
    });
  };

  const handleMastered = () => {
    setMasteredCount((prev) => prev + 1);
    handleNextQuestion();
  };

  const handleUnmastered = () => {
    setUnmasteredCount((prev) => prev + 1);
    handleNextQuestion();
  };

  const getButtonStyle = (option: string) => {
    if (!showResult) {
      return `border ${
        selectedAnswer === option
          ? "border-[#4D18E8] border-2"
          : "border-gray-800"
      }`;
    }
    
    if (currentQuestion.type === 'true-false') {
      // Case-insensitive comparison for true-false
      const normalizedOption = option.toLowerCase().trim();
      const normalizedCorrectAnswer = currentQuestion.answer.toLowerCase().trim();
      
      if (normalizedOption === normalizedCorrectAnswer) {
        return "border-[#52A647] border-2"; // Green border for correct answer
      }
      
      if (option === selectedAnswer && normalizedOption !== normalizedCorrectAnswer) {
        return "border-[#FF3B3F] border-2"; // Red border for incorrect selected answer
      }
    } else {
      // Regular comparison for other question types
      if (option === currentQuestion.correctAnswer) {
        return "border-[#52A647] border-2";
      }
      
      if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
        return "border-[#FF3B3F] border-2";
      }
    }
    
    return "border border-gray-800";
  };

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
