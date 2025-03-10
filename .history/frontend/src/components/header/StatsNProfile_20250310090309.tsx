import React, { useState } from "react";
import CoinIcon from "../../assets/CoinIcon.png";
import ManaIcon from "../../assets/ManaIcon.png";
import Tooltip from "@mui/material/Tooltip";
import ProfilePopover from "./ProfilePopover";
import { Avatar, Box } from "@mui/material";
import { useUser } from "../../contexts/UserContext";
import defaultPicture from "../../assets/profile-picture/default-picture.svg";
import axios from "axios";
import { UserInfo } from "../../types/userInfoObject";

// User info interface

const StatsNProfile = () => {
  const { user } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Handle profile icon click to open/close popover
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  // Close the popover
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box className="flex items-center space-x-2 sm:space-x-6">
      {loading ? (
        <CircularProgress size={24} color="inherit" />
      ) : error ? (
        <span className="text-red-500 text-sm">{error}</span>
      ) : (
        <>
          {/* Coin */}
          <Tooltip
            title="Coin"
            arrow
            sx={{
              "& .MuiTooltip-tooltip": {
                padding: "8px 12px",
                fontSize: "16px",
                fontWeight: "bold",
                animation: "fadeInOut 0.3s ease-in-out",
              },
            }}
          >
            <div className="flex items-center space-x-2">
              <img src={CoinIcon} alt="Coins" className="w-6 h-auto" />
              <span className="text-[#9F9BAE] text-[0.9rem] hover:text-[#E2DDF3]">
                {userInfo?.coin || 0}
              </span>
            </div>
          </Tooltip>

          {/* Mana Icon */}
          <Tooltip
            title="Mana"
            arrow
            sx={{
              "& .MuiTooltip-tooltip": {
                padding: "8px 12px",
                fontSize: "16px",
                fontWeight: "bold",
                animation: "fadeInOut 0.3s ease-in-out",
              },
            }}
          >
            <div className="flex items-center space-x-2">
              <img src={ManaIcon} alt="Mana" className="w-5 h-auto" />
              <span className="text-[#9F9BAE] text-[0.9rem] hover:text-[#E2DDF3] ">
                {userInfo?.mana || 0}
              </span>
            </div>
          </Tooltip>
        </>
      )}

      {/* Profile Avatar */}
      <Tooltip
        title="Profile"
        arrow
        sx={{
          "& .MuiTooltip-tooltip": {
            padding: "8px 12px",
            fontSize: "16px",
            fontWeight: "bold",
            animation: "fadeInOut 0.3s ease-in-out",
          },
        }}
      >
        <Avatar
          variant="rounded"
          onClick={handleProfileClick}
          src={user?.display_picture || defaultPicture}
          alt={user?.email || "User"}
          sx={{
            cursor: "pointer",
            transition: "transform 0.3s ease, background-color 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
              backgroundColor: "rgba(0, 0, 0, 0.08)",
            },
          }}
        />
      </Tooltip>

      {/* Profile Popover */}
      <ProfilePopover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        handleClose={handlePopoverClose}
      />
    </Box>
  );
};

export default StatsNProfile;
