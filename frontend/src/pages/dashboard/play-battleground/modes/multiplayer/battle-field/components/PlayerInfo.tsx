import React from "react";

export interface PlayerInfoProps {
    name: string;
    health: number;
    maxHealth: number;
    isRightAligned?: boolean;
}

/**
 * PlayerInfo component displays player avatar, name, and health bar
 */
const PlayerInfo: React.FC<PlayerInfoProps> = ({
    name,
    health,
    maxHealth,
    isRightAligned = false
}) => (
    <div className={`flex items-center gap-2 sm:gap-3 flex-1 ${isRightAligned ? 'justify-end' : ''}`}>
        {!isRightAligned && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white rounded-lg"></div>
        )}
        <div className={`flex flex-col gap-1 ${isRightAligned ? 'items-end' : ''}`}>
            <div className="text-white text-xs sm:text-sm">{name}</div>
            <div className={`flex items-center gap-1 ${isRightAligned ? 'justify-end' : ''}`}>
                <span className="text-white text-[10px] sm:text-xs">{health} HP</span>
                <span className="text-gray-500 text-[10px] sm:text-xs">/{maxHealth}</span>
            </div>
            <div className="w-20 sm:w-36 md:w-48 lg:w-64 h-2 lg:h-2.5 bg-gray-900 rounded-full overflow-hidden">
                <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${(health / maxHealth) * 100}%` }}
                ></div>
            </div>
            <div className={`w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full ${isRightAligned ? 'ml-auto mr-1' : 'ml-1'} mt-1`}></div>
        </div>
        {isRightAligned && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white rounded-lg"></div>
        )}
    </div>
);

export default PlayerInfo; 