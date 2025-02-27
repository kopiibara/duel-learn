import React from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface FlashCardProps {
    question: string;
    correctAnswer: string;
    isFlipped: boolean;
    onFlip: () => void;
    timeRemaining?: number | null;
}

const FlashCard: React.FC<FlashCardProps> = ({ question, correctAnswer, isFlipped, onFlip }) => {
    return (
        <div
            className="w-full max-w-[900px] h-[380px] mt-[-60px] bg-white rounded-lg p-8 cursor-pointer relative"
            onClick={onFlip}
            style={{
                perspective: "1000px",
                transformStyle: "preserve-3d",
                transition: "transform 0.6s",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
        >
            {/* Front of card (Question) */}
            <div
                className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-white rounded-lg"
                style={{
                    backfaceVisibility: "hidden",
                    transition: "opacity 0.3s",
                    opacity: isFlipped ? 0 : 1
                }}
            >
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-center text-black text-2xl max-w-[600px]">
                        {question}
                    </p>
                </div>

                <button className="absolute bottom-6 right-9 flex items-center space-x-2 text-[#4D18E8] hover:text-[#4D18E8] transition-all duration-200 ease-in-out hover:scale-105 hover:font-bold transform">
                    <VisibilityIcon className="w-5 h-5 text-[#4D18E8]" />
                    <span className="text-sm font-bold text-[#4D18E8]">REVEAL ANSWER</span>
                </button>
            </div>

            {/* Back of card (Answer) */}
            <div
                className="absolute inset-0 backface-hidden flex items-center justify-center bg-white rounded-lg"
                style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    transition: "opacity 0.3s",
                    opacity: isFlipped ? 1 : 0
                }}
            >
                <p className="text-center text-black text-3xl font-bold">
                    {correctAnswer}
                </p>
            </div>
        </div>
    );
};

export default FlashCard; 