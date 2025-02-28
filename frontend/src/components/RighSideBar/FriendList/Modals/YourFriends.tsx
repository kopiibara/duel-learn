import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useFriendList } from "../../../../hooks/friends.hooks/useFriendList";
import { useUser } from "../../../../contexts/UserContext";
import { Box, Tooltip } from "@mui/material";
import ErrorSnackbar from "../../../ErrorsSnackbar";
import cauldronGif from "../../../../assets/General/Cauldron.gif";

interface User {
  firebase_uid: string;
  username: string;
  level: number;
}

const YourFriends: React.FC = () => {
  const { user } = useUser();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    isError: false,
  });

  const { friendList, handleRemoveFriend, loading } = useFriendList(
    user?.firebase_uid
  );

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
          style={{ width: "4rem", height: "auto" }}
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
        <Box className="text-gray-400 text-center p-4">
          You don't have any friends yet
        </Box>
      ) : (
        friendList.map((friend) => (
          <Box
            key={friend.firebase_uid}
            className="flex items-center justify-between mb-4 border-b border-[#3B354C] pb-4 last:border-none"
          >
            <div className="flex items-center cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-[5px] mr-4"></div>
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
