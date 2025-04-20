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
  id?: string;
  question: string;
  type: 'multiple-choice' | 'identification' | 'true-false' | string;
  questionType?: string;
  options?: string[] | { [key: string]: string };
  correctAnswer: string;
  answer?: string;
  mode?: string;
  explanation?: string;
  itemInfo?: {
    term: string;
    definition: string;
    itemId: string;
    itemNumber: number;
  };
  // Additional fields used in the codebase
  rawOptions?: any;
  image?: string;
  term?: string;
  definition?: string;
  item_id?: string;
  item_number?: number;
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
  id: string;
  question: string;
  type: 'multiple-choice' | 'identification' | 'true-false' | string;  // Allow string for backward compatibility
  questionType?: string;
  options: string[] | { [key: string]: string };  // Support both array and object formats
  correctAnswer: string;
  answer?: string;  // User's selected/submitted answer
  mode?: string;    // Required by some components
  itemInfo?: {
    term?: string;
    definition?: string;
    image?: string;
    itemId?: string;
    itemNumber?: number;
  };
  // Additional fields used in the codebase
  rawOptions?: any;
  image?: string;
  term?: string;
  definition?: string;
  item_id?: string;
  item_number?: number;
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