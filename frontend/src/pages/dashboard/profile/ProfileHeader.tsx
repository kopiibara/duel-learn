import { useState, useEffect, useCallback } from "react";
import Profile from "../../../assets/profile-picture/default-picture.svg";
import PremiumLabel from "../../../assets/premium-star.png";
import axios from "axios";
import { UserInfo } from "../../../types/userInfoObject";
import { useUser } from "../../../contexts/UserContext";
import {
  getCurrentLevel,
  DEFAULT_LEVELS,
} from "../../../types/levelRequiredObject";
import RefreshIcon from "@mui/icons-material/Refresh";

const ProfileHeader = () => {
  const { user, refreshUserData } = useUser();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [profileData, setProfileData] = useState({
    username: "Loading...",
    level: "Loading...",
    xp: "Loading...",
    xpRequired: 200,
    xpToNextLevel: 200,
    friendsCount: 0,
    xpProgress: 0,
  });
  const [accountType, setAccountType] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract fetchUserInfo to be reusable
  const fetchUserInfo = useCallback(async () => {
    if (!user?.firebase_uid) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user-info/details/${
          user.firebase_uid
        }`
      );
      setUserInfo(response.data.user);
      // Also update the accountType when we get userInfo
      setAccountType(response.data.user.account_type);
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, [user?.firebase_uid, setLoading, setError]);

  // Fetch user info from the API on component mount
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Fetch friend count
  const fetchFriendCount = useCallback(async () => {
    if (!user?.firebase_uid) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/friend/friend-count/${
          user.firebase_uid
        }`
      );
      setFriendsCount(response.data.count);
    } catch (err) {
      console.error("Error fetching friend count:", err);
    }
  }, [user?.firebase_uid]);

  // Initial fetch of friend count
  useEffect(() => {
    fetchFriendCount();

    // Set up polling for real-time updates (every 10 seconds)
    const interval = setInterval(() => {
      fetchFriendCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchFriendCount]);

  // Update profile data when userInfo changes and check for level up
  useEffect(() => {
    if (userInfo) {
      const totalXp = userInfo.exp || 0;
      const currentLevel = getCurrentLevel(totalXp);
      const databaseLevel = userInfo.level || 1;

      // Check if the calculated level is higher than the stored level
      if (currentLevel > databaseLevel) {
        // User has leveled up, update database
        updateUserLevel(user?.firebase_uid, currentLevel);
      }

      // Find the level requirement objects for current and next level
      const currentLevelObj = DEFAULT_LEVELS.find(
        (l) => l.level === currentLevel
      );
      const nextLevelObj = DEFAULT_LEVELS.find(
        (l) => l.level === currentLevel + 1
      );

      if (currentLevelObj && nextLevelObj) {
        // Calculate XP progress
        const xpInCurrentLevel = totalXp - currentLevelObj.totalExpRequired;
        const xpToNextLevel =
          nextLevelObj.totalExpRequired - currentLevelObj.totalExpRequired;
        const progress = (xpInCurrentLevel / xpToNextLevel) * 100;

        setProfileData({
          username: userInfo.username || "User",
          level: currentLevel.toString(),
          xp: totalXp.toString(),
          xpRequired: nextLevelObj.totalExpRequired,
          xpToNextLevel: xpToNextLevel,
          friendsCount: friendsCount, // Use the friends count from state
          xpProgress: progress,
        });
      }
    }
  }, [userInfo, user?.firebase_uid, friendsCount]);

  // Function to update user level in database
  const updateUserLevel = async (
    firebase_uid: string | undefined,
    newLevel: number
  ) => {
    if (!firebase_uid) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user-info/update-level`,
        {
          firebase_uid,
          level: newLevel,
        }
      );

      // Update local userInfo with new level
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          level: newLevel,
        });
      }

      console.log(`User leveled up to level ${newLevel}!`);

      // You could add a toast notification or animation here to celebrate the level up
    } catch (error) {
      console.error("Failed to update user level:", error);
    }
  };

  // Function to handle refresh action
  const handleRefresh = async () => {
    if (isRefreshing || !user?.firebase_uid) return;
    
    setIsRefreshing(true);
    
    try {
      // First refresh the user data in UserContext
      await refreshUserData();
      
      // Then refresh profile-specific data
      await fetchUserInfo();
      await fetchFriendCount();
    } catch (error) {
      console.error("Error refreshing profile data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      className="rounded-[1rem] px-6 md:px-14 py-9 flex flex-col md:flex-row items-center md:items-start text-center md:text-left mb-9"
      style={{
        backgroundColor: "rgba(61, 56, 76, 0.25)",
        border: "1px solid rgba(61, 56, 76, 0.25)",
      }}
    >
      {/* Avatar */}
      <div className="sm:self-center md:self-start mb-6 md:mb-0 md:mr-6">
        <img
          src={userInfo?.display_picture || Profile}
          alt="Profile Avatar"
          className="w-[158px] h-[158px] rounded-sm"
        />
      </div>

      {/* Profile Info */}
      <div className="flex-1">
        <div className="flex justify-center md:justify-start items-center">
          <h2 className="text-[30px] font-bold mr-3 text-[#E2DDF3]">
            {profileData.username}
          </h2>
          {accountType === "premium" && (
            <img
              src={PremiumLabel}
              alt="Profile Premium Icon"
              className="w-[15px] h-auto rounded-sm"
            />
          )}
          
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-auto bg-[#3D384C] hover:bg-[#514869] p-2 rounded-full transition-colors"
            title="Refresh profile data"
          >
            <RefreshIcon 
              className={`text-[#E2DDF3] transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
              fontSize="small"
            />
          </button>
        </div>
        <div className="flex justify-center md:justify-between">
          <p className="text-[#9F9BAE] text-[16px">Level {profileData.level}</p>
          <p className="text-[#9F9BAE] text-[13px] mt-1 md:ml-2">
            {profileData.xp} / {profileData.xpRequired} XP
          </p>
        </div>

        {/* XP Progress Bar */}
        <div className="relative w-full bg-[#3E3E50] h-[6px] rounded-full mt-2">
          <div
            className="absolute top-0 left-0 bottom-0 h-[6px] bg-[#2B00FF] rounded-full"
            style={{ width: `${profileData.xpProgress}%` }}
          ></div>
        </div>

        {/* Friends */}
        <p className="text-[#9F9BAE] text-[16px] mt-12">
          <span className="font-bold">{friendsCount}</span>{" "}
          {friendsCount === 1 ? "Friend" : "Friends"}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
