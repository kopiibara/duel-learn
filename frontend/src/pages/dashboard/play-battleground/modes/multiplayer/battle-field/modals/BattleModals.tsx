import { EmojiEvents, CancelOutlined, ExitToApp } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Add the import for rewardCalculator functions
import { calculateBattleRewards, earlyEndRewards } from '../utils/rewardCalculator';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReport: () => void;
  isVictory: boolean;
  currentUserId?: string;
  sessionUuid?: string;
  playerHealth?: number;
  opponentHealth?: number;
  earlyEnd?: boolean;
  soundEffectsVolume?: number;
}

interface EarlyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReport: () => void;
  currentUserId?: string;
  sessionUuid?: string;
  opponentName: string;
  soundEffectsVolume?: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  onViewReport,
  isVictory,
  currentUserId,
  sessionUuid,
  playerHealth = 0,
  opponentHealth = 0,
  earlyEnd = false,
  soundEffectsVolume = 0.5
}) => {
  const [rewardsClaimed, setRewardsClaimed] = useState(false);
  const victorySoundRef = useRef<HTMLAudioElement | null>(null);
  const defeatSoundRef = useRef<HTMLAudioElement | null>(null);

  // Add effect to claim rewards when modal opens
  useEffect(() => {
    const claimBattleRewards = async () => {
      // Skip if rewards already claimed or missing data
      if (rewardsClaimed || !currentUserId || !sessionUuid) {
        return;
      }

      try {
        // Get user's current win streak
        const { data: winStreakData } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/win-streak/${currentUserId}`
        );

        const userWinStreak = winStreakData.success ? winStreakData.data.win_streak : 0;

        // Calculate rewards based on whether the game ended early
        let rewards;
        if (earlyEnd && isVictory) {
          // If opponent left early and this player won
          rewards = earlyEndRewards(false); // TODO: Get premium status from user context
          console.log("Early end rewards (opponent left):", rewards);
        } else {
          // Normal battle rewards calculation
          rewards = calculateBattleRewards(
            isVictory,
            playerHealth,
            opponentHealth,
            userWinStreak,
            false // TODO: Get premium status from user context
          );

          console.log("Calculated rewards:", {
            isVictory,
            playerHealth,
            opponentHealth,
            userWinStreak,
            xp: rewards.xp,
            coins: rewards.coins
          });
        }

        // Call the API to claim rewards
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/claim-rewards`,
          {
            firebase_uid: currentUserId,
            xp_earned: rewards.xp,
            coins_earned: rewards.coins,
            session_uuid: sessionUuid,
            early_end: earlyEnd
          }
        );

        console.log('Battle rewards claimed:', response.data);
        setRewardsClaimed(true);
      } catch (error) {
        console.error('Error claiming battle rewards:', error);
      }
    };

    // Only try to claim rewards when the modal is open
    if (isOpen) {
      claimBattleRewards();
    }
  }, [isOpen, currentUserId, sessionUuid, isVictory, playerHealth, opponentHealth, rewardsClaimed, earlyEnd]);

  // Effect to play the appropriate sound effect when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isVictory) {
        if (victorySoundRef.current) {
          victorySoundRef.current.volume = soundEffectsVolume;
          victorySoundRef.current.currentTime = 0;
          victorySoundRef.current.play().catch(err =>
            console.error("Error playing victory sound:", err)
          );
        }
      } else {
        if (defeatSoundRef.current) {
          defeatSoundRef.current.volume = soundEffectsVolume;
          defeatSoundRef.current.currentTime = 0;
          defeatSoundRef.current.play().catch(err =>
            console.error("Error playing defeat sound:", err)
          );
        }
      }
    }
  }, [isOpen, isVictory, soundEffectsVolume]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      {/* Audio elements */}
      <audio
        ref={victorySoundRef}
        src="/GameBattle/battleResultModal/VictorySfx.mp3"
        preload="auto"
      />
      <audio
        ref={defeatSoundRef}
        src="/GameBattle/battleResultModal/DefeatSfx.mp3"
        preload="auto"
      />

      <div className={`w-[400px] rounded-2xl p-8 flex flex-col items-center ${isVictory ? 'bg-[#1a1f2e] border-2 border-purple-500/20' : 'bg-[#1a1f2e] border-2 border-red-500/20'
        }`}>
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isVictory ? 'bg-purple-900/50' : 'bg-red-900/50'
          }`}>
          {isVictory ? (
            <EmojiEvents className="w-8 h-8 text-purple-400" />
          ) : (
            <CancelOutlined className="w-8 h-8 text-red-400" />
          )}
        </div>

        {/* Title */}
        <h2 className={`text-3xl font-bold mb-2 ${isVictory ? 'text-purple-400' : 'text-red-400'
          }`}>
          {isVictory ? 'Victory!' : 'Defeat!'}
        </h2>

        {/* Message */}
        <p className="text-white text-lg mb-8">
          {isVictory ? (earlyEnd ? 'Opponent left the game. You won!' : 'You Won!') : 'You Lost!'}
        </p>

        {/* Buttons */}
        <button
          onClick={onViewReport}
          className={`w-full py-3 rounded-lg mb-3 flex items-center justify-center gap-2 ${isVictory
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
        >
          View Session Report
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg bg-[#2C2C2C] hover:bg-[#3C3C3C] text-white flex items-center justify-center gap-2"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

/**
 * A separate modal specifically for when an opponent leaves the game early
 */
export const EarlyLeaveModal: React.FC<EarlyLeaveModalProps> = ({
  isOpen,
  onClose,
  onViewReport,
  currentUserId,
  sessionUuid,
  opponentName,
  soundEffectsVolume = 0.5
}) => {
  const [rewardsClaimed, setRewardsClaimed] = useState(false);
  const leftGameSoundRef = useRef<HTMLAudioElement | null>(null);

  // Effect to claim the early leave rewards
  useEffect(() => {
    const claimEarlyLeaveRewards = async () => {
      // Skip if rewards already claimed or missing data
      if (rewardsClaimed || !currentUserId || !sessionUuid) {
        return;
      }

      try {
        // Calculate early leave rewards
        const rewards = earlyEndRewards(false); // TODO: Get premium status from user context
        console.log("Early leave rewards:", rewards);

        // Call the API to claim rewards
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/claim-rewards`,
          {
            firebase_uid: currentUserId,
            xp_earned: rewards.xp,
            coins_earned: rewards.coins,
            session_uuid: sessionUuid,
            early_end: true
          }
        );

        console.log('Early leave rewards claimed:', response.data);
        setRewardsClaimed(true);
      } catch (error) {
        console.error('Error claiming early leave rewards:', error);
      }
    };

    // Only try to claim rewards when the modal is open
    if (isOpen) {
      claimEarlyLeaveRewards();
    }
  }, [isOpen, currentUserId, sessionUuid, rewardsClaimed]);

  // Effect to play the left game sound when modal opens
  useEffect(() => {
    if (isOpen) {
      if (leftGameSoundRef.current) {
        leftGameSoundRef.current.volume = soundEffectsVolume;
        leftGameSoundRef.current.currentTime = 0;
        leftGameSoundRef.current.play().catch(err =>
          console.error("Error playing left game sound:", err)
        );
      }
    }
  }, [isOpen, soundEffectsVolume]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      {/* Audio element */}
      <audio
        ref={leftGameSoundRef}
        src="/GameBattle/battleResultModal/LeftTheGameEnemySfx.mp3"
        preload="auto"
      />

      <div className="w-[400px] rounded-2xl p-8 flex flex-col items-center bg-[#1a1f2e] border-2 border-blue-500/20">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-blue-900/50">
          <ExitToApp className="w-8 h-8 text-blue-400" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-2 text-blue-400">
          Opponent Left!
        </h2>

        {/* Message */}
        <p className="text-white text-lg mb-4">
          {opponentName} left the game early.
        </p>

        <p className="text-gray-300 text-sm mb-8">
          You've been awarded a small victory bonus: 20 XP and 1 Coin.
        </p>

        {/* Buttons */}
        <button
          onClick={onViewReport}
          className="w-full py-3 rounded-lg mb-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          View Session Report
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg bg-[#2C2C2C] hover:bg-[#3C3C3C] text-white flex items-center justify-center gap-2"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
