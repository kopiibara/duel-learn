import { useState, useEffect } from "react";
import { Box, Stack, CircularProgress } from "@mui/material";
import GoldMedal from "../../../assets/General/gold-medal.svg";
import SilverMedal from "../../../assets/General/silver-medal.svg";
import BronzeMedal from "../../../assets/General/bronze-medal.svg";
import axios from "axios";
import { useUser } from "../../../contexts/UserContext"; // Import your auth context
import defaultPicture from "../../../assets/profile-picture/default-picture.svg";

interface LeaderboardPlayer {
  firebase_uid: string;
  username: string;
  level: number;
  exp: number;
  display_picture: string;
  isCurrentUser: boolean;
  rank: number;
}

const Leaderboards = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser(); // Get the current user from your auth context

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!user?.firebase_uid) {
        setLoading(false);
        return;
      }

      // Update the try-catch block in fetchLeaderboardData with better type handling:

      try {
        setLoading(true);

        // Debug the API URL
        const apiUrl = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/friend/leaderboard/${user.firebase_uid}`;
        console.log("Fetching from:", apiUrl);

        const response = await axios.get(apiUrl);
        console.log("API Response type:", typeof response.data);
        console.log("API Response:", response.data);

        if (response.data === null || response.data === undefined) {
          console.error("API returned null or undefined");
          setLeaderboardData([]);
          setError("No data received from server");
          return;
        }

        // Handle string response - try to parse it as JSON if possible
        if (typeof response.data === "string") {
          console.error("API returned string instead of array:", response.data);
          try {
            // Try to parse it as JSON
            const parsedData = JSON.parse(response.data);
            if (Array.isArray(parsedData)) {
              console.log("Successfully parsed string as JSON array");

              // Add rank if missing
              const dataWithRank = parsedData.map((player, index) => ({
                ...player,
                rank: player.rank || index + 1,
              }));

              setLeaderboardData(dataWithRank);
              setError(null);
              return;
            }
          } catch (jsonError) {
            console.error("Failed to parse response as JSON:", jsonError);
          }

          // If we got here, string wasn't valid JSON array
          setLeaderboardData([]);
          setError(
            `Server returned text instead of data: ${response.data.substring(
              0,
              50
            )}...`
          );
          return;
        }

        // Continue with existing array handling logic
        // Continue with existing array handling logic
        if (Array.isArray(response.data)) {
          console.log("Processing array data:", response.data.length, "items");
          // Add rank if not already present
          const dataWithRank = response.data.map((player, index) => ({
            ...player,
            rank: player.rank || index + 1,
          }));

          setLeaderboardData(dataWithRank);
          setError(null);
        } else if (
          typeof response.data === "object" &&
          response.data !== null
        ) {
          console.error(
            "Response is an object but not an array:",
            response.data
          );
          setLeaderboardData([]);
          setError("Invalid data format: expected array but got object");
        } else {
          console.error("Unexpected response format:", typeof response.data);
          setLeaderboardData([]);
          setError(
            `Invalid data format: expected array but got ${typeof response.data}`
          );
        }
      } catch (err) {
        // Your existing error handling...
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [user]);

  // Medal assignment function
  const getMedal = (rank: number): string | undefined => {
    if (rank === 1) return GoldMedal;
    if (rank === 2) return SilverMedal;
    if (rank === 3) return BronzeMedal;
    return undefined;
  };

  // New function to render a player item
  const renderPlayerItem = (
    player: LeaderboardPlayer,
    showBackground = true
  ) => {
    return (
      <div
        key={player.firebase_uid}
        className={`flex items-center justify-between mb-4 w-full ${
          showBackground && player.isCurrentUser
            ? "bg-[#221f2e] rounded-lg px-[1vw] py-[1vh]"
            : ""
        }`}
      >
        {/* Left side with rank, avatar and username */}
        <div className="flex items-center min-w-0 flex-1">
          {/* Rank indicator - fixed width container */}
          <div className="flex-shrink-0 w-[2vw] min-w-[24px] flex justify-center mr-[1vw]">
            {player.rank <= 3 ? (
              <img
                src={getMedal(player.rank)}
                alt={`Rank ${player.rank}`}
                className="w-[2vw] h-[2vw] min-w-[24px] min-h-[24px]"
              />
            ) : (
              <p className="text-[1.8vh] font-semibold text-center">
                {player.rank}
              </p>
            )}
          </div>

          {/* Avatar with fixed dimensions */}
          <div className="flex-shrink-0 mr-[0.8vw]">
            <img
              src={player.display_picture || defaultPicture}
              alt="Avatar"
              className="min-w-[44px] w-[2.7vw] max-w-[60px] h-auto rounded-[5px] object-cover"
            />
          </div>

          {/* Username with truncation */}
          <p className={`truncate text-[1.8vh] ${player.isCurrentUser}`}>
            {player.username}
          </p>
        </div>

        {/* Right side with level and XP - now properly pushed to the right edge */}
        <div className="flex-shrink-0 flex items-center gap-[0.5vw] ml-2">
          <p className="text-[1.4vh] truncate whitespace-nowrap text-[#9F9BAE]">
            Level {player.level}
          </p>
          <p className="text-[#9F9BAE] text-[1.5vh]">•</p>
          <p className="text-[1.4vh] truncate whitespace-nowrap text-[#9F9BAE]">
            EXP {player.exp}
          </p>
        </div>
      </div>
    );
  };

  // Find current user
  const currentUser = leaderboardData.find((player) => player.isCurrentUser);

  // Get top 3 players
  const top3Players = leaderboardData.filter((player) => player.rank <= 3);

  return (
    <Box className="rounded-[1rem] shadow-md border-[0.2rem] border-[#3B354C]">
      <div className="px-[1.5vw] pt-[3vh] pb-[1vh]">
        <div className="pl-[0.5vw] flex flex-row items-center mb-[2vh] gap-[1vw]">
          <img
            src="/leaderboard.png"
            className="min-w-[40px] w-[2.2vw] max-w-[56px] h-auto"
            alt="icon"
          />
          <h2 className="text-[clamp(1rem,1vw,2rem)]  font-semibold">
            Leaderboards
          </h2>
        </div>

        <hr className="border-t-2 border-[#3B354D] mb-[2vh] rounded-full" />

        {loading ? (
          <div className="flex justify-center items-center h-[30vh]">
            <CircularProgress />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-[2vh]">{error}</div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center text-gray-400 py-[2vh]">
            No friends found. Add friends to see your leaderboard!
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Top 3 Players - always without background styling */}
            {top3Players.map((player) => renderPlayerItem(player, false))}

            {/* Always add separator and current user with background styling */}
            {currentUser && (
              <>
                <hr className="border-t-2 border-[#3B354D] mb-[2vh] rounded-full" />
                {renderPlayerItem(currentUser, true)}
              </>
            )}
          </div>
        )}
      </div>

      {/* Rest of the component remains the same */}
      <Stack
        direction={"row"}
        spacing={1}
        className="flex justify-center bg-[#120F1C] py-[2vh] px-[2vw] border-t-[0.2rem] rounded-b-[0.8rem] border-[#3B354C]"
      >
        <p
          className={`text-[1.7vh] ${
            leaderboardData.length > 3
              ? "text-[#3B354D] hover:text-[#A38CE6] cursor-pointer transition-colors font-bold"
              : "text-[#232029] cursor-not-allowed font-bold"
          }`}
          onClick={() => leaderboardData.length > 3 && setIsModalOpen(true)}
        >
          VIEW MORE
        </p>
      </Stack>

      {/* Modal remains the same */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#080511] px-[3vw] py-[3vh] border-[#3B354D] border rounded-[0.8rem] w-full max-w-[80vw] max-h-[90vh] shadow-lg flex flex-col space-y-[2vh] items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[2.5vh] text-white font-semibold">
              Friend Leaderboard
            </h2>
            <hr className="border-t-2 border-[#363D46] w-full mb-[2vh]" />
            <div className="overflow-y-auto w-full max-h-[40vh] scrollbar-thin scrollbar-thumb-[#221d35] scrollbar-track-transparent space-y-[1.5vh]">
              {leaderboardData.map((player) => renderPlayerItem(player))}
            </div>
            <button
              className="mt-[2vh] bg-[#4D1EE3] text-white px-[2vw] py-[1.5vh] rounded-md hover:bg-[#3B1BC9] text-[1.8vh]"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Box>
  );
};

export default Leaderboards;
