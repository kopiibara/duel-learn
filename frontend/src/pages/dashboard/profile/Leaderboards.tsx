
import React, { useState } from "react";
import GoldMedal from "../../../assets/General/gold-medal.svg";
import SilverMedal from "../../../assets/General/silver-medal.svg";
import BronzeMedal from "../../../assets/General/bronze-medal.svg";
import ProfileIcon from "../../../assets/profile-picture/kopibara-picture.png";
import Profile from "../../../assets/profile-picture/bunny-picture.png";
import "./media-queries/LeaderboardResponsive.css";

const Leaderboards = () => {
  // State for leaderboard data
  const [leaderboardData, setLeaderboardData] = useState([
    { rank: 1, name: "PeraltaMalakas", level: 24, xp: "1,500" },
    { rank: 2, name: "CJDMarunoeng", level: 24, xp: "1,200" },
    { rank: 3, name: "JingMakararig", level: 24, xp: "1,000" },
    { rank: 4, name: "SamiChan", level: 24, xp: "700" },
  ]);

  const [covenHierarchy] = useState([
    { id: 1, name: "SAMIS", xp: 553, avatar: Profile },
    { id: 2, name: "JUSTINE", xp: 400, avatar: ProfileIcon },
    { id: 3, name: "BEA", xp: 100, avatar: Profile },
    { id: 4, name: "JING009", xp: 56, avatar: ProfileIcon },
    { id: 5, name: "LUCAS", xp: 45, avatar: Profile },
    { id: 6, name: "MARIA", xp: 30, avatar: ProfileIcon },
    { id: 7, name: "ALICE", xp: 28, avatar: Profile },
    { id: 8, name: "BOB", xp: 20, avatar: ProfileIcon },
    { id: 9, name: "CARLOS", xp: 18, avatar: Profile },
    { id: 10, name: "ZOE", xp: 12, avatar: ProfileIcon },
  ]);

  // State for the number of friends
  const [numberOfFriends, setNumberOfFriends] = useState(6);

  // Medal assignment function
  const getMedal = (rank: number): string | undefined => {
    if (rank === 1) return GoldMedal;
    if (rank === 2) return SilverMedal;
    if (rank === 3) return BronzeMedal;
    return undefined;
  };

  // Placeholder function for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [selectedFilter, setSelectedFilter] = useState("Daily");

  const filters = ["Daily", "Weekly", "Monthly", "All Time"];

  return (
    <div className="mt-10">
      <h3 className="text-white text-2xl font-bold mb-5">Leaderboards</h3>

      {/* Show Leaderboard if numberOfFriends is greater than or equal to 5 */}
      {numberOfFriends >= 5 ? (
        <div className="rounded-md shadow-md border-2 border-[#6F658D]">
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center my-5 sm:my-6 md:my-7 lg:my-7  responsive-gap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`responsive-gapINSIDE px-2 sm:px-2.5 md:px-3 lg:px-5 py-1 sm:py-1.5 md:py-2 lg:py-3 uppercase  text-white rounded transition-colors duration-200 w-20 sm:w-[76px] md:w-[90px] lg:w-[166px] ${selectedFilter === filter ? "bg-[#4D1EE3]" : "bg-[#1A1625]"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {leaderboardData.map((entry, index) => (
            <div
              key={index}
              className="rank-entry"
              style={{ backgroundColor: entry.rank % 2 === 1 ? "#120F1C" : "transparent" }}
            >

              {/* Medal + Profile Pic (Grouped) */}
              <div className="rank-profile">
                {/* Medal */}
                <div className="rank-icon">
                  {getMedal(entry.rank) ? (
                    <img src={getMedal(entry.rank)} alt={`Rank ${entry.rank} Medal`} />
                  ) : (
                    <span className="rank-number mr-4 ml-4">{entry.rank}</span>
                  )}
                </div>

                {/* Profile Picture */}
                <div className="profile-icon">
                  <img src={ProfileIcon} alt="Profile" />
                </div>
              </div>

              {/* Player Name */}
              <span className="player-name">{entry.name}</span>

              {/* XP */}
              <span className="xp-text ">{entry.xp} XP</span>

              {/* Level */}
              <span className="level-text">LVL {entry.level}</span>

            </div>
          ))}



          <button
            className="w-full py-2 sm:py-2.5 md:py-3 lg:py-4 text-[#5b5277] text-md border rounded hover:bg-gray-600 hover:text-white"
            style={{
              cursor: "pointer",
              backgroundColor: "rgba(59, 53, 77, 0.25)",
              borderColor: "#6F658D",
            }}
            onClick={openModal}
          >
            VIEW MORE
          </button>
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
              backgroundColor: "rgba(59, 53, 77, 0.25)",
              borderColor: "#6F658D",
            }}
          >
            REQUEST FELLOWSHIP
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div
            className="bg-[#080511] px-6 py-8 border-[#3B354D] border rounded-lg w-full max-w-[689px] max-h-[90vh] shadow-lg flex flex-col space-y-6 items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl text-white font-semibold">Top 10 Leaderboards</h2>
            <hr className="border-t-2 border-[#363D46] w-full mb-6" />

            <div className="overflow-y-auto w-full max-h-[60vh] scrollbar-thin scrollbar-thumb-[#221d35] scrollbar-track-transparent space-y-4">
              {covenHierarchy.map((member, index) => (
                <div key={member.id} className="flex items-center justify-between px-7">
                  <div className="flex items-center space-x-4">
                    {index < 3 ? (
                      <img src={getMedal(index + 1)} alt="Medal" className="w-8 h-8 mr-3" />
                    ) : (
                      <p className="text-lg ml-3 mr-[22px] font-semibold text-white">{index + 1}</p>
                    )}
                    <img src={member.avatar} alt="Avatar" className="w-12 h-12 rounded-[5px] object-cover" />
                    <p className="font-medium text-white">{member.name}</p>
                  </div>
                  <p className="text-gray-400">{member.xp} XP</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Leaderboards;
