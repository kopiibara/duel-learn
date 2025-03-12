export interface Question {
  question: string;
  correctAnswer: string;
  options?: string[];
  mode: string;
  questionType: 'multiple-choice' | 'identification' | 'true-false';
  term?: string;
  definition?: string;
  difficulty?: 'easy' | 'average' | 'hard';
}