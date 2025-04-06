import React, { memo, useState, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface FlashCardProps {
    question: string;
    correctAnswer: string;
    isFlipped: boolean;
    onFlip: () => void;
    onReveal?: () => void;
    timeRemaining?: number | null;
    type?: 'multiple-choice' | 'identification' | 'true-false';
    disabled?: boolean;
    image?: string | null;
    currentQuestion: {
        itemInfo?: {
            image?: string | null;
            term?: string;
            definition?: string;
            itemId?: number;
        };
        correctAnswer?: string;
    } | null;
    isTransitioning?: boolean;
}

const FlashCard: React.FC<FlashCardProps> = memo(({ 
    question, 
    correctAnswer, 
    isFlipped, 
    onFlip,
    onReveal,
    timeRemaining,
    type,
    disabled = false,
    currentQuestion,
    isTransitioning = false
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Get image URL from currentQuestion.itemInfo and validate it's not null/undefined
    const imageUrl = currentQuestion?.itemInfo?.image || null;
    const hasValidImage = imageUrl && imageUrl !== 'null' && !imageUrl.includes('undefined');

    // Debug logging
    useEffect(() => {
        console.log("FlashCard mounted with props:", {
            hasValidImage,
            imageUrl,
            currentQuestion,
            itemInfo: currentQuestion?.itemInfo,
            correctAnswer,
            isFlipped
        });
    }, [hasValidImage, imageUrl, currentQuestion, correctAnswer, isFlipped]);

    // Add image loading debug
    console.log("Image render debug:", {
        imageUrl,
        imageLoaded,
        imageError,
        currentQuestion: currentQuestion?.itemInfo,
        hasImage: Boolean(imageUrl),
        fullQuestion: currentQuestion,
        correctAnswer,
        isFlipped
    });

    return (
        <div
            className={`w-full max-w-[900px] h-[380px] mt-[-60px] bg-white rounded-lg p-8 relative ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
            onClick={() => !disabled && onFlip && onFlip()}
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
                {/* Only render image section if we have a valid image */}
                {hasValidImage && (
                    <div className="w-full h-[50%] mb-4 relative flex items-center justify-center">
                        {!imageLoaded && !imageError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                <span className="text-gray-400">Loading image...</span>
                            </div>
                        )}
                        <img 
                            src={imageUrl}
                            alt="Question visual"
                            className={`w-full h-full object-contain rounded-lg transition-opacity duration-300 ${
                                imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoad={() => {
                                console.log("Image loaded successfully:", imageUrl);
                                setImageLoaded(true);
                                setImageError(false);
                            }}
                            onError={(e) => {
                                console.error("Image failed to load:", imageUrl, e);
                                setImageError(true);
                                setImageLoaded(false);
                            }}
                        />
                        {imageError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                <span className="text-gray-400">Failed to load image</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Question Section - adjust height based on whether we have an image */}
                <div className={`flex-1 flex items-center justify-center ${hasValidImage ? 'h-[45%]' : 'h-full'}`}>
                    <p className="text-center text-black text-2xl max-w-[600px]">
                        {question || <span className="animate-pulse">Loading question...</span>}
                    </p>
                </div>

                {/* Reveal Button */}
                <button 
                    className="absolute bottom-6 right-9 flex items-center space-x-2 text-[#4D18E8] hover:text-[#4D18E8] transition-all duration-200 ease-in-out hover:scale-105 hover:font-bold transform"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onReveal && !disabled) {
                            onReveal();
                        }
                    }}
                    disabled={disabled}
                >
                    <VisibilityIcon className="w-5 h-5 text-[#4D18E8]" />
                    <span className="text-sm font-bold text-[#4D18E8]">
                        {disabled ? "ANSWER REVEALED" : "REVEAL ANSWER"}
                    </span>
                </button>
            </div>

            {/* Back of card (Answer) */}
            <div
                className="absolute inset-0 backface-hidden flex items-center justify-center bg-white rounded-lg"
                style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    transition: "opacity 0.3s",
                    opacity: isFlipped && !isTransitioning ? 1 : 0,
                    display: isTransitioning ? 'none' : 'flex'
                }}
            >
                <p className="text-center text-black text-3xl font-bold">
                    {correctAnswer || <span className="animate-pulse">Loading answer...</span>}
                </p>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Update memo comparison to include currentQuestion, correctAnswer, and isTransitioning
    return (
        prevProps.question === nextProps.question &&
        prevProps.correctAnswer === nextProps.correctAnswer &&
        prevProps.isFlipped === nextProps.isFlipped &&
        prevProps.timeRemaining === nextProps.timeRemaining &&
        prevProps.disabled === nextProps.disabled &&
        prevProps.image === nextProps.image &&
        prevProps.currentQuestion?.itemInfo?.image === nextProps.currentQuestion?.itemInfo?.image &&
        prevProps.currentQuestion?.correctAnswer === nextProps.currentQuestion?.correctAnswer &&
        prevProps.isTransitioning === nextProps.isTransitioning
    );
});

export default FlashCard;