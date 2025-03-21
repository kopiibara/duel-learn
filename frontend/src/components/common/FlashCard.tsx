import React, { memo } from 'react';

interface FlashCardProps {
  question: string;
  correctAnswer: string;
  isFlipped: boolean;
  onFlip: () => void;
  onReveal?: () => void;
  timeRemaining?: number | null;
  type?: string;
  disabled?: boolean;
}

const FlashCard: React.FC<FlashCardProps> = memo(({
  question,
  correctAnswer,
  isFlipped,
  onFlip,
  onReveal,
  timeRemaining,
  type,
  disabled
}) => {
  // Only log once during initial render
  React.useEffect(() => {
    console.log('FlashCard mounted with question:', question);
    console.log('FlashCard mounted with answer:', correctAnswer);
  }, [question, correctAnswer]);

  // ... rest of your component code ...
}, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.question === nextProps.question &&
    prevProps.correctAnswer === nextProps.correctAnswer &&
    prevProps.isFlipped === nextProps.isFlipped &&
    prevProps.timeRemaining === nextProps.timeRemaining &&
    prevProps.disabled === nextProps.disabled
  );
});

export default FlashCard; 