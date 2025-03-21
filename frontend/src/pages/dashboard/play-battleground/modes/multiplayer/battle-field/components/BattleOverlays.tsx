import { Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VictoryModalProps {
    showVictoryModal: boolean;
    victoryMessage: string;
    onConfirm: () => void;
}

export function VictoryModal({ showVictoryModal, victoryMessage, onConfirm }: VictoryModalProps) {
    if (!showVictoryModal) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 relative">
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onConfirm}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <h2 className="text-purple-300 text-3xl font-bold mb-4 text-center">
                    Victory!
                </h2>

                <p className="text-white text-xl mb-8 text-center">
                    {victoryMessage}
                </p>

                <button
                    onClick={onConfirm}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-lg transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}

interface RandomizerOverlayProps {
    showRandomizer: boolean;
    isHost: boolean;
    randomizing: boolean;
    gameStartText: string;
    onRandomizeTurn: () => void;
}

export function RandomizerOverlay({
    showRandomizer,
    isHost,
    randomizing,
    gameStartText,
    onRandomizeTurn
}: RandomizerOverlayProps) {
    if (!showRandomizer || !isHost) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-40 flex flex-col items-center justify-center">
            <div className="text-center">
                <h2 className="text-purple-300 text-4xl font-bold mb-8">Ready to Battle!</h2>
                <p className="text-white text-xl mb-12">Both players have joined. Who will go first?</p>

                {randomizing ? (
                    <div className="mb-8">
                        <div className="text-white text-3xl font-bold animate-pulse mb-4">
                            Randomizing...
                        </div>
                        <div className="text-white text-4xl font-bold">
                            {gameStartText}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onRandomizeTurn}
                        className="px-8 py-4 bg-purple-700 hover:bg-purple-600 text-white text-xl font-bold rounded-lg transition-colors"
                    >
                        Randomize First Turn
                    </button>
                )}
            </div>
        </div>
    );
}

interface WaitingForHostOverlayProps {
    showWaitingForHost: boolean;
}

export function WaitingForHostOverlay({ showWaitingForHost }: WaitingForHostOverlayProps) {
    if (!showWaitingForHost) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-40 flex flex-col items-center justify-center">
            <div className="text-center">
                <h2 className="text-purple-300 text-4xl font-bold mb-8">Ready to Battle!</h2>
                <p className="text-white text-xl mb-12">Waiting for host to determine who goes first...</p>
                <div className="flex space-x-4 justify-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}

interface GameStartAnimationProps {
    showGameStart: boolean;
    gameStartText: string;
}

export function GameStartAnimation({ showGameStart, gameStartText }: GameStartAnimationProps) {
    return (
        <AnimatePresence>
            {showGameStart && (
                <motion.div
                    className="fixed inset-0 bg-black/70 z-30 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center"
                    >
                        <div className="text-purple-300 text-5xl font-bold mb-4">BATTLE START!</div>
                        <div className="text-white text-2xl">{gameStartText}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface EndingBattleOverlayProps {
    isEndingBattle: boolean;
}

export function EndingBattleOverlay({ isEndingBattle }: EndingBattleOverlayProps) {
    if (!isEndingBattle) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-purple-300 text-3xl font-bold mb-6">Ending Battle...</h2>
                <div className="flex space-x-4 justify-center">
                    <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}

interface BattleHeaderProps {
    playerName: string;
    playerHealth: number;
    maxHealth: number;
    currentUserId: string;
    opponentName: string;
    opponentHealth: number;
    opponentId: string;
    currentQuestion: number;
    totalQuestions: number;
    timeLeft: number;
    onSettingsClick: () => void;
}

export function BattleHeader({
    playerName,
    playerHealth,
    maxHealth,
    currentUserId,
    opponentName,
    opponentHealth,
    opponentId,
    currentQuestion,
    totalQuestions,
    timeLeft,
    onSettingsClick
}: BattleHeaderProps) {
    return (
        <div className="w-full py-4 px-4 sm:px-8 md:px-16 lg:px-32 xl:px-80 mt-4 lg:mt-12 flex items-center justify-between">
            {/* Import and use components */}
            <div className="flex-1">
                {/* Player info component would be here */}
                {/* This is just a placeholder since we don't have access to the component */}
                <div className="text-white">
                    {playerName} ({playerHealth}/{maxHealth})
                </div>
            </div>

            <div className="flex-1 text-center">
                {/* Question timer component would be here */}
                {/* This is just a placeholder */}
                <div className="text-white">
                    {timeLeft}s - Question {currentQuestion}/{totalQuestions}
                </div>
            </div>

            <div className="flex-1 text-right">
                {/* Opponent info component would be here */}
                {/* This is just a placeholder */}
                <div className="text-white">
                    {opponentName} ({opponentHealth}/{maxHealth})
                </div>
            </div>

            {/* Settings button */}
            <button
                className="absolute right-2 sm:right-4 top-2 sm:top-4 text-white"
                onClick={onSettingsClick}
            >
                <Settings size={16} className="sm:w-[20px] sm:h-[20px]" />
            </button>
        </div>
    );
} 