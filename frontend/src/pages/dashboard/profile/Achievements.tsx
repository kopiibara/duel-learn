import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  AchievementObject,
  FormattedAchievement,
  MysticElderAchievement,
} from "../../../types/achievementObject";
import {
  useGetAchievements,
  getMysticElder,
  getWisdomCollector,
  getArcaneScholar,
  getBattleArchmage,
  getDuelist,
  getBestMagician,
} from "./hooks/getAchievement";
import { useUser } from "../../../contexts/UserContext";

// Define the response type you expect from fetchAchievements
interface AchievementResponse {
  success: boolean;
  data: AchievementObject[];
  message?: string;
}

// Define the formatted achievement type for your component state

const Achievements = () => {
  const { fetchAchievements } = useGetAchievements();
  const { fetchMysticElder } = getMysticElder();
  const { fetchWisdomCollector } = getWisdomCollector();
  const { fetchArcaneScholar } = getArcaneScholar();
  const { fetchBattleArchmage } = getBattleArchmage();
  const { fetchDuelist } = getDuelist();
  const { fetchBestMagician } = getBestMagician();
  const { user } = useUser();
  const location = useLocation();
  const [achievements, setAchievements] = useState<FormattedAchievement[]>([]);
  const [mysticElder, setMysticElder] = useState<MysticElderAchievement | null>(
    null
  );
  const [wisdomCollector, setWisdomCollector] = useState(null);
  const [arcaneScholar, setArcaneScholar] = useState(null);
  const [studyMaterialCount, setStudyMaterialCount] = useState(0);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
  const [userLevel, setUserLevel] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mysticElderLoading, setMysticElderLoading] = useState(true);
  const [wisdomCollectorLoading, setWisdomCollectorLoading] = useState(true);
  const [arcaneScholarLoading, setArcaneScholarLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mysticElderError, setMysticElderError] = useState<string | null>(null);
  const [wisdomCollectorError, setWisdomCollectorError] = useState<
    string | null
  >(null);
  const [arcaneScholarError, setArcaneScholarError] = useState<string | null>(
    null
  );
  const [battleArchmage, setBattleArchmage] = useState(null);
  const [pvpMatchesCount, setPvpMatchesCount] = useState(0);
  const [battleArchmageLoading, setBattleArchmageLoading] = useState(true);
  const [battleArchmageError, setBattleArchmageError] = useState<string | null>(
    null
  );
  const [duelist, setDuelist] = useState(null);
  const [winStreak, setWinStreak] = useState(0);
  const [duelistLoading, setDuelistLoading] = useState(true);
  const [duelistError, setDuelistError] = useState<string | null>(null);
  const [bestMagician, setBestMagician] = useState(null);
  const [pvpWinsCount, setPvpWinsCount] = useState(0);
  const [bestMagicianLoading, setBestMagicianLoading] = useState(true);
  const [bestMagicianError, setBestMagicianError] = useState<string | null>(
    null
  );

  // Convert achievement level to progress percentage
  const levelToProgress = (level: number): number => {
    switch (level) {
      case 3:
        return 100;
      case 2:
        return 60;
      case 1:
        return 20;
      default:
        return 0;
    }
  };

  // Add this function to calculate Mystic Elder progress based on user level
  const calculateMysticElderProgress = (
    userLevel: number,
    requirement: number
  ): number => {
    // Calculate progress percentage (capped at 100%)
    return Math.min(Math.floor((userLevel / requirement) * 100), 100);
  };

  // Single useEffect to initialize all achievement data when user is available
  useEffect(() => {
    if (!user?.firebase_uid) {
      return; // Exit if user isn't loaded yet
    }

    // Bootstrap all achievements in parallel
    const bootstrapAchievements = async () => {
      setLoading(true);
      try {
        // Fetch all achievements in parallel rather than sequentially
        const [
          mysticElderResponse,
          wisdomCollectorResponse,
          arcaneScholarResponse,
          battleArchmageResponse,
          duelistResponse,
          bestMagicianResponse,
        ] = await Promise.all([
          fetchMysticElder(user.firebase_uid),
          fetchWisdomCollector(user.firebase_uid),
          fetchArcaneScholar(user.firebase_uid),
          fetchBattleArchmage(user.firebase_uid),
          fetchDuelist(user.firebase_uid),
          fetchBestMagician(user.firebase_uid),
        ]);

        // Update all the state values from the responses
        if (mysticElderResponse) {
          setMysticElder(mysticElderResponse.mysticElderAchievement);
          setUserLevel(mysticElderResponse.userLevel);
        }

        if (wisdomCollectorResponse) {
          setWisdomCollector(
            wisdomCollectorResponse.wisdomCollectorAchievement
          );
          setStudyMaterialCount(wisdomCollectorResponse.userStudyMaterialCount);
        }

        if (arcaneScholarResponse) {
          setArcaneScholar(arcaneScholarResponse.arcaneScholarAchievement);
          setCompletedSessionsCount(
            arcaneScholarResponse.userStudyMaterialCount
          );
        }

        if (battleArchmageResponse) {
          setBattleArchmage(battleArchmageResponse.battleArchmageAchievement);
          setPvpMatchesCount(battleArchmageResponse.total_matches);
        }

        if (duelistResponse) {
          setDuelist(duelistResponse.duelistAchievement);
          setWinStreak(duelistResponse.highest_streak);
        }

        if (bestMagicianResponse) {
          setBestMagician(bestMagicianResponse.bestMagicianAchievement);
          setPvpWinsCount(bestMagicianResponse.total_wins);
        }

        // Now fetch regular achievements
        loadAchievements(false);
      } catch (err) {
        console.error("Error bootstrapping achievements:", err);
        setError("Failed to load achievements");
      }
    };

    bootstrapAchievements();
  }, [user?.firebase_uid]); // Only depends on user ID

  // Load Mystic Elder achievement
  useEffect(() => {
    const loadMysticElder = async () => {
      if (!user?.firebase_uid) {
        setMysticElderError("User not authenticated");
        setMysticElderLoading(false);
        return;
      }

      try {
        setMysticElderLoading(true);
        const response = await fetchMysticElder(user.firebase_uid);

        if (response && response.success) {
          setMysticElder(response.mysticElderAchievement);
          setUserLevel(response.userLevel);
        } else {
          setMysticElderError("Failed to load Mystic Elder achievement");
        }
      } catch (err) {
        setMysticElderError("Error loading Mystic Elder achievement");
        console.error(err);
      } finally {
        setMysticElderLoading(false);
      }
    };

    loadMysticElder();
  }, [fetchMysticElder, user?.firebase_uid]);

  // Load Wisdom Collector achievement
  useEffect(() => {
    const loadWisdomCollector = async () => {
      if (!user?.firebase_uid) {
        setWisdomCollectorError("User not authenticated");
        setWisdomCollectorLoading(false);
        return;
      }

      try {
        setWisdomCollectorLoading(true);
        const response = await fetchWisdomCollector(user.firebase_uid);

        if (response && response.success) {
          setWisdomCollector(response.wisdomCollectorAchievement);
          setStudyMaterialCount(response.userStudyMaterialCount);
        } else {
          setWisdomCollectorError(
            "Failed to load Wisdom Collector achievement"
          );
        }
      } catch (err) {
        setWisdomCollectorError("Error loading Wisdom Collector achievement");
        console.error(err);
      } finally {
        setWisdomCollectorLoading(false);
      }
    };

    loadWisdomCollector();
  }, [fetchWisdomCollector, user?.firebase_uid]);

  // Load Arcane Scholar achievement
  useEffect(() => {
    const loadArcaneScholar = async () => {
      if (!user?.firebase_uid) {
        setArcaneScholarError("User not authenticated");
        setArcaneScholarLoading(false);
        return;
      }

      try {
        setArcaneScholarLoading(true);
        const response = await fetchArcaneScholar(user.firebase_uid);

        if (response && response.success) {
          setArcaneScholar(response.arcaneScholarAchievement);
          setCompletedSessionsCount(response.userStudyMaterialCount);
        } else {
          setArcaneScholarError("Failed to load Arcane Scholar achievement");
        }
      } catch (err) {
        setArcaneScholarError("Error loading Arcane Scholar achievement");
        console.error(err);
      } finally {
        setArcaneScholarLoading(false);
      }
    };

    loadArcaneScholar();
  }, [fetchArcaneScholar, user?.firebase_uid]);

  // Load Battle Archmage achievement
  useEffect(() => {
    const loadBattleArchmage = async () => {
      if (!user?.firebase_uid) {
        setBattleArchmageError("User not authenticated");
        setBattleArchmageLoading(false);
        return;
      }

      try {
        setBattleArchmageLoading(true);
        const response = await fetchBattleArchmage(user.firebase_uid);

        if (response && response.success) {
          setBattleArchmage(response.battleArchmageAchievement);
          setPvpMatchesCount(response.total_matches);
        } else {
          setBattleArchmageError("Failed to load Battle Archmage achievement");
        }
      } catch (err) {
        setBattleArchmageError("Error loading Battle Archmage achievement");
        console.error(err);
      } finally {
        setBattleArchmageLoading(false);
      }
    };

    loadBattleArchmage();
  }, [fetchBattleArchmage, user?.firebase_uid]);

  // Load Duelist achievement
  useEffect(() => {
    const loadDuelist = async () => {
      if (!user?.firebase_uid) {
        setDuelistError("User not authenticated");
        setDuelistLoading(false);
        return;
      }

      try {
        setDuelistLoading(true);
        const response = await fetchDuelist(user.firebase_uid);

        if (response && response.success) {
          setDuelist(response.duelistAchievement);
          setWinStreak(response.highest_streak);
        } else {
          setDuelistError("Failed to load Duelist achievement");
        }
      } catch (err) {
        setDuelistError("Error loading Duelist achievement");
        console.error(err);
      } finally {
        setDuelistLoading(false);
      }
    };

    loadDuelist();
  }, [fetchDuelist, user?.firebase_uid]);

  // Load Best Magician achievement
  useEffect(() => {
    const loadBestMagician = async () => {
      if (!user?.firebase_uid) {
        setBestMagicianError("User not authenticated");
        setBestMagicianLoading(false);
        return;
      }

      try {
        setBestMagicianLoading(true);
        const response = await fetchBestMagician(user.firebase_uid);

        if (response && response.success) {
          setBestMagician(response.bestMagicianAchievement);
          setPvpWinsCount(response.total_wins);
        } else {
          setBestMagicianError("Failed to load Best Magician achievement");
        }
      } catch (err) {
        setBestMagicianError("Error loading Best Magician achievement");
        console.error(err);
      } finally {
        setBestMagicianLoading(false);
      }
    };

    loadBestMagician();
  }, [fetchBestMagician, user?.firebase_uid]);

  const loadAchievements = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = (await fetchAchievements(
        forceRefresh
      )) as AchievementResponse | null;

      if (response && response.data) {
        // Transform API data to match component's expected format
        const formattedAchievements = response.data.map(
          (achievement: AchievementObject) => ({
            id: achievement.achievement_id,
            name: achievement.achievement_name,
            description: achievement.achievement_description,
            progress: levelToProgress(achievement.achievement_level),
            baseImage: achievement.achievement_picture_url,
          })
        );

        // Filter out special achievements from regular achievements
        const filteredAchievements = formattedAchievements.filter(
          (achievement) => {
            // Normalize achievement name by trimming and converting to lowercase
            const name = achievement.name.trim().toLowerCase();
            return !(
              (
                name === "mystic elder" ||
                name === "wisdom collector" ||
                name === "arcane scholar" ||
                name === "battle archmage" ||
                name === "duelist" ||
                name.startsWith("duelist") || // Handle variations like "Duelist "
                name === "best magician" ||
                name.startsWith("best magician")
              ) // Handle variations like "Best Magician "
            );
          }
        );

        // Add enhanced versions if they exist
        if (mysticElder && userLevel) {
          const mysticElderResponse = await fetchMysticElder(
            user?.firebase_uid || ""
          );
          if (mysticElderResponse?.formattedAchievement) {
            filteredAchievements.unshift(
              mysticElderResponse.formattedAchievement
            );
          }
        }

        if (wisdomCollector && studyMaterialCount) {
          const wisdomCollectorResponse = await fetchWisdomCollector(
            user?.firebase_uid || ""
          );
          if (wisdomCollectorResponse?.formattedAchievement) {
            filteredAchievements.unshift(
              wisdomCollectorResponse.formattedAchievement
            );
          }
        }

        // Keep this block that always adds Arcane Scholar
        try {
          // Always attempt to fetch Arcane Scholar, regardless of count
          const arcaneScholarResponse = await fetchArcaneScholar(
            user?.firebase_uid || ""
          );
          if (arcaneScholarResponse?.formattedAchievement) {
            filteredAchievements.unshift(
              arcaneScholarResponse.formattedAchievement
            );
          }
        } catch (err) {
          console.error("Error adding Arcane Scholar achievement:", err);
        }

        try {
          // Always attempt to fetch Battle Archmage
          const battleArchmageResponse = await fetchBattleArchmage(
            user?.firebase_uid || ""
          );
          if (battleArchmageResponse?.formattedAchievement) {
            filteredAchievements.unshift(
              battleArchmageResponse.formattedAchievement
            );
          }
        } catch (err) {
          console.error("Error adding Battle Archmage achievement:", err);
        }

        try {
          // Always attempt to fetch Duelist
          const duelistResponse = await fetchDuelist(user?.firebase_uid || "");
          if (duelistResponse?.formattedAchievement) {
            filteredAchievements.unshift(duelistResponse.formattedAchievement);
          }
        } catch (err) {
          console.error("Error adding Duelist achievement:", err);
        }

        try {
          // Always attempt to fetch Best Magician
          const bestMagicianResponse = await fetchBestMagician(
            user?.firebase_uid || ""
          );
          if (bestMagicianResponse?.formattedAchievement) {
            filteredAchievements.unshift(
              bestMagicianResponse.formattedAchievement
            );
          }
        } catch (err) {
          console.error("Error adding Best Magician achievement:", err);
        }

        console.log("Formatted Achievements:", filteredAchievements);
        setAchievements(filteredAchievements);
      } else {
        setError("No achievement data received");
      }
    } catch (err) {
      setError("Failed to load achievements");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add detection for refresh parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refresh = params.get("refresh");

    if (refresh === "achievements") {
      loadAchievements(true);
    }
  }, [location]);

  useEffect(() => {
    loadAchievements();
  }, [
    fetchAchievements,
    mysticElder,
    userLevel,
    wisdomCollector,
    studyMaterialCount,
    arcaneScholar,
    completedSessionsCount,
    battleArchmage,
    pvpMatchesCount,
    duelist,
    winStreak,
    bestMagician,
    pvpWinsCount,
    fetchMysticElder,
    fetchWisdomCollector,
    fetchArcaneScholar,
    fetchBattleArchmage,
    fetchDuelist,
    fetchBestMagician,
    user?.firebase_uid,
  ]);

  // Universal getBadgeImage function that handles all achievements appropriately
  const getBadgeImage = (baseImage: string, progress: number) => {
    // Check if the image URL exists
    if (!baseImage) {
      console.warn("Missing baseImage URL");
      return ""; // Return empty or a default placeholder
    }

    // Check if this image path already has a specific suffix (-w, -b, -s, -g)
    // These are likely pre-processed by specialized achievement hooks
    const hasSuffix = baseImage.match(/-(w|b|s|g)\.png$/);

    // If it already has the correct suffix pattern, it was pre-processed by a hook
    // (like the Mystic Elder images from getMysticElder hook)
    if (hasSuffix) {
      console.log("Using pre-processed achievement image:", baseImage);
      return baseImage;
    }

    // Extract path and filename for regular achievements
    let path = "";
    let filename = baseImage;

    if (baseImage.includes("/")) {
      path = baseImage.substring(0, baseImage.lastIndexOf("/") + 1);
      filename = baseImage.substring(baseImage.lastIndexOf("/") + 1);
    }

    // Remove any existing suffix if present (unlikely since we checked above)
    const baseName = filename.replace(/-(w|b|s|g)\.png$/, "");

    // Determine suffix based on progress for regular achievements
    let suffix = "-w.png"; // Default (white/locked)
    if (progress >= 100) {
      suffix = "-g.png"; // Gold
    } else if (progress >= 60) {
      suffix = "-s.png"; // Silver
    } else if (progress >= 20) {
      suffix = "-b.png"; // Bronze
    }

    return `${path}${baseName}${suffix}`;
  };

  // Update the getOpacity function to still apply opacity for level 0
  const getOpacity = (progress: number) => {
    // Only apply opacity when progress is 0 (level 0/not started)
    if (progress === 0) return "opacity-30";
    return "";
  };

  // Simplified calculateScale function
  const calculateScale = (
    progress: number,
    achievement: FormattedAchievement
  ) => {
    // If the achievement has a pre-formatted progress text, use it
    if (achievement.progressText) {
      return achievement.progressText;
    }

    // Default behavior for standard achievements
    if (progress >= 100) return "Complete";
    if (progress >= 60) return "2/3";
    if (progress >= 20) return "1/3";
    return "0/3";
  };

  // Helper function to get achievement level based on progress
  const getAchievementLevel = (progress: number) => {
    if (progress >= 100) return "Level 3";
    if (progress >= 60) return "Level 2";
    if (progress >= 20) return "Level 1";
    return "Level 0"; // Changed from "Locked" to "Level 0"
  };

  if (loading) {
    return (
      <div className="text-white text-center p-8">Loading achievements...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  }

  return (
    <div>
      <h3 className="text-white text-2xl font-semibold mb-5">Achievements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sort achievements by progress before mapping them */}
        {[...achievements]
          .sort((a, b) => b.progress - a.progress) // Sort by descending progress
          .map((achievement) => (
            <div
              key={achievement.id}
              className="rounded-[1rem] px-7 py-8 flex flex-col items-center border-[0.2rem] border-[#3B354C]"
            >
              <img
                src={getBadgeImage(achievement.baseImage, achievement.progress)}
                alt={achievement.name}
                className={`w-24 h-24 object-contain ${getOpacity(
                  achievement.progress
                )}`}
              />
              <h4
                className={`text-lg pt-4 pb-1 font-bold text-center ${
                  achievement.progress === 0 ? "opacity-30" : ""
                }`}
              >
                {achievement.name}
              </h4>

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
                  {calculateScale(achievement.progress, achievement)}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Achievements;
