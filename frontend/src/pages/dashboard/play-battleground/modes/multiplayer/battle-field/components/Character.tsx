import React from "react";

export interface CharacterProps {
    imageSrc: string;
    alt: string;
    isRight?: boolean;
}

/**
 * Character component displays a battle character with responsive positioning
 */
const Character: React.FC<CharacterProps> = ({
    imageSrc,
    alt,
    isRight = false
}) => (
    <div className={`absolute top-1/2 ${isRight
            ? 'right-[15%] sm:right-[20%] lg:right-[27%] transform translate-x-1/2'
            : 'left-[15%] sm:left-[20%] lg:left-[27%] transform -translate-x-1/2'
        } -translate-y-1/2 w-[180px] h-[180px] sm:w-[280px] sm:h-[280px] lg:w-[380px] lg:h-[380px]`}>
        <div className="w-full flex items-center justify-center">
            <img
                src={imageSrc}
                alt={alt}
                className="w-full h-full object-contain"
            />
        </div>
    </div>
);

export default Character; 