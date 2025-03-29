import React, { useState, useEffect } from 'react';
import BattleFlashCard from './BattleFlashCard';
import { questionsData } from '../../../../data/questions';

interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAnswerSubmit: (isCorrect: boolean) => void;
    difficultyMode: string | null;
    questionTypes: string[];
}

const QuestionModal: React.FC<QuestionModalProps> = ({
    isOpen,
    onClose,
    onAnswerSubmit,
    difficultyMode,
    questionTypes
}) => {
    const [hasAnswered, setHasAnswered] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string>("");
    const [usedQuestionIndices, setUsedQuestionIndices] = useState<number[]>([]);
    const [questionHistory, setQuestionHistory] = useState<Array<{
        question: string;
        answer: string;
        wasCorrect: boolean;
    }>>([]);

    // Filter questions based on difficulty and question types
    const getFilteredQuestions = () => {
        return questionsData.filter(q => {
            // Check if question type is in allowed types
            const typeMatches = questionTypes.length === 0 ||
                questionTypes.includes(q.questionType);

            return typeMatches;
        });
    };

    // Function to get a random unused question
    const getRandomUnusedQuestion = () => {
        const filteredQuestions = getFilteredQuestions();

        if (filteredQuestions.length === 0) {
            console.error('No questions available for current difficulty and types');
            return null;
        }

        if (usedQuestionIndices.length === filteredQuestions.length) {
            console.log('All questions have been used, resetting...');
            setUsedQuestionIndices([]);
            return filteredQuestions[0];
        }

        const availableIndices = filteredQuestions
            .map((_, index) => index)
            .filter(index => !usedQuestionIndices.includes(index));

        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        setUsedQuestionIndices(prev => [...prev, randomIndex]);

        return filteredQuestions[randomIndex];
    };

    // Reset states when modal closes
    useEffect(() => {
        if (!isOpen) {
            setHasAnswered(false);
            setShowResult(false);
            setCurrentQuestion(null);
            setSelectedAnswer("");
        }
    }, [isOpen]);

    // Select a new question only when the modal opens
    useEffect(() => {
        if (isOpen && !currentQuestion) {
            const newQuestion = getRandomUnusedQuestion();
            if (newQuestion) {
                setCurrentQuestion(newQuestion);
            } else {
                console.error('Could not get a valid question');
                onClose();
            }
        }
    }, [isOpen]);

    const handleAnswerSubmit = (answer: string) => {
        if (!currentQuestion || hasAnswered) return;

        setSelectedAnswer(answer);
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

    const getButtonStyle = (option: string) => {
        if (!hasAnswered) {
            return 'text-white border-2 border-white-400 hover:border-green-300 transition-colors';
        }

        const isSelected = selectedAnswer.toLowerCase() === option.toLowerCase();
        const isCorrectAnswer = option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();

        if (isCorrectAnswer) {
            return 'bg-green-500 text-white border-2 border-green-600';
        }
        if (isSelected && !isCorrectAnswer) {
            return 'bg-red-500 text-white border-2 border-red-600';
        }
        return 'text-white border-2 border-gray-300 opacity-50';
    };

    if (!isOpen || !currentQuestion) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="p-8 rounded-lg max-w-4xl w-full mx-4 mt-10 relative flex flex-col items-center">
                {/* Question Counter */}
                <div className="mb-4 text-sm text-white">
                    Question {usedQuestionIndices.length} of {getFilteredQuestions().length}
                </div>

                <div className="w-full flex justify-center">
                    <BattleFlashCard
                        question={currentQuestion.question}
                        correctAnswer={currentQuestion.correctAnswer}
                        type={currentQuestion.questionType}
                        disabled={hasAnswered}
                    />
                </div>

                {/* Answer Section */}
                <div className="mt-9 w-full">
                    {currentQuestion.questionType === 'multiple-choice' && (
                        <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto px-4">
                            {currentQuestion.options.map((option: string, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSubmit(option)}
                                    disabled={hasAnswered}
                                    className={`h-[100px] px-6 py-4 rounded-lg text-lg font-medium transition-colors whitespace-normal flex items-center justify-center ${getButtonStyle(option)}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.questionType === 'true-false' && (
                        <div className="flex justify-center gap-6">
                            {['True', 'False'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleAnswerSubmit(option)}
                                    disabled={hasAnswered}
                                    className={`w-[200px] h-[93.33px] px-6 py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center ${getButtonStyle(option)}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.questionType === 'identification' && (
                        <div className="max-w-xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type your answer here ..."
                                    className={`w-full h-[90px] px-6 text-lg rounded-lg border-2 bg-[#0f0f0f00] text-white placeholder-gray-400 ${hasAnswered
                                        ? isCorrect
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-red-500 bg-red-500/10'
                                        : 'border-[#2C2C2C]'
                                        } outline-none`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !hasAnswered) {
                                            handleAnswerSubmit((e.target as HTMLInputElement).value);
                                        }
                                    }}
                                    disabled={hasAnswered}
                                />
                                {hasAnswered && !isCorrect && (
                                    <div className="mt-2 text-green-500 text-center">
                                        Correct answer: {currentQuestion.correctAnswer}
                                    </div>
                                )}
                            </div>
                            {!hasAnswered && (
                                <button
                                    onClick={(e) => handleAnswerSubmit((e.currentTarget.previousElementSibling?.querySelector('input') as HTMLInputElement).value)}
                                    className="mt-7 w-full px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-lg font-medium"
                                >
                                    Submit Answer
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Result Overlay */}
            {showResult && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[60]">
                    <div className={`text-6xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'} animate-bounce`}>
                        {isCorrect ? 'CORRECT!!!' : 'WRONG!!!'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionModal; 