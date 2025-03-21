import { formatTime } from "./formatTime";

interface QuestionTimerProps {
    timeLeft: number;
    currentQuestion: number;
    totalQuestions: number;
}

export default function QuestionTimer({
    timeLeft,
    currentQuestion,
    totalQuestions,
}: QuestionTimerProps) {
    // Format the time as MM:SS
    const formattedTime = formatTime(timeLeft);

    return (
        <div className="flex flex-col items-center">
            <div className={`text-white text-xl sm:text-2xl font-bold ${timeLeft <= 10 ? "text-red-500" : ""}`}>
                {formattedTime}
            </div>
            <div className="text-white/70 text-xs sm:text-sm uppercase tracking-wide mt-1">
                QUESTION {currentQuestion} out of {totalQuestions}
            </div>
        </div>
    );
} 