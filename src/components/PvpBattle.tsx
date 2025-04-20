import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface PvpBattleProps {
  battleId: string;
  playerType: 'player1' | 'player2';
}

interface StudyMaterial {
  content: string;
  title: string;
}

interface BattleResponse {
  id: string;
  currentTurn: number;
  player1Score: number;
  player2Score: number;
  status: string;
  winner?: string;
}

interface StudyMaterialResponse {
  content: string;
  title: string;
}

interface BattleScoresResponse {
  player1Score: number;
  player2Score: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const PvpBattle: React.FC<PvpBattleProps> = ({ battleId, playerType }) => {
  const [battleStatus, setBattleStatus] = useState<BattleResponse | null>(null);
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [lastTurn, setLastTurn] = useState<number>(0);
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial>({ content: '', title: '' });
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  const fetchBattleStatus = async () => {
    try {
      const response = await axios.get(`/api/battles/${battleId}/status`);
      const battleData = response.data as BattleResponse;
      setPlayer1Score(battleData.player1Score);
      setPlayer2Score(battleData.player2Score);

      if (battleData.status === 'completed') {
        setGameOver(true);
        setWinner(battleData.winner || '');
      }
      setFetchError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Error fetching battle status';
        setFetchError(errorMessage);
        console.error('Error fetching battle status:', errorMessage);
      } else {
        setFetchError('An unexpected error occurred');
        console.error('Unexpected error:', error);
      }
    }
  };

  const generateAIQuestions = async (retryCount = 0) => {
    setIsGeneratingAI(true);
    try {
      const response = await axios.post('/api/generate-questions', {
        studyMaterial: studyMaterial,
        turn: currentTurn,
        playerType: playerType
      });
      const questions = response.data as Question[];
      setAiQuestions(questions);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to generate questions';
        console.error('Error generating AI questions:', errorMessage);
        
        // Retry logic for network errors (up to 2 retries)
        if (retryCount < 2 && (error.code === 'ECONNABORTED' || error.response?.status === 503)) {
          setTimeout(() => generateAIQuestions(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        
        toast.error(errorMessage);
      } else {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred while generating questions');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAnswerSubmit = async (selectedAnswer: string) => {
    try {
      const response = await axios.post(`/api/battles/${battleId}/submit-answer`, {
        answer: selectedAnswer,
        turn: currentTurn,
        playerType: playerType
      });
      const scores = response.data as BattleScoresResponse;
      setPlayer1Score(scores.player1Score);
      setPlayer2Score(scores.player2Score);
      setLastTurn(currentTurn);
      setSubmitError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to submit answer';
        setSubmitError(errorMessage);
        console.error('Error submitting answer:', errorMessage);
        toast.error(errorMessage);
      } else {
        setSubmitError('An unexpected error occurred');
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred while submitting answer');
      }
    }
  };

  const handleCardSelect = async (cardIndex: number) => {
    try {
      const response = await axios.post(`/api/study-material/${cardIndex}`);
      const material = response.data as StudyMaterialResponse;
      setStudyMaterial({
        content: material.content,
        title: material.title
      });
      setCardError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to select card';
        setCardError(errorMessage);
        console.error('Error selecting card:', errorMessage);
        toast.error(errorMessage);
      } else {
        setCardError('An unexpected error occurred');
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred while selecting card');
      }
    }
  };

  return (
    // Rest of the component code
  );
};

export default PvpBattle; 