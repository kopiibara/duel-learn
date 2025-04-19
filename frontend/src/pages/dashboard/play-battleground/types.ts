export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'identification';
  question: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  study_material_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  question: string;
  correctAnswer: string;
  answer?: string; // For backward compatibility
  options?: string[] | { [key: string]: string };
  type?: string;
  questionType?: string;
  mode?: string;
  difficulty?: 'easy' | 'average' | 'hard';
  itemInfo?: {
    term: string;
    definition: string;
    itemId: string;
    itemNumber: number;
  };
}