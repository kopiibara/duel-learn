import { useState } from "react";

// Add imports for achievement images
import WisdomCollectorW from "../../../assets/achievements/wisdom-collector-w.png";
import DuelistW from "../../../assets/achievements/duelist-w.png";
import BattleArchmageW from "../../../assets/achievements/battle-archmage-w.png";
import BestMagicianW from "../../../assets/achievements/best-magician-w.png";
import SpeedyWitchW from "../../../assets/achievements/speedy-witch-w.png";
import FlawlessSpellcasterW from "../../../assets/achievements/flawless-spellcaster-w.png";
import ArcaneScholarW from "../../../assets/achievements/arcane-scholar-w.png";
import HexOfSilenceW from "../../../assets/achievements/hex-silence-w.png";
import MysticElderW from "../../../assets/achievements/mystic-elder-w.png";

const Achievements = () => {
  // Helper function to get the appropriate badge image based on progress
  const getBadgeImage = (baseImage: string, progress: number) => {
    const baseName = baseImage.replace("-w.png", "");
    if (progress >= 100) {
      return `${baseName}-g.png`; // Gold
    } else if (progress >= 60) {
      return `${baseName}-s.png`; // Silver
    } else if (progress >= 20) {
      return `${baseName}-b.png`; // Bronze
    }
    return `${baseName}-w.png`; // White/Locked
  };

  // Helper function to get opacity based on progress
  const getOpacity = (progress: number) => {
    // Only apply opacity when progress is 0 (white/locked badge)
    if (progress === 0) return "opacity-30";
    return "";
  };

  // State for achievements data with progress values restricted to 20, 40, 60, 80, 100
  const [achievements] = useState([
    {
      id: 1,
      name: "Wisdom Collector",
      description: "Create 5 study materials",
      progress: 40, // Progress percentage
      baseImage: WisdomCollectorW,
    },
    {
      id: 2,
      name: "Duelist",
      description: "Reach a 3-win streak in PvP",
      progress: 20,
      baseImage: DuelistW,
    },
    {
      id: 3,
      name: "Battle Archmage",
      description: "Complete 20 PvP battles",
      progress: 60,
      baseImage: BattleArchmageW,
    },
    {
      id: 4,
      name: "Best magician wins",
      description: "Win a PVP battle",
      progress: 100,
      baseImage: BestMagicianW,
    },
    {
      id: 5,
      name: "Speedy Witch",
      description: "Earned for answering within 3 seconds",
      progress: 20,
      baseImage: SpeedyWitchW,
    },
    {
      id: 6,
      name: "Flawless Spellcaster",
      description: "Awarded for flawless accuracy in a PvP battle",
      progress: 80,
      baseImage: FlawlessSpellcasterW,
    },
    {
      id: 7,
      name: "Arcane Scholar",
      description: "Earned for completing 10 study sessions in a day",
      progress: 40,
      baseImage: ArcaneScholarW,
    },
    {
      id: 8,
      name: "Hex of Silence",
      description: "For winning with no opponent points.",
      progress: 100,
      baseImage: HexOfSilenceW,
    },
    {
      id: 9,
      name: "Mystic Elder",
      description: "Earned by reaching level 50",
      progress: 60,
      baseImage: MysticElderW,
    },
  ]);

  // Function to calculate the progress in terms of 0/5 scale
  const calculateScale = (progress: number) => {
    const scaleValue = progress / 20; // Directly map the progress value (20, 40, 60, 80, 100) to 1-5 scale
    return `${scaleValue}/5`; // Return in format x/5
  };

  // Helper function to get achievement level based on progress
  const getAchievementLevel = (progress: number) => {
    if (progress >= 100) return "Level 3";
    if (progress >= 60) return "Level 2";
    if (progress >= 20) return "Level 1";
    return "Locked";
  };

  return (
    <div>
      <h3 className="text-white text-2xl font-semibold mb-5">
        Achievements ({achievements.filter((a) => a.progress === 100).length}/
        {achievements.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="rounded-[1rem] px-7 py-8 flex flex-col items-center border-[0.2rem] border-[#3B354C]"
          >
            <img
              src={getBadgeImage(achievement.baseImage, achievement.progress)}
              alt={achievement.name}
              className={`w-24 h-24 object-contain ${
                // Only apply opacity for white/locked badges
                achievement.progress === 0
                  ? getOpacity(achievement.progress)
                  : ""
              }`}
            />
            <h4
              className={`text-lg pt-4 pb-1 font-bold text-center ${
                achievement.progress === 0 ? "opacity-30" : ""
              }`}
            >
              {achievement.name}
            </h4>
            <span className="text-sm text-[#8d80b3] mb-3">
              {getAchievementLevel(achievement.progress)}
            </span>
            <p
              className={`text-gray-400 text-sm text-center mb-4 h-[40px] flex items-center ${
                achievement.progress === 0 ? "opacity-30" : ""
              }`}
            >
              {achievement.description}
              <br />
              &nbsp;
            </p>
            <div className="flex items-center w-[85%]">
              <div className="w-full bg-[#3E3E50] rounded-full h-2">
                <div
                  className="bg-[#2B00FF] h-2 rounded-full"
                  style={{ width: `${achievement.progress}%` }}
                ></div>
              </div>
              <p
                className={`text-sm text-gray-300 ml-3 ${
                  achievement.progress < 100 ? "opacity-50" : ""
                }`}
              >
                {calculateScale(achievement.progress)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
