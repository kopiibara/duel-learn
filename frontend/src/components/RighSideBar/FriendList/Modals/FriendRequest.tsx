import React, { useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { usePendingFriendRequests } from "../../../../hooks/friends.hooks/usePendingFriendRequests";
import { useFriendList } from "../../../../hooks/friends.hooks/useFriendList";
import { useUser } from "../../../../contexts/UserContext";
import cauldronGif from "../../../../assets/General/Cauldron.gif";
import ErrorSnackbar from "../../../ErrorsSnackbar";
import { Box, Tooltip } from "@mui/material";

const FriendRequests: React.FC = () => {
  const { user } = useUser();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const {
    pendingRequests,
    loading,
    error,
    handleAcceptRequest,
    handleRejectRequest,
  } = usePendingFriendRequests(user?.firebase_uid);

  const { fetchFriends } = useFriendList(user?.firebase_uid);

  const onAcceptRequest = async (senderId: string, senderUsername: string) => {
    try {
      await handleAcceptRequest(senderId, senderUsername);
      await fetchFriends();
      setSuccessMessage(`You are now friends with ${senderUsername}!`);
      setTimeout(() => {
        setSuccessMessage(" ");
      }, 3000);
    } catch (err) {
      console.error("Error accepting friend request:", err);
    }
  };

  const onRejectRequest = async (senderId: string, senderUsername: string) => {
    try {
      await handleRejectRequest(senderId);
      setSuccessMessage(`Friend request from ${senderUsername} declined`);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error rejecting friend request:", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <img
          src={cauldronGif}
          alt="Loading..."
          style={{ width: "6rem", height: "auto" }}
        />
      </Box>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="text-gray-400 text-center p-4">
        No pending friend requests
      </div>
    );
  }

  return (
    <div>
      {successMessage && (
        <ErrorSnackbar
          open={true}
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
      {pendingRequests.map((request) => (
        <div
          key={request.friendrequest_id}
          className="flex items-center justify-between mb-4 border-b border-[#3B354C] pb-4 last:border-none"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-[5px] mr-4"></div>
            <div>
              <p className="text-white font-medium">
                {request.sender_info?.username || "Unknown User"}
              </p>
              <p className="text-sm text-gray-400">
                Level {request.sender_info?.level || 0}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Tooltip title="Accept Friend Request" enterDelay={100} arrow>
              <button
                className="bg-[#5CA654] text-xs text-white py-2 px-4 rounded-md hover:scale-105 transition-all duration-300"
                onClick={() =>
                  onAcceptRequest(
                    request.sender_id,
                    request.sender_info?.username || "Unknown User"
                  )
                }
              >
                <CheckIcon sx={{ fontSize: 20 }} />
              </button>
            </Tooltip>

            <Tooltip title="Decline Friend Request" enterDelay={100} arrow>
              <button
                className="bg-[#E43B45] text-xs text-white py-2 px-4 rounded-md hover:scale-105 transition-all duration-300"
                onClick={() =>
                  onRejectRequest(
                    request.sender_id,
                    request.sender_info?.username || "Unknown User"
                  )
                }
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;
