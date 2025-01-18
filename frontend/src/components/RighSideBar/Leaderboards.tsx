import React, { useState } from "react";
import Profile from "../../assets/profile-picture/bunny-picture.png";
import ProfileIcon from "../../assets/profile-picture/kopibara-picture.png";

const Leaderboards = () => {
  const [covenHierarchy] = useState([
    { id: 1, name: "SAMIS", xp: 553, avatar: Profile },
    { id: 2, name: "JUSTINE", xp: 400, avatar: ProfileIcon },
    { id: 3, name: "BEA", xp: 100, avatar: Profile },
    { id: 4, name: "JING009", xp: 56, avatar: ProfileIcon },
  ]);

  return (
    <div
      className="rounded-md shadow-md border-3"
      style={{ borderColor: "#3B354C", borderWidth: "3px" }}
    >
      <div className="px-8 pt-8 ">
        <div className="flex flex-row items-center mb-5">
          <div className="bg-white w-9 h-9 rounded mr-3"></div>
          <h2 className="text-xl text-[#FFFFFF] font-semibold">Leaderboards</h2>
        </div>
        <hr className="border-t-1 border-[#ffffff] mb-7" />
        {covenHierarchy.map((member, index) => (
          <div key={member.id} className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              {index >= 3 && <p className="text-lg font-semibold mr-3">{index + 1}</p>}
              <div
                className={`relative ${index >= 3 ? "w-10 h-10" : "w-12 h-12"} mr-3`}
              >
                <img
                  src={member.avatar}
                  alt="Avatar"
                  className={`w-full h-full rounded-[5px] ${index >= 3 ? "object-contain" : ""}`}
                />
              </div>
              <p className="font-medium">{member.name}</p>
            </div>
            <p className="text-gray-400">{member.xp} XP</p>
          </div>
        ))}
      </div>
      <button
        style={{ borderColor: "#3B354C", borderWidth: "1px" }}
        className="w-full p-4 text-[#48405f] bg-[#120F1C] text-center"
      >
        REQUEST FELLOWSHIP
      </button>
    </div>
  );
};

export default Leaderboards;
