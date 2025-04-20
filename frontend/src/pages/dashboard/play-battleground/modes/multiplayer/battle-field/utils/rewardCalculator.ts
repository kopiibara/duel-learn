/**
 * Calculates XP and coin rewards for PvP battles
 */
export const calculateBattleRewards = (
  isWinner: boolean,
  myHealth: number,
  opponentHealth: number,
  winStreak: number,
  isPremium: boolean = false
) => {
  // Base rewards
  const baseXP = 100;
  const baseCoins = 5; // Reduced from 10 to 5

  // Calculate HP difference for bonus/penalty
  const hpDifference = Math.abs(myHealth - opponentHealth);
  const hpModifierXP = Math.floor(hpDifference * 0.25); // 25% of HP difference for XP
  const hpModifierCoins = Math.floor(hpDifference * 0.1); // 10% of HP difference for coins

  // Calculate win streak bonus for XP (10 points per win, max 50)
  const xpWinStreakBonus = Math.min(winStreak * 10, 50);
  
  // Calculate win streak bonus for coins (3/6/9/12/15 based on streak)
  let coinWinStreakBonus = 0;
  if (winStreak === 1) coinWinStreakBonus = 3;
  else if (winStreak === 2) coinWinStreakBonus = 6;
  else if (winStreak === 3) coinWinStreakBonus = 9;
  else if (winStreak === 4) coinWinStreakBonus = 12;
  else if (winStreak >= 5) coinWinStreakBonus = 15;

  // Initialize rewards
  let xpReward = baseXP;
  let coinReward = baseCoins;

  if (isWinner) {
    // Winner gets base + HP bonus + win streak bonus
    xpReward = baseXP + hpModifierXP + xpWinStreakBonus;
    coinReward = baseCoins + hpModifierCoins + coinWinStreakBonus;
  } else {
    // Loser gets base - HP penalty
    xpReward = Math.max(0, baseXP - hpModifierXP);
    coinReward = Math.max(0, baseCoins - Math.floor(hpModifierCoins/2)); // Reduced penalty for losers
  }

  // Apply premium multiplier if applicable
  if (isPremium) {
    xpReward *= 2;
    coinReward *= 2;
  }

  return {
    xp: Math.floor(xpReward),
    coins: Math.floor(coinReward),
  };
}; 