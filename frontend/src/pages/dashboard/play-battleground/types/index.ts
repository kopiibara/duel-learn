export type GameMode = 'Peaceful' | 'Time Pressured' | 'pvp';

export interface Question {
    question: string;
    correctAnswer: string;
    options?: string[];
    mode: GameMode;
    difficulty?: 'easy' | 'average' | 'hard';
    questionType: 'multiple-choice' | 'identification' | 'true-false';
}

export interface GameState {
    mode: GameMode;
    material: {
        title: string;
        [key: string]: any;
    } | null;
    selectedTypes: string[];
    timeLimit?: number | null;
} 