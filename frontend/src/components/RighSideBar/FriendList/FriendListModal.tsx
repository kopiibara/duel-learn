import React, { useEffect } from "react";
import CloseIcon from "@mui/icons-material/CancelOutlined";
import YourFriends from "./Modals/YourFriends";
import FriendRequests from "./Modals/FriendRequest";
import FindFriends from "./Modals/FindFriends";
import ModalIconFriendList from "../../../assets/General/ModalFriendList.png";
import { Box, Tooltip, IconButton } from "@mui/material";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onFriendRequestHandled?: () => void; // New prop
  setActiveTab: (tab: string) => void; // Function to update active tab in the parent
  fromPVPLobby?: boolean; // New prop to indicate if opened from PVPLobby
}

const FriendListModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onFriendRequestHandled,
  fromPVPLobby = false, // Default to false
}) => {
  useEffect(() => {
    if (fromPVPLobby) {
      setActiveTab("YOUR FRIENDS"); // Force "YOUR FRIENDS" tab when from PVP
    }
  }, [fromPVPLobby, setActiveTab]);

  if (!isOpen) return null;

  return (
    <Box className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      {/* Backdrop */}
      <Box className="absolute inset-0" onClick={onClose}></Box>

      {/* Modal */}
      <div
        className="bg-[#080511] border-[#3B354D] border rounded-[1rem] w-[689px] h-[639px] max-w-full p-5 sm:p-5 md:p-9 relative flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        {/* Close Button */}
        <Tooltip
          title="Close"
          enterDelay={100}
          arrow
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -12],
                  },
                },
              ],
            },
          }}
        >
          <IconButton
            onClick={onClose}
            className="self-end hover:scale-110 transition-all duration-300"
          >
            <CloseIcon className="text-[#6F658D]" fontSize="large" />
          </IconButton>
        </Tooltip>

        <div className="w-full mb-8 flex justify-center">
          <img src={ModalIconFriendList} className="w-16" alt="Friend List" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center border-gray-600 mb-5">
          <button
            onClick={() => setActiveTab("YOUR FRIENDS")}
            className={`flex-1 py-2 text-[0.95rem] font-bold text-center  ${
              activeTab === "YOUR FRIENDS"
                ? "text-[#E2DDF3] border-b-2 border-[#E2DDF3] "
                : "text-[#6F658D] hover:text-[#E2DDF3]"
            }`}
          >
            YOUR FRIENDS
          </button>

          {fromPVPLobby ? null : (
            <>
              <button
                onClick={() => setActiveTab("FRIEND REQUESTS")}
                className={`flex-1 py-2 text-[0.95rem] font-bold text-center ${
                  activeTab === "FRIEND REQUESTS"
                    ? "text-[#E2DDF3] border-b-2 border-[#E2DDF3] "
                    : "text-[#6F658D] hover:text-[#E2DDF3]"
                }`}
              >
                FRIEND REQUESTS
              </button>
              <button
                onClick={() => setActiveTab("FIND FRIENDS")}
                className={`flex-1 py-2 text-[0.95rem] font-bold text-center ${
                  activeTab === "FIND FRIENDS"
                    ? "text-[#E2DDF3] border-b-2 border-[#E2DDF3] "
                    : "text-[#6F658D] hover:text-[#E2DDF3]"
                }`}
              >
                FIND FRIENDS
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-5 rounded-md overflow-y-auto max-h-[360px] scrollbar-thin scrollbar-thumb-[#221d35] scrollbar-track-transparent">
          {activeTab === "YOUR FRIENDS" && <YourFriends />}
          {fromPVPLobby ? null : (
            <>
              {!fromPVPLobby && activeTab === "FRIEND REQUESTS" && (
                <FriendRequests
                  onFriendRequestHandled={onFriendRequestHandled}
                />
              )}
              {!fromPVPLobby && activeTab === "FIND FRIENDS" && <FindFriends />}
            </>
          )}
        </div>
      </div>
    </Box>
  );
};

export default FriendListModal;
