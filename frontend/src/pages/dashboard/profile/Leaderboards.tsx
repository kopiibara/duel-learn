import React, { useState } from "react";

const Leaderboards = () => {
  // State for leaderboard data
  const [leaderboardData, setLeaderboardData] = useState([
    {
      rank: 1,
      name: "PeraltaMalakas",
      level: 24,
      xp: "1,500 XP",
      badge: "/assets/gold-medal.svg",
    },
    {
      rank: 2,
      name: "CJDMarunoeng",
      level: 24,
      xp: "1,200 XP",
      badge: "/assets/silver-medal.svg",
    },
    {
      rank: 3,
      name: "JingMakararig",
      level: 24,
      xp: "1,000 XP",
      badge: "/assets/bronze-medal.svg",
    },
    { rank: 4, name: "SamiChan", level: 24, xp: "700 XP", badge: null },
    { rank: 5, name: "Beabadudi", level: 24, xp: "500 XP", badge: null },
  ]);

  // State for the number of friends
  const [numberOfFriends, setNumberOfFriends] = useState(4); // Example value, can be updated dynamically

  return (
    <div className="mt-10">
      <h3 className="text-white text-2xl font-bold mb-5">Leaderboards</h3>

      {/* Show Leaderboard if numberOfFriends is greater than or equal to 5 */}
      {numberOfFriends >= 5 ? (
        <div className="rounded-lg shadow-md">
          {leaderboardData.map((entry, index) => (
            <div
              key={index}
              style={{ border: "1px solid #6F658D" }}
              className="flex items-center justify-between px-8 py-7 rounded-md mb-3 last:mb-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center mr-9">
                  {entry.badge ? (
                    <img
                      src={entry.badge}
                      alt={`Rank ${entry.rank}`}
                      className="w-full h-full"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">
                      {entry.rank}
                    </span>
                  )}
                </div>
                <div className="bg-gray-300 mr-8 w-14 h-14 rounded"></div>
                <span className="text-white font-medium">{entry.name}</span>
              </div>
              <div className="flex items-center gap-20">
                <span className="text-gray-400">LVL {entry.level}</span>
                <span className="text-white font-bold">{entry.xp}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show "No Friends More Than 5" section if numberOfFriends is less than 5
        <div
          className="mt-10 flex flex-col items-center justify-center border rounded-sm"
          style={{ border: "1px solid #6F658D" }}
        >
          <div className="flex flex-col items-center justify-center px-10 py-14">
            <div className="bg-gray-300 w-24 h-24 rounded"></div>
            <p className="text-center w-[300px] text-gray-400 mt-8">
              Add more friends to unlock the Leaderboards and compete with them
              for the top spot!
            </p>
          </div>
          <button
            className="w-full py-2 text-[#5b5277] border rounded hover:bg-gray-600 hover:text-white"
            style={{
              cursor: "pointer",
              backgroundColor: "rgba(59, 53, 77, 0.25)", // 25% opacity for background
              borderColor: "#6F658D", // Solid border color
            }}
          >
            REQUEST FELLOWSHIP
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboards;
