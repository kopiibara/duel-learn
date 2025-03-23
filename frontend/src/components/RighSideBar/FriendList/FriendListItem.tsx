import React from "react";
import { Button } from "@mui/material";
import DefaultPicture from "/profile-picture/default-picture.svg";
import { Friend } from "../../../contexts/UserContext";
import ProfileModal from "../../modals/ProfileModal";
import { useState } from "react";

interface FriendListItemProps {
  friend: Friend;
}

const FriendListItem: React.FC<FriendListItemProps> = ({ friend }) => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleViewProfile = (friendId: string) => {
    setSelectedFriend(friendId);
    setProfileModalOpen(true);
  };
  return (
    <>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center flex-1 min-w-0 mr-2">
          <img
            src={friend.display_picture || DefaultPicture}
            onClick={() => handleViewProfile(friend.firebase_uid)}
            alt="Avatar"
            className="w-9 sm:w-11 md:w-14 cursor-pointer h-auto mr-2 sm:mr-3 rounded-[5px] hover:scale-110 transition-all duration-300"
          />

          {/* Text content */}
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm sm:text-base text-[#E2DDF3] truncate">
              {friend.username}
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <p className="text-xs sm:text-sm text-[#9F9BAE] whitespace-nowrap">
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
    </>
  );
};

export default FriendListItem;
