import React from "react";
import { Button } from "@mui/material";
import defaultPicture from "../../../assets/profile-picture/default-picture.svg";
import { Friend } from "../../../contexts/UserContext";

interface FriendListItemProps {
  friend: Friend;
  onInvite: (friendId: string) => void;
}

const FriendListItem: React.FC<FriendListItemProps> = ({
  friend,
  onInvite,
}) => {
  return (
    <div className="flex items-center justify-between mb-[2vh]">
      <div className="flex items-center">
        <img
          src={friend.display_picture || defaultPicture}
          alt="Avatar"
          className="min-w-[44px] w-[2.8vw] max-w-[60px] h-auto mr-[0.8vw]  rounded-[5px] hover:scale-110 transition-all duration-300"
        />

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <p className="text-[clamp(1rem,0.8vw,2rem)]  text-[#E2DDF3] truncate">
            {friend.username}
          </p>
          <div className="flex items-center gap-[0.5vw]">
            {" "}
            <p className="text-[clamp(0.8rem,0.5vw,1.5rem)]  min-text-[12px] text-[#9F9BAE]">
              Level {friend.level}
            </p>
            <p className="text-[#9F9BAE] text-[clamp(0.6rem,0.7vw,2rem)]">•</p>
            <p className="text-[clamp(0.8rem,0.5vw,1.5rem)]  min-text-[12px] text-[#9F9BAE]">
              EXP {friend.exp}
            </p>
          </div>
        </div>
      </div>

      {/* Button with more responsive padding */}
      <Button
        variant="contained"
        onClick={() => onInvite(friend.firebase_uid)}
        sx={{
          borderRadius: "0.6rem",
          padding: {
            xs: "0.5vh 1vw", // Smaller padding on very small screens
            sm: "0.6vh 1.2vw", // Original padding for larger screens
          },
          marginLeft: "8px",
          display: "flex",
          width: "fit-content",
          minWidth: "60px",
          height: "fit-content",
          fontSize: "clamp(0.7rem, 1vh, 1rem)",
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
  );
};

export default FriendListItem;
