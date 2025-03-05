import React, { useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { usePendingFriendRequests } from "../../../../hooks/friends.hooks/usePendingFriendRequests";
import { useFriendList } from "../../../../hooks/friends.hooks/useFriendList";
import { useUser } from "../../../../contexts/UserContext";
import cauldronGif from "../../../../assets/General/Cauldron.gif";
import noFriend from "../../../../assets/images/NoFriend.svg";
import ErrorSnackbar from "../../../ErrorsSnackbar";
import { Box, Tooltip, Stack } from "@mui/material";

interface FriendRequestsProps {
  onFriendRequestHandled?: () => void; // New prop to notify parent of changes
}

const FriendRequests: React.FC<FriendRequestsProps> = ({
  onFriendRequestHandled,
}) => {
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
      console.log(
        `Accepting friend request from ${senderUsername} (${senderId})`
      );

      // Accept the friend request
      await handleAcceptRequest(senderId, senderUsername);

      // Refresh the friend list
      await fetchFriends();

      // Notify the parent component so it can update the badge count
      if (onFriendRequestHandled) {
        onFriendRequestHandled();
      }

      // Show success message
      setSuccessMessage(`You are now friends with ${senderUsername}!`);

      // Reset the message after a delay
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error accepting friend request:", err);
      setSuccessMessage(
        `Failed to accept friend request from ${senderUsername}. Please try again.`
      );
    }
  };

  const onRejectRequest = async (senderId: string, senderUsername: string) => {
    try {
      // Reject the request
      await handleRejectRequest(senderId);

      // Notify the parent component so it can update the badge count
      if (onFriendRequestHandled) {
        onFriendRequestHandled();
      }

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
      <Stack
        spacing={2}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Box display="flex" justifyContent="center" alignItems="center">
          <img
            src={noFriend}
            alt="noFriend"
            style={{ width: "12rem", height: "auto" }}
          />
        </Box>
        <p className=" text-[#6F658D] font-bold text-[0.95rem] ">
          {" "}
          Nothing to see here yet!
        </p>
      </Stack>
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
