import React from "react";
import { Button, Tooltip } from "@mui/material";
import DefaultPicture from "/profile-picture/default-picture.svg";
import { Friend } from "../../../contexts/UserContext";
import ProfileModal from "../../modals/ProfileModal";
import { useState } from "react";
import { useOnlineStatus } from "../../../hooks/useOnlineStatus";
import { useLobbyStatus } from "../../../hooks/useLobbyStatus";
import SelectStudyMaterialModal from "../../modals/SelectStudyMaterialModal";
import { useNavigate } from "react-router-dom";
import { createNewLobby } from "../../../services/pvpLobbyService";
import { generateCode } from "../../../pages/dashboard/play-battleground/utils/codeGenerator";
import { StudyMaterial } from "../../../types/studyMaterialObject";

interface FriendListItemProps {
  friend: Friend;
}

const FriendListItem: React.FC<FriendListItemProps> = ({ friend }) => {
  const navigate = useNavigate();
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<string>("PvP");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Use hooks to get status
  const isOnline = useOnlineStatus(friend.firebase_uid);
  const { isInLobby, isInGame, gameMode } = useLobbyStatus(friend.firebase_uid);

  const handleViewProfile = (friendId: string) => {
    setSelectedFriend(friendId);
    setProfileModalOpen(true);
  };

  // Get status color and text
  const getStatusInfo = () => {
    if (isInGame) {
      // Game status takes priority - use orange
      let statusText = "In Game";

      // Show specific game mode in tooltip if available
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

  const { color, text } = getStatusInfo();

  // Handler for the INVITE button
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

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={friend.display_picture || DefaultPicture}
              onClick={() => handleViewProfile(friend.firebase_uid)}
              alt="Avatar"
              className="w-9 sm:w-11 md:w-14 cursor-pointer h-auto mr-2 sm:mr-3 rounded-[5px] hover:scale-110 transition-all duration-300"
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
              <p className="text-[#9F9BAE] text-xs hidden xs:inline">•</p>
              <p className="text-xs sm:text-sm text-[#9F9BAE] whitespace-nowrap">
                EXP {friend.exp}
              </p>
            </div>
          </div>
        </div>

        {/* Button with more responsive padding */}
        <Button
          onClick={handleInviteClick}
          variant="contained"
          sx={{
            borderRadius: "0.6rem",
            padding: {
              xs: "0.2rem 0.4rem", // Smaller padding on very small screens
              sm: "0.3rem 0.75rem", // Medium padding
              md: "0.4rem 1rem", // Larger padding
            },
            display: "flex",
            width: "fit-content",
            minWidth: { xs: "50px", sm: "60px" },
            height: "fit-content",
            fontSize: {
              xs: "0.65rem",
              sm: "0.75rem",
              md: "0.8rem",
            },
            justifyContent: "center",
            alignItems: "center",
            transition: "all 0.3s ease",
            backgroundColor: "#52A647",
            borderWidth: "2px",
            "&:hover": {
              transform: "scale(1.05)",
              backgroundColor: "#45913c",
            },
          }}
        >
          INVITE
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
