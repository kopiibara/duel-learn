import { motion, AnimatePresence } from "framer-motion";

interface GameStartAnimationProps {
    showGameStart: boolean;
    gameStartText: string;
}

export default function GameStartAnimation({
    showGameStart,
    gameStartText
}: GameStartAnimationProps) {
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