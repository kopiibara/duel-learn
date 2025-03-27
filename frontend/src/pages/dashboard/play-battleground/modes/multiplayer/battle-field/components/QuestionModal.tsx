import React, { useState, useEffect } from 'react';
import BattleFlashCard from './BattleFlashCard';
import { questionsData } from '../../../../data/questions';

interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAnswerSubmit: (isCorrect: boolean) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
    isOpen,
    onClose,
    onAnswerSubmit,
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [usedQuestionIndices, setUsedQuestionIndices] = useState<number[]>([]);
    const [questionHistory, setQuestionHistory] = useState<Array<{
        question: string;
        answer: string;
        wasCorrect: boolean;
    }>>([]);

    // Function to get a random unused question
    const getRandomUnusedQuestion = () => {
        if (usedQuestionIndices.length === questionsData.length) {
            console.log('All questions have been used, resetting...');
            setUsedQuestionIndices([]);
            return questionsData[0];
        }

        const availableIndices = questionsData
            .map((_, index) => index)
            .filter(index => !usedQuestionIndices.includes(index));

        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        setUsedQuestionIndices(prev => [...prev, randomIndex]);

        return questionsData[randomIndex];
    };

    useEffect(() => {
        if (isOpen) {
            setIsFlipped(false);
            setHasAnswered(false);
            setShowResult(false);
            const newQuestion = getRandomUnusedQuestion();
            setCurrentQuestion(newQuestion);
        }
    }, [isOpen]);

    const handleAnswerSubmit = (answer: string) => {
        if (!currentQuestion) return;

        const answerCorrect = answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        setIsCorrect(answerCorrect);
        setHasAnswered(true);
        setShowResult(true);

        setQuestionHistory(prev => [...prev, {
            question: currentQuestion.question,
            answer: answer,
            wasCorrect: answerCorrect
        }]);

        // Wait for 1.5 seconds to show the result overlay
        setTimeout(() => {
            onAnswerSubmit(answerCorrect);
            onClose();
        }, 1500);
    };

    if (!isOpen || !currentQuestion) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="p-8 rounded-lg max-w-3xl w-full mx-4 relative">
                {/* Question Counter */}
                <div className="mb-4 text-sm text-gray-600">
                    Question {usedQuestionIndices.length} of {questionsData.length}
                </div>

                <BattleFlashCard
                    question={currentQuestion.question}
                    correctAnswer={currentQuestion.correctAnswer}
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped(!isFlipped)}
                    type={currentQuestion.questionType}
                    disabled={hasAnswered}
                    onReveal={() => setIsFlipped(true)}
                />

                {/* Answer buttons */}
                <div className="mt-8 flex justify-center gap-4">
                    {currentQuestion.options ? (
                        // Multiple choice or true/false
                        <div className="flex flex-wrap justify-center gap-4">
                            {currentQuestion.options.map((option: string, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSubmit(option)}
                                    disabled={hasAnswered}
                                    className={`px-6 py-3 rounded-lg ${hasAnswered
                                        ? option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                                            ? 'bg-green-500 text-white'
                                            : 'bg-red-500 text-white'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    ) : (
                        // Identification
                        <div className="w-full max-w-md">
                            <input
                                type="text"
                                placeholder="Type your answer..."
                                className="w-full px-4 py-2 border rounded-lg"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !hasAnswered) {
                                        handleAnswerSubmit((e.target as HTMLInputElement).value);
                                    }
                                }}
                                disabled={hasAnswered}
                            />
                            <button
                                onClick={(e) => handleAnswerSubmit((e.currentTarget.previousElementSibling as HTMLInputElement).value)}
                                disabled={hasAnswered}
                                className="mt-4 w-full px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                            >
                                Submit Answer
                            </button>
                        </div>
                    )}
                </div>

                {/* Result Overlay */}
                {showResult && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                        <div className={`text-6xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'} animate-bounce`}>
                            {isCorrect ? 'CORRECT!!!' : 'WRONG!!!'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionModal; 