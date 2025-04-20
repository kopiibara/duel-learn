import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const fetchBattleScores = async () => {
  if (!battleState?.session_uuid) return;

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/${battleState.session_uuid}/health`
    );

    if (response?.data?.success && response.data.data) {
      const scores = response.data.data;
      if (isHost) {
        setPlayerHealth(scores.host_health);
        setOpponentHealth(scores.guest_health);
      } else {
        setPlayerHealth(scores.guest_health);
        setOpponentHealth(scores.host_health);
      }
    }
  } catch (error) {
    console.error('Error fetching battle scores:', error);
  }
};

// Add effect to handle battle start and question generation
useEffect(() => {
  const handleBattleStart = async () => {
    if (battleState?.battleStarted && !isGeneratingAI && aiQuestions.length === 0) {
      console.log('Battle started, generating questions...');
      try {
        setIsGeneratingAI(true);
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/generate-questions`,
          {
            session_uuid: battleState.session_uuid,
            study_material_id: studyMaterialId,
            difficulty_mode: difficultyMode,
            question_types: questionTypes,
            player_type: isHost ? 'host' : 'guest'
          }
        );

        if (response.data?.success && response.data.data) {
          console.log('Questions generated successfully:', response.data.data);
          setAiQuestions(response.data.data);
        }
      } catch (error) {
        console.error('Error generating questions:', error);
        toast.error('Failed to generate questions. Please try again.');
      } finally {
        setIsGeneratingAI(false);
      }
    }
  };

  handleBattleStart();
}, [battleState?.battleStarted, studyMaterialId, difficultyMode, questionTypes, isGeneratingAI, aiQuestions.length]);

// Add effect to handle turn changes and show question modal
useEffect(() => {
  const checkTurn = async () => {
    if (!battleState?.session_uuid || !battleState.battleStarted) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/${battleState.session_uuid}/turn`
      );

      if (response?.data?.success && response.data.data) {
        const turnData = response.data.data;
        const isCurrentPlayerTurn = turnData.current_turn === (isHost ? 'host' : 'guest');
        
        if (isCurrentPlayerTurn && !showQuestionModal && aiQuestions.length > 0) {
          console.log('My turn, showing question modal');
          setShowQuestionModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking turn:', error);
    }
  };

  const turnInterval = setInterval(checkTurn, 2000);
  checkTurn(); // Initial check

  return () => clearInterval(turnInterval);
}, [battleState?.session_uuid, battleState?.battleStarted, showQuestionModal, aiQuestions.length]);

// Add debug logging
useEffect(() => {
  console.log('Battle state updated:', {
    battleStarted: battleState?.battleStarted,
    isGeneratingAI,
    aiQuestionsCount: aiQuestions.length,
    showQuestionModal,
    playerHealth,
    opponentHealth
  });
}, [battleState?.battleStarted, isGeneratingAI, aiQuestions.length, showQuestionModal, playerHealth, opponentHealth]);

// Update the QuestionModal component props
return (
  <div className="w-full h-screen flex flex-col relative" style={{
    backgroundImage: `url(${PvpBattleBG})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}>
    {/* ... existing JSX ... */}

    {/* Question Modal */}
    <QuestionModal
      isOpen={showQuestionModal}
      onClose={handleQuestionModalClose}
      onAnswerSubmit={handleAnswerSubmit}
      difficultyMode={difficultyMode}
      questionTypes={questionTypes}
      selectedCardId={selectedCardId}
      aiQuestions={aiQuestions}
      isGeneratingAI={isGeneratingAI}
    />

    {/* ... rest of existing JSX ... */}
  </div>
); 