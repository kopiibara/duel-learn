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

  useEffect(() => {
    if (aiQuestions && aiQuestions.length > 0) {
      console.log(`Processing AI question at index ${questionIndex} of ${aiQuestions.length}`);
      const question = aiQuestions[questionIndex];
      
      // Check if question exists at this index
      if (!question) {
        console.error(`No question found at index ${questionIndex}`);
        return;
      }

      console.log("Raw question data from API:", question);
      console.log("Question type:", question.type);
      console.log("Question text:", question.question);
      console.log("Question answer:", question.answer);
      
      if (question.type === 'multiple-choice') {
        console.log("Multiple choice options:", question.options);
        
        // Log the options as an array to confirm format
        if (question.options) {
          console.log("Options as array:", Object.values(question.options));
        }
      }

      // For multiple choice, extract answer from format like "D. AI"
      let displayAnswer = question.answer;
      if (question.type === 'multiple-choice' && question.answer && question.answer.includes('. ')) {
        const parts = question.answer.split('. ');
        displayAnswer = parts[1] || parts[0]; // Fallback to full answer if no split
        console.log("Extracted display answer:", displayAnswer);
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
    } else {
      console.log("No AI questions available or empty array");
    }
  }, [aiQuestions, questionIndex]);

  // Update the isLastQuestion logic to check for AI questions
  const isLastQuestion = aiQuestions 
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

    const isAnswerCorrect = answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
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
      setUnmasteredCount((prev) => prev + 1);
      setCurrentStreak(0);
      setShowNextButton(true);
    }

    setSelectedAnswer(answer);
    setIsFlipped(true);
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

  const handleNextQuestion = () => {
    if (aiQuestions && questionIndex < aiQuestions.length - 1) {
      // If we have more AI questions, increment the index
      setQuestionIndex(prev => prev + 1);
      
      // Reset UI state for next question
      setIsFlipped(false);
      setSelectedAnswer(null);
      setInputAnswer("");
      setShowResult(false);
      setShowNextButton(false);
    } else if (!aiQuestions && !isLastQuestion) {
      // Handle regular (non-AI) questions
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setInputAnswer("");
        setShowResult(false);
        setShowNextButton(false);
      }, 300);
    } else {
      // This is the last question, complete the game
      console.log("All questions answered, completing game");
      handleGameComplete();
    }
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
      questionsAnswered: aiQuestions ? questionIndex + 1 : currentQuestionIndex + 1,
      totalQuestions: aiQuestions ? aiQuestions.length : filteredQuestions.length
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
        aiQuestions: aiQuestions || [], // Pass the questions to the summary
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
    handleRevealAnswer, // New function to reveal answer and mark as wrong
    cardDisabled: showResult, // Pass whether the card should be disabled
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
