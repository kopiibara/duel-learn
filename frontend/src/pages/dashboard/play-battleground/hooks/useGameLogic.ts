import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameState } from "../types";
import { questionsData } from "../data/questions";

export const useGameLogic = ({
  mode,
  material,
  selectedTypes,
  timeLimit,
}: GameState) => {
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

  const navigate = useNavigate();

  // Filter questions based on mode and selected types
  const filteredQuestions = questionsData.filter(
    (question) =>
      question.mode.toLowerCase() === mode.toLowerCase() &&
      selectedTypes.includes(question.questionType)
  );

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;

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
    if (showResult) return;

    const isAnswerCorrect =
      answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
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

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setInputAnswer("");
        setShowResult(false);
        setShowNextButton(false);
      }, 300);
    } else {
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
    if (option === currentQuestion.correctAnswer) {
      return "border-[#52A647] border-2";
    }
    if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
      return "border-[#FF3B3F] border-2";
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
  };
};
