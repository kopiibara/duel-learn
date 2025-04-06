import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { useFriendList } from "../../../../hooks/friends.hooks/useFriendList";
import { useFriendSocket } from "../../../../hooks/friends.hooks/useFriendSocket";
import { useUser } from "../../../../contexts/UserContext";
import { Box, Tooltip, Stack } from "@mui/material";
import ErrorSnackbar from "../../../ErrorsSnackbar";
import cauldronGif from "/General/Cauldron.gif";
import { Friend } from "../../../../types/friendObject";
import noFriend from "/images/NoFriend.svg";
import DefaultPicture from "/profile-picture/default-picture.svg";
import AddIcon from "@mui/icons-material/AddRounded";
import ProfileModal from "../../../modals/ProfileModal";
import { useOnlineStatus } from "../../../../hooks/useOnlineStatus";
import { useLobbyStatus } from "../../../../hooks/useLobbyStatus";
import SelectStudyMaterialModal from "../../../modals/SelectStudyMaterialModal";
import { createNewLobby } from "../../../../services/pvpLobbyService";
import { generateCode } from "../../../../pages/dashboard/play-battleground/utils/codeGenerator";
import { StudyMaterial } from "../../../../types/studyMaterialObject";

interface FriendListItemProps {
  friend: Friend;
}

const YourFriends: React.FC<FriendListItemProps> = ({ friend }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    isError: false,
  });
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<string>("PvP");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
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

  const handleInviteClick = () => {
    // Open material selection modal
    setMaterialModalOpen(true);
  };

  // Handler for material selection
  const handleMaterialSelect = (material: StudyMaterial) => {
    // Generate a new lobby code
    const lobbyCode = generateCode();

    // Create a new lobby state
    const lobbyState = createNewLobby(inviteMode, material);

    // Store the friend to invite
    localStorage.setItem("friendToInvite", JSON.stringify(friend));

    // Close the modal
    setMaterialModalOpen(false);

    // Navigate to welcome screen

    navigate("/dashboard/welcome-game-mode", {
      state: {
        mode: inviteMode,
        material: material,
        lobbyCode: lobbyState.lobbyCode,
        role: "host",
        friendToInvite: friend,
        isPvpLobbyCreation: true,
      },
    });
  };

  // Handler for mode selection
  const handleModeSelect = (mode: string) => {
    setInviteMode(mode);
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

  const handleViewProfile = (friendId: string) => {
    setSelectedFriend(friendId);
    setProfileModalOpen(true);
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

      {/* Profile Modal */}
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={selectedFriend || undefined}
      />

      <SelectStudyMaterialModal
        open={materialModalOpen}
        handleClose={() => setMaterialModalOpen(false)}
        mode={inviteMode}
        onMaterialSelect={handleMaterialSelect}
        onModeSelect={handleModeSelect}
        selectedTypes={selectedTypes}
        isLobby={true}
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
              style={{ width: "12rem", height: "auto", opacity: 0.75 }}
            />
          </Box>
          <p className="text-[#6F658D] font-bold text-[0.95rem]">
            {" "}
            No friends yet. Add friends and share the magic!
          </p>
        </Stack>
      ) : (
        friendList.map((friend) => (
          <Box
            key={friend.firebase_uid}
            className="flex items-center justify-between gap-2 mb-4 border-b border-[#3B354C] pb-4 last:border-none"
          >
            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleViewProfile(friend.firebase_uid)}
            >
              <img
                src={friend.display_picture || DefaultPicture}
                alt="Avatar"
                className="w-14 h-14 rounded-[5px] mr-4 hover:scale-110 transition-all duration-300"
              />
              <div>
                <p className="font-medium">{friend.username}</p>
                <p className="text-sm text-[#9F9BAE]">Level {friend.level}</p>
              </div>
            </div>
            <Box flex={1} />
            <Tooltip title="Invite" enterDelay={100} arrow>
              <button
                className="bg-[#52A647] text-xs text-white py-2 px-4 rounded-md hover:scale-105 transition-all duration-300"
                onClick={handleInviteClick}
              >
                <AddIcon sx={{ fontSize: 18 }} />
              </button>
            </Tooltip>
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
