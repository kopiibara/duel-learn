import React, { useState } from "react";
import Profile from "../../assets/profile-picture/bunny-picture.png";
import ProfileIcon from "../../assets/profile-picture/kopibara-picture.png";

const FriendRequests = () => {
  const [covenInvitations] = useState([
    { id: 1, name: "PERALTA08", level: 1, avatar: Profile },
    { id: 2, name: "KOPIBARA", level: 6, avatar: ProfileIcon },
  ]);

  return (
    <div
      className="rounded-md shadow-md mb-6 border-3"
      style={{ borderColor: "#3B354C", borderWidth: "3px" }}
    >
      <div className="px-8 pt-8 pb-5">
        <div className="flex flex-row items-center mb-5">
          <div className="bg-white w-9 h-8 rounded mr-3"></div>
          <h2 className="text-xl text-[#FFFFFF] font-semibold">Friend Requests</h2>
        </div>
        <hr className="border-t-1 border-[#ffffff] mb-7" />
        {covenInvitations.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                src={invite.avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-[5px] mr-6"
              />
              <div>
                <p className="font-medium">{invite.name}</p>
                <p className="text-sm text-gray-400">LVL {invite.level}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="bg-[#57A64E] py-2 px-5 rounded-md text-xs text-white">✔</button>
              <button className="bg-[#A34549] py-2 px-5 rounded-md text-xs text-white">✖</button>
            </div>
          </div>
        ))}
      </div>
      <button
        style={{ borderColor: "#3B354C", borderWidth: "1px" }}
        className="w-full p-4 text-[#48405f] bg-[#120F1C] text-center"
      >
        VIEW ALL
      </button>
    </div>
  );
};

export default FriendRequests;
