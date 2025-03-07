import { useState, useEffect } from "react";
import { Box, Stack, CircularProgress } from "@mui/material";
import GoldMedal from "../../../assets/General/gold-medal.svg";
import SilverMedal from "../../../assets/General/silver-medal.svg";
import BronzeMedal from "../../../assets/General/bronze-medal.svg";
import axios from "axios";
import { useUser } from "../../../contexts/UserContext"; // Import your auth context
import defaultAvatar from "../../../assets/profile-picture/bunny-picture.png";

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

  const getDefaultAvatar = () => "/default-avatar.png"; // Replace with your default avatar path

  return (
    <Box className="rounded-[1rem] shadow-md border-[3px] border-[#3B354C]">
      <div className="px-8 pt-8 pb-5">
        <div className="pl-1 flex flex-row items-center mb-5 gap-4">
          <img
            src="/leaderboard.png"
            className="w-[37px] h-[35px]"
            alt="icon"
          />
          <h2 className="text-[1.1rem] text-[#FFFFFF] font-semibold">
            Leaderboards
          </h2>
        </div>

        <hr className="border-t-2 border-[#3B354D] mb-7" />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No friends found. Add friends to see your leaderboard!
          </div>
        ) : (
          leaderboardData.slice(0, 3).map((player) => (
            <div
              key={player.firebase_uid}
              className={`flex items-center justify-between mb-4 ${
                player.isCurrentUser ? "bg-[#221f2e] rounded-lg px-6 py-4" : ""
              }`}
            >
              <div className="flex items-center">
                {player.rank <= 3 ? (
                  <img
                    src={getMedal(player.rank)}
                    alt={`Rank ${player.rank}`}
                    className="w-8 h-8 mr-5"
                  />
                ) : (
                  <p className="text-[1rem] font-semibold ml-3 mr-7">
                    {player.rank}
                  </p>
                )}
                <img
                  src={player.display_picture || defaultAvatar}
                  alt="Avatar"
                  className="w-12 h-12 rounded-[5px] object-cover mr-3"
                />
                <p
                  className={`font-[0.6rem] ${
                    player.isCurrentUser ? "text-[#A38CE6]" : ""
                  }`}
                >
                  {player.username}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#E2DDF3]">{player.exp} XP</p>
                <p className="text-sm text-[#9F9BAE] w-full">
                  Level {player.level}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View More Button */}
      <Stack
        direction={"row"}
        spacing={1}
        className="flex justify-center bg-[#120F1C] py-6 px-4 border-t-[3px] rounded-b-[0.8rem] border-[#3B354C]"
      >
        <p
          className={`${
            leaderboardData.length > 3
              ? "text-[#3B354D] hover:text-[#A38CE6] cursor-pointer transition-colors font-bold"
              : "text-[#232029] cursor-not-allowed font-bold"
          }`}
          onClick={() => leaderboardData.length > 5 && setIsModalOpen(true)}
        >
          VIEW MORE
        </p>
      </Stack>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#080511] px-6 py-8 border-[#3B354D] border rounded-lg w-full max-w-[689px] max-h-[90vh] shadow-lg flex flex-col space-y-6 items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl text-white font-semibold">
              Friend Leaderboard
            </h2>
            <hr className="border-t-2 border-[#363D46] w-full mb-6" />
            <div className="overflow-y-auto w-full max-h-[40vh] scrollbar-thin scrollbar-thumb-[#221d35] scrollbar-track-transparent space-y-4">
              {leaderboardData.map((player) => (
                <div
                  key={player.firebase_uid}
                  className={`flex items-center justify-between w-full px-6 mb-4 ${
                    player.isCurrentUser ? "bg-[#221f2e] rounded-lg p-2" : ""
                  }`}
                >
                  <div className="flex items-center">
                    {player.rank <= 3 ? (
                      <img
                        src={getMedal(player.rank)}
                        alt={`Rank ${player.rank}`}
                        className="w-8 h-8 mr-5"
                      />
                    ) : (
                      <p className="text-lg font-semibold ml-3 mr-7">
                        {player.rank}
                      </p>
                    )}
                    <img
                      src={player.display_picture || getDefaultAvatar()}
                      alt="Avatar"
                      className="w-12 h-12 rounded-[5px] object-cover mr-3"
                    />
                    <p
                      className={`font-medium ${
                        player.isCurrentUser ? "text-[#A38CE6]" : ""
                      }`}
                    >
                      {player.username}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">{player.exp} XP</p>
                    <p className="text-sm text-gray-500">
                      Level {player.level}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-6 bg-[#4D1EE3] text-white px-6 py-2 rounded-md hover:bg-[#3B1BC9]"
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
