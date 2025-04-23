import React from "react";
import { Button, Tooltip } from "@mui/material";
import defaultPicture from "/profile-picture/default-picture.svg";
import { Friend } from "../../../contexts/UserContext";
import ProfileModal from "../../modals/ProfileModal";
import { useState } from "react";
import { useOnlineStatus } from "../../../hooks/useOnlineStatus";
import { useLobbyStatus } from "../../../hooks/useLobbyStatus";
import SelectStudyMaterialModal from "../../modals/SelectStudyMaterialModal";
import { useNavigate } from "react-router-dom";
import {
  createNewLobby,
  generateLobbyCode,
} from "../../../services/pvpLobbyService";
import { StudyMaterial } from "../../../types/studyMaterialObject";
  import { useSnackbar } from "../../../contexts/SnackbarContext";

interface FriendListItemProps {
  friend: Friend;
}

const FriendListItem: React.FC<FriendListItemProps> = ({ friend }) => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<string>("PvP");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const navigate = useNavigate();

  // Use hooks to get status
  const isOnline = useOnlineStatus(friend.firebase_uid);
  const { isInLobby, isInGame, gameMode } = useLobbyStatus(friend.firebase_uid);
  const { showSnackbar } = useSnackbar();

  const handleViewProfile = (friendId: string) => {
    setSelectedFriend(friendId);
    setProfileModalOpen(true);
  };

  // Get status color and text
  const getStatusInfo = () => {
    if (isInGame) {
      let statusText = "In Game";
      let color = "bg-orange-500"; // Default color

      switch (gameMode) {
        case "pvp-battle":
          color = "bg-[#A4ADE6]"; // PvP Mode color
          statusText = "In PVP Battle";
          break;
        case "peaceful-mode":
          color = "bg-[#76F7C3]"; // Peaceful Mode color
          statusText = "In Peaceful Mode";
          break;
        case "time-pressured-mode":
          color = "bg-[#FFCF47]"; // Time Pressured Mode color
          statusText = "In Time-Pressured Mode";
          break;
        case "creating-study-material":
          color = "bg-[#4D18E8]"; // Creating Study Material color
          statusText = "Creating Study Material";
          break;
      }

      return { color, text: statusText };
    } else if (isInLobby) {
      return { color: "bg-blue-500", text: "In Lobby" };
    } else if (isOnline) {
      return { color: "bg-green-500", text: "Online" };
    } else {
      return { color: "bg-gray-500", text: "Offline" };
    }
  };

  const { color, text } = getStatusInfo();

  // Handler for the INVITE button
  const handleInviteClick = () => {
    // Check if friend is online and not in game
    if (!isOnline) {
      showSnackbar(`${friend.username} is currently offline`, "error");
      return;
    }
    
    if (isInGame) {
      showSnackbar(`${friend.username} is currently in ${text}`, "error");
      return;
    }
    
    // Open material selection modal
    setMaterialModalOpen(true);
  };
  
  // Determine if invite should be disabled
  const isInviteDisabled = !isOnline || isInGame;
  
  // Handler for material selection
  const handleMaterialSelect = (material: StudyMaterial) => {
    // Generate a new lobby code
    const lobbyCode = generateLobbyCode();

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

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={friend.display_picture || defaultPicture}
              onClick={() => handleViewProfile(friend.firebase_uid)}
              alt="Avatar"
              className="w-10 sm:w-10 md:w-12 cursor-pointer h-auto mr-3 rounded-[5px] hover:scale-105 transition-all duration-300 ease-in-out"
            />
            {/* Status indicator positioned to overlap the image corner */}
            <Tooltip title={text} placement="top" arrow>
              <div
                className={`absolute bottom-[-2px] right-1 w-3.5 h-3.5 rounded-full border-2 border-[#120F1B] ${color}`}
              ></div>
            </Tooltip>
          </div>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              <p className="text-sm sm:text-base text-[#E2DDF3] truncate">
                {friend.username}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm text-[#9F9BAE]">
                Level {friend.level}
              </p>
              <p className="text-[#9F9BAE] text-xs">•</p>
              <p className="text-xs sm:text-sm text-[#9F9BAE]">
                EXP {friend.exp}
              </p>
            </div>
          </div>
        </div>

        {/* Button with more responsive padding */}
        <Button
          variant="contained"
          onClick={handleInviteClick}
          disabled={isInviteDisabled}
          sx={{
            borderRadius: "0.6rem",
            padding: {
              xs: "0.25rem 0.5rem", // Smaller padding on very small screens
              sm: "0.3rem 0.75rem", // Medium padding
              md: "0.4rem 1rem", // Larger padding
            },
            marginLeft: "8px",
            display: "flex",
            width: "fit-content",
            minWidth: "60px",
            height: "fit-content",
            fontSize: {
              xs: "0.7rem",
              sm: "0.75rem",
              md: "0.8rem",
            },
            justifyContent: "center",
            alignItems: "center",
            transition: "all 0.3s ease",
            backgroundColor: isInviteDisabled ? "#2E5428" : "#52A647",
            color: isInviteDisabled ? "#A0A0A0" : "inherit",
            "&:hover": {
              transform: isInviteDisabled ? "none" : "scale(1.05)",
              backgroundColor: isInviteDisabled ? "#2E5428" : "#45913c",
            },
          }}
        >
          {!isOnline ? "OFFLINE" : 
           isInGame ? "IN GAME" : "INVITE"}
        </Button>
      </div>
      {/* Profile Modal */}
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={selectedFriend || undefined}
      />

      {/* Study Material Selection Modal */}
      <SelectStudyMaterialModal
        open={materialModalOpen}
        handleClose={() => setMaterialModalOpen(false)}
        mode={inviteMode}
        onMaterialSelect={handleMaterialSelect}
        onModeSelect={handleModeSelect}
        selectedTypes={selectedTypes}
        isLobby={true}
      />
    </>
  );
};

export default FriendListItem;
