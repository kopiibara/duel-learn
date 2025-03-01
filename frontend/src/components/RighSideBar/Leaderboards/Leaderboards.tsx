import React, { useState } from "react";
import { Box, Stack, Button } from "@mui/material";
import Profile from "../../../assets/profile-picture/bunny-picture.png";
import ProfileIcon from "../../../assets/profile-picture/kopibara-picture.png";
import GoldMedal from "../../../assets/General/gold-medal.svg";
import SilverMedal from "../../../assets/General/silver-medal.svg";
import BronzeMedal from "../../../assets/General/bronze-medal.svg";

const filters = ["Daily", "Weekly", "Monthly", "All Time"];

const Leaderboards = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Daily");

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

  // Medal assignment function
  const getMedal = (rank: number): string | undefined => {
    if (rank === 1) return GoldMedal;
    if (rank === 2) return SilverMedal;
    if (rank === 3) return BronzeMedal;
    return undefined;
  };

  return (
    <Box className="rounded-[1rem] shadow-md border-[3px] border-[#3B354C]">
      <div className="px-8 pt-8 pb-5">
        <div className="pl-1 flex flex-row items-center mb-5 gap-4">
          <img
            src="/leaderboard.png"
            className="w-[37px] h-[35px]"
            alt="icon"
          />
          <h2 className="text-xl text-[#FFFFFF] font-semibold">Leaderboards</h2>
        </div>

        <hr className="border-t-2 border-[#3B354D] mb-7" />

        {covenHierarchy.slice(0, 5).map((member, index) => (
          <div
            key={member.id}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center">
              {index < 3 ? (
                <img
                  src={getMedal(index + 1)}
                  alt="Medal"
                  className="w-8 h-8 mr-5"
                />
              ) : (
                <p className="text-lg font-semibold ml-3 mr-7">{index + 1}</p>
              )}
              <img
                src={member.avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-[5px] object-cover mr-3"
              />
              <p className="font-medium">{member.name}</p>
            </div>
            <p className="text-gray-400">{member.xp} XP</p>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <Stack
        direction={"row"}
        spacing={1}
        className="flex justify-center bg-[#120F1C] py-6 px-4 border-t-[3px] rounded-b-[0.8rem] border-[#3B354C]"
      >
        <p
          className="text-[#3B354D] hover:text-[#A38CE6] cursor-pointer transition-colors font-bold"
          onClick={() => setIsModalOpen(true)}
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
              Top 10 Leaderboards
            </h2>
            <hr className="border-t-2 border-[#363D46] w-full mb-6" />
            <div className="overflow-y-auto w-full max-h-[40vh] scrollbar-thin scrollbar-thumb-[#221d35] scrollbar-track-transparent space-y-4">
              {covenHierarchy.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between w-full px-6 mb-4"
                >
                  <div className="flex items-center">
                    {index < 3 ? (
                      <img
                        src={getMedal(index + 1)}
                        alt="Medal"
                        className="w-8 h-8 mr-5"
                      />
                    ) : (
                      <p className="text-lg font-semibold ml-3 mr-7">
                        {index + 1}
                      </p>
                    )}
                    <img
                      src={member.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-[5px] object-cover mr-3"
                    />
                    <p className="font-medium">{member.name}</p>
                  </div>
                  <p className="text-gray-400">{member.xp} XP</p>
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
