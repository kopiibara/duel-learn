import React from 'react';
import clockTimePressured from "../../../../../assets/clockTimePressured.png";

interface TimerProps {
    timeRemaining: number | null;
    progress: number;
}

const Timer: React.FC<TimerProps> = ({ timeRemaining, progress }) => {
    if (timeRemaining === null) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full">
            <div className="absolute left-12 bottom-8 flex items-center gap-2">
                <img src={clockTimePressured} alt="Timer" className="w-6 h-6" />
                <div className={`text-2xl font-bold ${timeRemaining <= 7 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timeRemaining}s
                </div>
            </div>

            <div className="w-full h-2 bg-gray-700">
                <div
                    className={`h-full transition-all duration-1000 ${timeRemaining <= 7 ? 'bg-red-500' : 'bg-[#fff]'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default Timer; 