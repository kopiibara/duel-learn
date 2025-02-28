import React from 'react';
import clockTimePressured from "../../../../../assets/clockTimePressured.png";

interface TimerProps {
    timeRemaining: number | null;
    progress: number;
    onCriticalTime?: (isCritical: boolean) => void;
    timeLimit: number;
}

const Timer: React.FC<TimerProps> = ({ timeRemaining, progress, onCriticalTime, timeLimit }) => {
    if (timeRemaining === null) return null;

    const isCriticalTime = timeRemaining <= timeLimit / 2;
    const isUrgentTime = timeRemaining <= 3;

    React.useEffect(() => {
        onCriticalTime?.(isCriticalTime);
    }, [isCriticalTime, onCriticalTime]);

    return (
        <div className="fixed bottom-0 left-0 w-full">
            <div className="absolute left-12 bottom-8 flex items-center gap-2">
                <img src={clockTimePressured} alt="Timer" className="w-6 h-6" />
                <div className={`text-2xl font-bold ${timeRemaining <= timeLimit / 2 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {Math.ceil(timeRemaining)}s
                </div>
            </div>

            <div className="w-full h-2 bg-gray-700">
                <div
                    className={`h-full ${timeRemaining <= timeLimit / 2 ? 'bg-red-500' : 'bg-[#fff]'}`}
                    style={{
                        width: `${progress}%`,
                        transition: progress === 100 ? 'none' : 'all 1s linear'
                    }}
                />
            </div>
        </div>
    );
};

export default Timer; 