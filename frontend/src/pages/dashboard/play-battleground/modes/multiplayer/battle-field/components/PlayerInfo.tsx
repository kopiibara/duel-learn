import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export interface PlayerInfoProps {
    name: string;
    health: number;
    maxHealth: number;
    isRightAligned?: boolean;
    userId?: string;
}

/**
 * PlayerInfo component displays player avatar, name, and health bar
 */
const PlayerInfo: React.FC<PlayerInfoProps> = ({
    name,
    health,
    maxHealth,
    isRightAligned = false,
    userId
}) => {
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [previousHealth, setPreviousHealth] = useState(health);
    const [isHit, setIsHit] = useState(false);

    // Update previous health when health changes
    useEffect(() => {
        if (health < previousHealth) {
            setIsHit(true);
            // Reset hit state after animation
            setTimeout(() => setIsHit(false), 500);
        }
        setPreviousHealth(health);
    }, [health]);

    // Fetch user profile picture if userId is provided
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) return;

            setLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/user-info/profile/${userId}`
                );

                if (response.data.success && response.data.data.display_picture) {
                    setProfilePicture(response.data.data.display_picture);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    // Generate avatar for the user
    const renderAvatar = () => {
        if (loading) {
            // Show loading state
            return (
                <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gray-600 rounded-lg animate-pulse"
                    animate={isHit ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, -5, 5, 0],
                        transition: { duration: 0.5 }
                    } : {}}
                />
            );
        }

        if (profilePicture) {
            // Show profile picture if available
            return (
                <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gray-800 rounded-lg overflow-hidden"
                    animate={isHit ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, -5, 5, 0],
                        filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
                        transition: { duration: 0.5 }
                    } : {}}
                    style={{
                        backgroundImage: `url(${profilePicture})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
            );
        }

        // Default white square if no profile picture
        return (
            <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white rounded-lg"
                animate={isHit ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, -5, 5, 0],
                    backgroundColor: ["#ffffff", "#ff0000", "#ffffff"],
                    transition: { duration: 0.5 }
                } : {}}
            />
        );
    };

    return (
        <motion.div
            className={`flex items-center gap-2 sm:gap-3 flex-1 ${isRightAligned ? 'justify-end' : ''}`}
            animate={isHit ? {
                x: [0, -5, 5, -5, 5, 0],
                transition: { duration: 0.5 }
            } : {}}
        >
            {!isRightAligned && renderAvatar()}
            <div className={`flex flex-col gap-1 ${isRightAligned ? 'items-end' : ''}`}>
                <div className="text-white text-xs sm:text-sm">{name}</div>
                <div className={`flex items-center gap-1 ${isRightAligned ? 'justify-end' : ''}`}>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={health}
                            initial={{ y: -20, opacity: 0, color: isHit ? "#ff0000" : "#ffffff" }}
                            animate={{ y: 0, opacity: 1, color: "#ffffff" }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-[10px] sm:text-xs font-bold"
                        >
                            {health} HP
                        </motion.span>
                    </AnimatePresence>
                    <span className="text-gray-500 text-[10px] sm:text-xs">/{maxHealth}</span>
                </div>
                <div className="w-20 sm:w-36 md:w-48 lg:w-64 h-2 lg:h-2.5 bg-gray-900 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-purple-600 rounded-full"
                        initial={{ width: `${(previousHealth / maxHealth) * 100}%` }}
                        animate={{
                            width: `${(health / maxHealth) * 100}%`,
                            backgroundColor: isHit ? "#ff0000" : "#9333ea"
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                </div>
                <div className={`w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full ${isRightAligned ? 'ml-auto mr-1' : 'ml-1'} mt-1`}></div>
            </div>
            {isRightAligned && renderAvatar()}
        </motion.div>
    );
};

export default PlayerInfo; 