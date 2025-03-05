import React from "react";
import { Button } from "@mui/material";
import ProfileIcon from "../../../assets/profile-picture/kopibara-picture.png";
import { Friend } from "../../../types/friendObject";

interface FriendListItemProps {
  friend: Friend;
  onInvite: (friendId: string) => void;
}

const FriendListItem: React.FC<FriendListItemProps> = ({
  friend,
  onInvite,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <img
          src={friend.display_profile || ProfileIcon}
          alt="Avatar"
          className="w-14 h-14 rounded-[5px] mr-6 hover:scale-110 transition-all duration-300"
        />
        <div>
          <p className="text-lg text-[#E2DDF3]">{friend.username}</p>
          <p className="text-sm text-[#9F9BAE]">Level {friend.level}</p>
        </div>
      </div>
      <Button
        variant="contained"
        onClick={() => onInvite(friend.firebase_uid)}
        sx={{
          borderRadius: "0.8rem",
          padding: "0.4rem 1.3rem",
          display: "flex",
          width: "full",
          justifyContent: "center",
          alignItems: "center",
          transition: "all 0.3s ease",
          backgroundColor: "#52A647",
          borderWidth: "2px",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      >
        INVITE
      </Button>
    </div>
  );
};

export default FriendListItem;
