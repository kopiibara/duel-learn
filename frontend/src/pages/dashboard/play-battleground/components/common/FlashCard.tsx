import React from 'react';

interface FlashCardProps {
    question: string;
    correctAnswer: string;
    isFlipped: boolean;
    onFlip: () => void;
    type?: string;
}

const FlashCard: React.FC<FlashCardProps> = ({
    question,
    correctAnswer,
    isFlipped,
    onFlip,
    type = 'multiple-choice'
}) => {
    return (
        <div
            className={`relative w-full h-64 cursor-pointer perspective-1000`}
            onClick={onFlip}
        >
            <div
                className={`relative w-full h-full duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
                    }`}
            >
                {/* Front of card (Question) */}
                <div
                    className={`absolute w-full h-full backface-hidden bg-white border-2 border-purple-600 rounded-lg p-6 flex flex-col items-center justify-center ${isFlipped ? 'hidden' : ''
                        }`}
                >
                    <div className="text-sm text-purple-600 mb-2">{type}</div>
                    <div className="text-xl text-center font-semibold">{question}</div>
                    <div className="mt-4 text-sm text-gray-500">Click to flip</div>
                </div>

                {/* Back of card (Answer) */}
                <div
                    className={`absolute w-full h-full backface-hidden bg-purple-600 text-white rounded-lg p-6 flex flex-col items-center justify-center rotate-y-180 ${!isFlipped ? 'hidden' : ''
                        }`}
                >
                    <div className="text-sm mb-2">Answer</div>
                    <div className="text-xl text-center font-semibold">{correctAnswer}</div>
                    <div className="mt-4 text-sm opacity-75">Click to flip back</div>
                </div>
            </div>
        </div>
    );
};

export default FlashCard;