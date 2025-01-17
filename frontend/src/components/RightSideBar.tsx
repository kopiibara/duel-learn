import { useState } from "react";
import Profile from "../assets/profile-picture/bunny-picture.png";
import ProfileIcon from "../assets/profile-picture/kopibara-picture.png";

const RightSideBar = () => {
  // State to manage dynamic data
  const [covenInvitations] = useState([
    { id: 1, name: "PERALTA08", level: 1, avatar: Profile },
    { id: 2, name: "KOPIBARA", level: 6, avatar: ProfileIcon },
  ]);

  const [covenHierarchy] = useState([
    { id: 1, name: "SAMIS", xp: 553, avatar: Profile },
    { id: 2, name: "JUSTINE", xp: 400, avatar: ProfileIcon },
    { id: 3, name: "BEA", xp: 100, avatar: Profile },
    { id: 4, name: "JING009", xp: 56, avatar: ProfileIcon },
  ]);

  return (
    <>
      <style>
        {`
          @media (min-width: 768px) and (max-width: 1323px) {
            .side-list-navi {
              display: none;
            }
          }
        `}
      </style>
      <div className="hidden side-list-navi pr-8 lg:block sm:w-[20rem] md:w-[24rem] lg:w-[28rem] p-4 flex-shrink-0">
        {/* Coven Invitation */}
        <div
          className="rounded-lg shadow-md mb-6 border-3"
          style={{ borderColor: "#3B354C", borderWidth: "3px" }}
        >
          <div className="px-8 pt-8 pb-5">
            <h2 className="text-lg font-semibold mb-4">Coven Invitation</h2>
            <hr className="border-t-1 border-[#ffffff] mb-7" />
            {covenInvitations.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between mb-4"
              >
                <div className="flex items-center">
                  <img
                    src={invite.avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-[5px] mr-3"
                  />
                  <div>
                    <p className="font-medium">{invite.name}</p>
                    <p className="text-sm text-gray-400">LVL {invite.level}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 py-3 px-4 rounded-full text-xs text-white">
                    ✔
                  </button>
                  <button className="bg-red-600 py-3 px-4 rounded-full text-xs text-white">
                    ✖
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            style={{ borderColor: "#3B354C", borderWidth: "1px" }}
            className="w-full p-4 bg-[#120F1C] text-center text-gray-400"
          >
            VIEW ALL COVEN INVITATION
          </button>
        </div>

        {/* Coven Hierarchy */}
        <div
          className="rounded-lg shadow-md border-3"
          style={{ borderColor: "#3B354C", borderWidth: "3px" }}
        >
          <div className="px-8 pt-8 pb-5">
            <h2 className="text-lg font-semibold mb-4">Coven’s Hierarchy</h2>
            <hr className="border-t-1 border-[#ffffff] mb-7" />
            {covenHierarchy.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between mb-4"
              >
                <div className="flex items-center">
                  {/* Rank Text for 4th and Below */}
                  {index >= 3 && (
                    <p className="text-lg font-semibold mr-3">{index + 1}</p>
                  )}
                  {/* Profile Picture */}
                  <div
                    className={`relative ${
                      index >= 3 ? "w-8 h-8" : "w-10 h-10"
                    } mr-3`}
                  >
                    <img
                      src={member.avatar}
                      alt="Avatar"
                      className={`w-full h-full rounded-[5px] ${
                        index >= 3 ? "object-contain" : ""
                      }`}
                    />
                    {/* Medal for Top 3 */}
                    {index === 0 && (
                      <img
                        alt="Gold Medal"
                        className="absolute bottom-0 left-0 w-6 h-6"
                      />
                    )}
                    {index === 1 && (
                      <img
                        alt="Silver Medal"
                        className="absolute bottom-0 left-0 w-6 h-6"
                      />
                    )}
                    {index === 2 && (
                      <img
                        alt="Bronze Medal"
                        className="absolute bottom-0 left-0 w-6 h-6"
                      />
                    )}
                  </div>
                  {/* Name */}
                  <p className="font-medium">{member.name}</p>
                </div>
                {/* XP */}
                <p className="text-gray-400">{member.xp} XP</p>
              </div>
            ))}
          </div>
          <button
            style={{ borderColor: "#3B354C", borderWidth: "3px" }}
            className="w-full bg-[#120F1C] p-4 text-center text-gray-400 mt-2"
          >
            REQUEST FELLOWSHIP
          </button>
        </div>
      </div>
    </>
  );
};

export default RightSideBar;
