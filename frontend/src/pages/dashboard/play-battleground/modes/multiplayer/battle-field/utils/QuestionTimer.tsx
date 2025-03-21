import { formatTime } from "./formatTime";

interface QuestionTimerProps {
    timeLeft: number;
    currentQuestion: number;
    totalQuestions: number;
    difficultyMode?: string | null;
}

export default function QuestionTimer({
    timeLeft,
    currentQuestion,
    totalQuestions,
    difficultyMode
}: QuestionTimerProps) {
    // Format the time as MM:SS
    const formattedTime = formatTime(timeLeft);

    return (
        <div className="flex flex-col items-center">
            <div className={`text-white text-xl sm:text-2xl font-bold ${timeLeft <= 10 ? "text-red-500" : ""}`}>
                {formattedTime}
            </div>

            <div className="flex flex-col items-center">
                <div className="text-white/70 text-xs sm:text-sm uppercase tracking-wide mt-1">
                    QUESTION {currentQuestion} out of {totalQuestions}
                </div>

                {difficultyMode && (
                    <div className="mt-1 px-3 py-0.5 bg-purple-900/70 rounded-full text-white text-xs sm:text-sm font-medium">
                        Mode: {difficultyMode.charAt(0).toUpperCase() + difficultyMode.slice(1)}
                    </div>
                )}
            </div>
        </div>
    );
} 