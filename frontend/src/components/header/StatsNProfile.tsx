import React, { useState } from "react";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CoinIcon from "../../assets/CoinIcon.png";
import ManaIcon from "../../assets/ManaIcon.png";
import ProfileIcon from "../../assets/profile-picture/bunny-picture.png";
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip from Material-UI

const StatsNProfile = () => {
    // State for dynamic data
    const [stats, setStats] = useState({
        xp: 500,
        mana: 200,
        hasNotifications: true, // Default notification status
        profileImg: ProfileIcon, // Avatar image
    });

    return (
        <div className="flex items-center space-x-2 sm:space-x-6">
            {/* Xp */}
            <Tooltip
                title="Xp"
                arrow
                sx={{
                    '& .MuiTooltip-tooltip': {
                        padding: '8px 12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        animation: 'fadeInOut 0.3s ease-in-out',
                    },
                }}
            >
                <div className="flex items-center space-x-2">
                    <img src={CoinIcon} alt="Coins" className="w-6 h-6" />
                    <span className="text-yellow-500">{stats.xp}</span>
                </div>
            </Tooltip>

            {/* Mana Icon */}
            <Tooltip
                title="Mana"
                arrow
                sx={{
                    '& .MuiTooltip-tooltip': {
                        padding: '8px 12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        animation: 'fadeInOut 0.3s ease-in-out',
                    },
                }}
            >
                <div className="flex items-center space-x-2">
                    <img src={ManaIcon} alt="Mana" className="w-6 h-6" />
                    <span className="text-purple-500">{stats.mana}</span>
                </div>
            </Tooltip>

            {/* Notification Bell */}
            {/* <Tooltip
                title={stats.hasNotifications ? "You have new notifications" : "No new notifications"}
                arrow
                sx={{
                    '& .MuiTooltip-tooltip': {
                        padding: '8px 12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        animation: 'fadeInOut 0.3s ease-in-out',
                    },
                }}
            >
                <div>
                    {stats.hasNotifications ? (
                        <NotificationsActiveIcon
                            style={{ fontSize: "28px" }}
                            className="cursor-pointer"
                        />
                    ) : (
                        <NotificationsNoneIcon
                            style={{ fontSize: "28px" }}
                            className="text-gray-500 cursor-pointer"
                        />
                    )}
                </div>
            </Tooltip> */}

            {/* Avatar */}
            <Tooltip
                title="Profile"
                arrow
                sx={{
                    '& .MuiTooltip-tooltip': {
                        padding: '8px 12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        animation: 'fadeInOut 0.3s ease-in-out',
                    },
                }}
            >
                <img src={stats.profileImg} alt="Profile" className="w-9 h-9 rounded-xl" />
            </Tooltip>
        </div>
    );
};

export default StatsNProfile;