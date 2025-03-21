import { useEffect } from "react";

export interface AnimationState {
    playerAnimationState: string;
    playerPickingIntroComplete: boolean;
    enemyAnimationState: string;
    enemyPickingIntroComplete: boolean;
}

interface BattleAnimationsProps {
    gameStarted: boolean;
    waitingForPlayer: boolean;
    isMyTurn: boolean;
    playerAnimationState: string;
    playerPickingIntroComplete: boolean;
    enemyAnimationState: string;
    enemyPickingIntroComplete: boolean;
    setPlayerAnimationState: (state: string) => void;
    setPlayerPickingIntroComplete: (complete: boolean) => void;
    setEnemyAnimationState: (state: string) => void;
    setEnemyPickingIntroComplete: (complete: boolean) => void;
}

export function useBattleAnimations({
    gameStarted,
    waitingForPlayer,
    isMyTurn,
    playerAnimationState,
    playerPickingIntroComplete,
    enemyAnimationState,
    enemyPickingIntroComplete,
    setPlayerAnimationState,
    setPlayerPickingIntroComplete,
    setEnemyAnimationState,
    setEnemyPickingIntroComplete
}: BattleAnimationsProps) {
    // Update animation states when turns change
    useEffect(() => {
        if (gameStarted && !waitingForPlayer) {
            if (isMyTurn) {
                // If it's my turn, my character should be picking
                setPlayerAnimationState("picking");
                setPlayerPickingIntroComplete(false); // Start with the non-looping intro animation
                setEnemyAnimationState("idle");
            } else {
                // If it's opponent's turn, their character should be picking
                setEnemyAnimationState("picking");
                setEnemyPickingIntroComplete(false); // Start with the non-looping intro animation
                setPlayerAnimationState("idle");
            }
        }
    }, [isMyTurn, gameStarted, waitingForPlayer, setPlayerAnimationState, setPlayerPickingIntroComplete, setEnemyAnimationState, setEnemyPickingIntroComplete]);

    // Handle completion of picking intro animation for player - only runs ONCE per turn
    useEffect(() => {
        if (playerAnimationState === "picking" && !playerPickingIntroComplete) {
            // Set a timer for the exact duration of the characterPicking.gif
            const introDuration = 400; // Duration in ms - adjust to match your actual GIF duration

            const introTimer = setTimeout(() => {
                // After intro animation completes exactly once, switch to the looping animation
                setPlayerPickingIntroComplete(true);
                console.log("Player picking intro completed, switching to loop animation");
            }, introDuration);

            return () => clearTimeout(introTimer);
        }
    }, [playerAnimationState, playerPickingIntroComplete, setPlayerPickingIntroComplete]);

    // Handle completion of picking intro animation for enemy - only runs ONCE per turn
    useEffect(() => {
        if (enemyAnimationState === "picking" && !enemyPickingIntroComplete) {
            // Set a timer for the exact duration of the characterPicking.gif
            const introDuration = 400; // Duration in ms - adjust to match your actual GIF duration

            const introTimer = setTimeout(() => {
                // After intro animation completes exactly once, switch to the looping animation
                setEnemyPickingIntroComplete(true);
                console.log("Enemy picking intro completed, switching to loop animation");
            }, introDuration);

            return () => clearTimeout(introTimer);
        }
    }, [enemyAnimationState, enemyPickingIntroComplete, setEnemyPickingIntroComplete]);

    // Helper function to get the correct animation image for a character
    const getCharacterImage = (
        baseImage: string,
        animationState: string,
        introComplete: boolean,
        characterPicking: string,
        characterPickingLoop: string
    ): string => {
        if (animationState === "picking") {
            // If in picking state, show intro animation until it completes, then show loop
            return introComplete ? characterPickingLoop : characterPicking;
        }
        return baseImage;
    };

    return {
        getCharacterImage
    };
} 