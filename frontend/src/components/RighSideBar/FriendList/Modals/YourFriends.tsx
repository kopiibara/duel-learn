import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useFriendList } from "../../../../hooks/friends.hooks/useFriendList";
import { useFriendSocket } from "../../../../hooks/friends.hooks/useFriendSocket";
import { useUser } from "../../../../contexts/UserContext";
import { Box, Tooltip, Stack } from "@mui/material";
import ErrorSnackbar from "../../../ErrorsSnackbar";
import cauldronGif from "../../../../assets/General/Cauldron.gif";
import { Friend } from "../../../../types/friendObject";
import noFriend from "../../../../assets/images/NoFriend.svg";

const YourFriends: React.FC = () => {
  const { user } = useUser();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    isError: false,
  });

  const { friendList, handleRemoveFriend, loading, fetchFriends } =
    useFriendList(user?.firebase_uid);

  // Set up socket listener for friend request accepted events
  const handleFriendRequestAccepted = (data: { newFriend: Friend }) => {
    console.log("Friend added in YourFriends:", data.newFriend);
    setSnackbar({
      open: true,
      message: `${data.newFriend.username} is now your friend!`,
      isError: false,
    });
    // Refresh friend list when a new friend is added
    fetchFriends();
  };

  const handleFriendRemoved = (_data: { removedFriendId: string }) => {
    setSnackbar({
      open: true,
      message: "A friend was removed from your list.",
      isError: false,
    });
    fetchFriends();
  };

  // Use the socket hook to listen for real-time updates
  useFriendSocket({
    userId: user?.firebase_uid,
    onFriendRequestAccepted: handleFriendRequestAccepted,
    onFriendRemoved: handleFriendRemoved,
  });

  const onRemoveFriend = async (friendId: string) => {
    if (!user?.firebase_uid) return;

    try {
      await handleRemoveFriend(user.firebase_uid, friendId);
      setSnackbar({
        open: true,
        message: "Friend removed successfully!",
        isError: false,
      });
    } catch (error) {
      console.error("Error removing friend:", error);
      setSnackbar({
        open: true,
        message: "Error removing friend. Please try again.",
        isError: true,
      });
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

  return (
    <Box>
      <ErrorSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
      {friendList.length === 0 ? (
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
          <p className=" text-[#6F658D] font-bold text-[0.95rem]">
            {" "}
            No friends yet. Add friends and share the magic!
          </p>
        </Stack>
      ) : (
        friendList.map((friend) => (
          <Box
            key={friend.firebase_uid}
            className="flex items-center justify-between mb-4 border-b border-[#3B354C] pb-4 last:border-none"
          >
            <div className="flex items-center cursor-pointer">
              <img
                src={friend.display_picture}
                alt="Avatar"
                className="w-14 h-14 rounded-[5px] mr-4 hover:scale-110 transition-all duration-300"
              />
              <div>
                <p className="text-white font-medium">{friend.username}</p>
                <p className="text-sm text-gray-400">Level {friend.level}</p>
              </div>
            </div>

            <Tooltip title="Remove Friend" enterDelay={100} arrow>
              <button
                className="bg-[#E03649] text-xs text-white py-2 px-4 rounded-md hover:bg-[#E84040] hover:scale-105 transition-all duration-300"
                onClick={() => onRemoveFriend(friend.firebase_uid)}
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            </Tooltip>
          </Box>
        ))
      )}
    </Box>
  );
};

export default YourFriends;
