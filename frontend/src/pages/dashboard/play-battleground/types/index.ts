export type GameMode = 'Peaceful' | 'Time Pressured' | 'pvp';

export interface StudyMaterialItem {
  term: string;
  definition: string;
}

export interface StudyMaterial {
  study_material_id: string;
  title: string;
  tags: string[];
  summary: string;
  total_items: number;
  items: StudyMaterialItem[];
}

export interface Question {
  type: 'multiple-choice' | 'identification' | 'true-false';
  question: string;
  correctAnswer: string;
  options?: { [key: string]: string };  // for multiple choice questions
  answer: string;
}

export interface GameState {
  mode: string; // Changed from GameMode to string to be more flexible
  material: {
    study_material_id: string;
    title: string;
    tags: string[];
    summary: string;
    total_items: number;
    items: StudyMaterialItem[];
  };
  selectedTypes: string[];
  timeLimit?: number | null;
  aiQuestions?: Question[];
}