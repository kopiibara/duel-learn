import React from "react";
import { formatTime } from "./utils";

export interface TimerProps {
    timeLeft: number;
    currentQuestion: number;
    totalQuestions: number;
}

/**
 * QuestionTimer component displays the countdown timer and question progress
 */
const QuestionTimer: React.FC<TimerProps> = ({
    timeLeft,
    currentQuestion,
    totalQuestions
}) => (
    <div className="flex flex-col items-center min-w-[100px] sm:min-w-[120px] lg:min-w-[140px]">
        <div className="text-white text-lg sm:text-xl lg:text-2xl font-bold">
            {formatTime(timeLeft)}
        </div>
        <div className="text-gray-400 text-[10px] sm:text-xs">
            QUESTION {currentQuestion} out of {totalQuestions}
        </div>
    </div>
);

export default QuestionTimer; 