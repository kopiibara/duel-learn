import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/ClearRounded";
import AddIcon from "@mui/icons-material/AddRounded";
import { useFriendList } from "../../../../hooks/friends.hooks/useFriendList";
import { useFriendSocket } from "../../../../hooks/friends.hooks/useFriendSocket";
import { useUser } from "../../../../contexts/UserContext";
import { Box, Tooltip, Stack } from "@mui/material";
import ErrorSnackbar from "../../../ErrorsSnackbar";
import cauldronGif from "/General/Cauldron.gif";
import { Friend } from "../../../../types/friendObject";
import noFriend from "/images/NoFriend.svg";
import defaultPicture from "/profile-picture/default-picture.svg";
import ProfileModal from "../../../modals/ProfileModal";
import { useOnlineStatus } from "../../../../hooks/useOnlineStatus";
import { useLobbyStatus } from "../../../../hooks/useLobbyStatus";
import SelectStudyMaterialModal from "../../../modals/SelectStudyMaterialModal";
import { createNewLobby } from "../../../../services/pvpLobbyService";
import { generateCode } from "../../../../pages/dashboard/play-battleground/utils/codeGenerator";
import { StudyMaterial } from "../../../../types/studyMaterialObject";

interface FriendItemProps {
  friend: Friend;
  onRemoveFriend: (friendId: string) => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, onRemoveFriend }) => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus(friend.firebase_uid);
  const { isInLobby, isInGame, gameMode } = useLobbyStatus(friend.firebase_uid);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<string>("PvP");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const getStatusInfo = () => {
    if (isInGame) {
      let statusText = "In Game";

      if (gameMode === "pvp-battle") {
        statusText = "In PVP Battle";
      } else if (gameMode === "peaceful-mode") {
        statusText = "In Peaceful Mode";
      } else if (gameMode === "time-pressured-mode") {
        statusText = "In Time-Pressured Mode";
      }

      return {
        color: "bg-orange-500",
        text: statusText,
      };
    } else if (isInLobby) {
      return {
        color: "bg-blue-500",
        text: "In Lobby",
      };
    } else if (isOnline) {
      return {
        color: "bg-green-500",
        text: "Online",
      };
    } else {
      return {
        color: "bg-gray-500",
        text: "Offline",
      };
    }
  };

  const handleInviteClick = () => {
    setMaterialModalOpen(true);
  };

  const handleMaterialSelect = (material: StudyMaterial) => {
    const lobbyCode = generateCode();
    const lobbyState = createNewLobby(inviteMode, material);
    localStorage.setItem("friendToInvite", JSON.stringify(friend));
    setMaterialModalOpen(false);
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

  const handleModeSelect = (mode: string) => {
    setInviteMode(mode);
  };

  const { color, text } = getStatusInfo();

  return (
    <Box className="flex items-center justify-between gap-2 mb-4 border-b border-[#3B354C] pb-4 last:border-none">
      <div className="flex items-center">
        <div className="relative">
          <img
            src={friend.display_picture || defaultPicture}
            alt="Avatar"
            className="w-14 h-14 rounded-[5px] mr-4 hover:scale-110 transition-all duration-300"
          />
          <Tooltip title={text} placement="top" arrow>
            <div
              className={`absolute bottom-[-2px] right-1 w-4 h-4 rounded-full border-2 border-[#120F1B] ${color}`}
            ></div>
          </Tooltip>
        </div>
        <div>
          <p className="font-medium">{friend.username}</p>
          <p className="text-sm text-[#9F9BAE]">Level {friend.level}</p>
        </div>
      </div>
      <Box flex={1} />
      <SelectStudyMaterialModal
        open={materialModalOpen}
        handleClose={() => setMaterialModalOpen(false)}
        mode={inviteMode}
        onMaterialSelect={handleMaterialSelect}
        onModeSelect={handleModeSelect}
        selectedTypes={selectedTypes}
        isLobby={true}
      />
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
          <CloseIcon sx={{ fontSize: 18 }} />
        </button>
      </Tooltip>
    </Box>
  );
};

const YourFriends: React.FC = () => {
  const { user } = useUser();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    isError: false,
  });
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const { friendList, handleRemoveFriend, loading, fetchFriends } =
    useFriendList(user?.firebase_uid);

  const handleFriendRequestAccepted = (data: { newFriend: Friend }) => {
    console.log("Friend added in YourFriends:", data.newFriend);
    setSnackbar({
      open: true,
      message: `${data.newFriend.username} is now your friend!`,
      isError: false,
    });
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

      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={selectedFriend || undefined}
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
          <FriendItem
            key={friend.firebase_uid}
            friend={friend}
            onRemoveFriend={onRemoveFriend}
          />
        ))
      )}
    </Box>
  );
};

export default YourFriends;
