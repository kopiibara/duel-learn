import React, { useState, useEffect } from "react";
import CoinIcon from "/CoinIcon.png";
import ManaIcon from "/ManaIcon.png";
import Tooltip from "@mui/material/Tooltip";
import TechPassIcon from "/shop-picture/tech-pass.png";
import ProfilePopover from "./ProfilePopover";
import { Avatar, Box } from "@mui/material"; // Remove CircularProgress
import { useUser } from "../../contexts/UserContext";
import DefaultPicture from "/profile-picture/default-picture.svg";
import PremiumLabel from "/premium-star.png";
import axios from "axios";
import "./ManaIndicator.css"; // We'll create this CSS file

interface ManaDetails {
  current: number;
  maximum: number;
  percentageFilled: number;
  lastUpdated: string;
  replenishRate: {
    perMinute: number;
    perHour: number;
  };
  timeToFull: {
    minutes: number;
    formattedTime: string;
  };
  isFull: boolean;
}

const StatsNProfile = () => {
  const { user } = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [manaStatus, setManaStatus] = useState<
    "replenishing" | "maxed" | "normal"
  >("normal");
  const [currentMana, setCurrentMana] = useState<number>(user?.mana || 0);
  const [manaDetails, setManaDetails] = useState<ManaDetails | null>(null);
  const [tooltipContent, setTooltipContent] = useState<string>("Mana");
  const maxMana = 200; // Default max mana - could be fetched from user data

  const isPremium = user?.account_type === "premium";

  // Check mana status periodically
  useEffect(() => {
    // Initial update
    updateManaStatus();

    // Set up interval to check mana status every minute
    const interval = setInterval(updateManaStatus, 60000);

    return () => clearInterval(interval);
  }, [user?.firebase_uid]);

  // Format the time to full replenishment
  const formatTooltipContent = (details: ManaDetails) => {
    if (details.isFull) {
      return "Mana at maximum capacity";
    }
    
    // Get time to full details
    const { minutes, formattedTime } = details.timeToFull;
    
    if (minutes <= 0) {
      return "Mana replenishing";
    }
    
    const replenishRate = Math.round(details.replenishRate.perHour);
    return `Mana replenishing • Full in ${formattedTime}`;
  };

  // Function to update mana status
  const updateManaStatus = async () => {
    if (!user?.firebase_uid) return;

    try {
      // Use the detailed mana endpoint
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/mana/details/${user.firebase_uid}`
      );
      
      if (response.status === 200 && response.data.success) {
        const details = response.data.mana as ManaDetails;
        setManaDetails(details);
        setCurrentMana(details.current);

        // Determine mana status
        if (details.isFull) {
          setManaStatus("maxed");
        } else {
          setManaStatus("replenishing");
        }
        
        // Update tooltip content
        setTooltipContent(formatTooltipContent(details));
      } else {
        // Fallback to basic mana endpoint if detailed fails
        const basicResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/mana/${user.firebase_uid}`
        );
        
        if (basicResponse.status === 200) {
          setCurrentMana(basicResponse.data.mana);
          
          // Determine mana status
          if (basicResponse.data.mana >= maxMana) {
            setManaStatus("maxed");
            setTooltipContent("Mana at maximum capacity");
          } else {
            setManaStatus("replenishing");
            setTooltipContent("Mana replenishing");
          }
        }
      }
    } catch (error) {
      console.error("Error updating mana status:", error);
    }
  };

  // Handle profile icon click to open/close popover
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  // Close the popover
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box className="flex items-center space-x-3 ">
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
            {user?.coins || 0}
          </span>
        </div>
      </Tooltip>

      {/* Mana Icon */}
      <Tooltip
        title={tooltipContent}
        arrow
        sx={{
          "& .MuiTooltip-tooltip": {
            padding: "8px 12px",
            fontSize: "14px",
            fontWeight: "medium",
            animation: "fadeInOut 0.3s ease-in-out",
            whiteSpace: "nowrap",
          },
        }}
      >
        <div className="flex items-center space-x-2">
          <img src={ManaIcon} alt="Mana" className="w-5 h-auto" />
          <span
            className={`text-[0.9rem] hover:text-[#E2DDF3] ${
              manaStatus === "replenishing"
                ? "mana-counter-replenishing"
                : manaStatus === "maxed"
                ? "mana-counter-maxed"
                : "text-[#9F9BAE]"
            }`}
          >
            {Math.floor(currentMana) || 0}
          </span>
        </div>
      </Tooltip>

      <Tooltip
        title="Tech Pass"
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
          <img src={TechPassIcon} alt="Tech Pass" className="w-6 h-auto" />
          <span className="text-[#9F9BAE] text-[0.9rem] hover:text-[#E2DDF3] ">
            {user?.tech_pass || 0}
          </span>
        </div>
      </Tooltip>

      {isPremium && (
        <Tooltip
          title="Premium"
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
            <img src={PremiumLabel} alt="" className="w-5 h-auto" />
          </div>
        </Tooltip>
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
          src={user?.display_picture || DefaultPicture}
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
