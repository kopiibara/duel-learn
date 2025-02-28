import React, { useState } from 'react';
import { useGameLogic } from '../../hooks/useGameLogic';
import FlashCard from '../../components/common/FlashCard';
import Header from '../../components/common/Header'
import { GameState } from '../../types';
import Timer from '../../components/common/Timer';

const PeacefulMode: React.FC<GameState> = ({ mode, material, selectedTypes }) => {
    const {
        currentQuestion,
        isFlipped,
        handleFlip,
        handleAnswerSubmit,
        correctCount,
        incorrectCount,
        showResult,
        showNextButton,
        handleNextQuestion,
        getButtonStyle,
        inputAnswer,
        setInputAnswer,
        questionTimer,
        timerProgress,
        timeLimit,
        currentStreak,
        highestStreak,
        masteredCount,
        unmasteredCount,
        handleUnmastered,
        handleMastered,
        isCorrect
    } = useGameLogic({ mode, material, selectedTypes });

    const [startTime] = useState(new Date());

    const renderQuestionContent = () => {
        if (!currentQuestion) return null;

        switch (currentQuestion.questionType) {
            case 'multiple-choice':
                return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[1000px] mx-auto">
                        {currentQuestion.options?.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSubmit(option)}
                                disabled={showResult}
                                className={`h-[100px] w-full bg-transparent 
                                    ${getButtonStyle(option)}
                                    rounded-lg text-white hover:bg-gray-800/20 transition-colors
                                    disabled:cursor-not-allowed px-4 text-center`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                );

            case 'identification':
                return (
                    <div className="w-full max-w-[500px] mt-3 mx-auto">
                        <input
                            type="text"
                            value={inputAnswer}
                            onChange={(e) => setInputAnswer(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !showResult) {
                                    handleAnswerSubmit(inputAnswer);
                                }
                            }}
                            disabled={showResult}
                            className={`w-full p-4 rounded-lg bg-transparent py-10 px-10 border-2 text-center
                                ${showResult
                                    ? inputAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                                        ? 'border-[#52A647]'
                                        : 'border-[#FF3B3F]'
                                    : 'border-gray-600'
                                }
                                text-white focus:outline-none placeholder:text-[#6F658D]`}
                            placeholder="Type your answer here..."
                        />
                    </div>
                );

            case 'true-false':
                return (
                    <div className="flex gap-4 justify-center">
                        {['true', 'false'].map((option) => (
                            <button
                                key={option}
                                onClick={() => handleAnswerSubmit(option)}
                                disabled={showResult}
                                className={`h-[100px] w-[200px] bg-transparent 
                                    ${getButtonStyle(option)}
                                    rounded-lg text-white hover:bg-gray-800/20 transition-colors
                                    disabled:cursor-not-allowed`}
                            >
                                {option.toUpperCase()}
                            </button>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen relative">
            <Header
                material={material}
                mode={mode}
                correct={correctCount}
                incorrect={incorrectCount}
                startTime={startTime}
                highestStreak={highestStreak}
                masteredCount={masteredCount}  // Ensure this is included
                unmasteredCount={unmasteredCount}  // Ensure this is included
            />
            <main className="pt-24 px-4">
                <div className="mx-auto max-w-[1200px] flex flex-col items-center gap-8 h-[calc(100vh-96px)] justify-center">
                    <FlashCard
                        question={currentQuestion?.question || ''}
                        correctAnswer={currentQuestion?.correctAnswer || ''}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                    />
                    {renderQuestionContent()}
                    <Timer
                        timeRemaining={30}
                        progress={100}
                        timeLimit={1}
                        currentStreak={currentStreak}
                        highestStreak={highestStreak}
                        showTimerUI={false}
                    />
                    {showNextButton && (
                        <button
                            onClick={handleNextQuestion}
                            className="mt-6 px-8 py-3 bg-[#4D18E8] text-white rounded-lg hover:bg-[#3A12B0] transition-colors"
                        >
                            Next Question
                        </button>
                    )}
                    {showResult && isCorrect === true && (
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={handleUnmastered}
                                className="px-8 py-3 bg-[#FF3B3F] text-white rounded-lg hover:bg-[#D32F2F] transition-colors"
                            >
                                Unmastered
                            </button>
                            <button
                                onClick={handleMastered}
                                className="px-8 py-3 bg-[#52A647] text-white rounded-lg hover:bg-[#388E3C] transition-colors"
                            >
                                Mastered
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PeacefulMode; 