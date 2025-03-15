import React from "react";

export interface WaitingOverlayProps {
    isVisible: boolean;
}

/**
 * WaitingOverlay component displays a waiting screen while looking for an opponent
 */
const WaitingOverlay: React.FC<WaitingOverlayProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex flex-col items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
                {/* VS Logo */}
                <div className="relative mb-4 sm:mb-6">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-purple-900/80 rotate-45 border-2 border-purple-400 mx-auto shadow-lg shadow-purple-500/30"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl sm:text-3xl font-bold text-purple-300">VS</span>
                    </div>
                </div>

                {/* Waiting text */}
                <h1 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-purple-300 tracking-wide uppercase">
                    WAITING FOR OPPONENT
                </h1>

                {/* Status message */}
                <p className="text-purple-200/80 text-xs sm:text-sm mb-4 sm:mb-8 max-w-xs mx-auto">
                    Please stand by while we wait for your opponent to connect...
                </p>

                {/* Loading animation dot */}
                <div className="flex justify-center items-center space-x-3 my-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-200 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
                </div>
            </div>
        </div>
    );
};

export default WaitingOverlay; 