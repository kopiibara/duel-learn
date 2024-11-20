import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../index.css";
import Avatar from "@mui/material/Avatar";
import { UserContext } from "/context/userContext";
import { Tooltip } from '@mui/material';

// Icons
import DuelLearnRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ExploreRoundedIcon from "@mui/icons-material/NearMeRounded";
import YourLibraryRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import ProfileRoundedIcon from "@mui/icons-material/PersonRounded";
import ShopRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

// Paths
import Home from "../pages/dashboard/Home";
import Explore from "../pages/dashboard/Explore";
import YourLibrary from "../pages/dashboard/YourLibrary";
import Profile from "../pages/dashboard/Profile";
import Shop from "../pages/dashboard/Shop";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useContext(UserContext);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const Menus = [
    {
      title: "Home",
      icon: <HomeRoundedIcon />,
      path: "/dashboard/home",
      element: <Home />,
    },
    {
      title: "Explore",
      icon: <ExploreRoundedIcon />,
      path: "/dashboard/explore",
      element: <Explore />,
    },
    {
      title: "Your Library",
      icon: <YourLibraryRoundedIcon />,
      path: "/dashboard/your-library",
      element: <YourLibrary />,
    },
    {
      title: "Profile",
      icon: <ProfileRoundedIcon />,
      path: "/dashboard/profile",
      element: <Profile />,
    },
    {
      title: "Shop",
      icon: <ShopRoundedIcon />,
      path: "/dashboard/shop",
      element: <Shop />,
    },
  ];

  const handleMenuClick = (menu) => {
    navigate(menu.path);
  };

  useEffect(() => {
    if (user) {
      console.log(`Welcome, ${user.username}!`);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`h-screen ${isCollapsed ? 'w-28' : 'w-64'} text-[#E2DDF3] flex flex-col p-5 mx-2 transition-all relative`}>
      {/** Header */}
      <div className={`flex items-center p-2 mb-4 gap-2  transition-all ${isCollapsed ? 'justify-center' : ''}`}>
        {/* Collapse/Expand Button in the Header */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-[#E2DDF3] rounded-md  hover:bg-[#130a2e] focus:outline-none"
        >
          {isCollapsed ? (
            <MenuIcon fontSize="large" />  // Larger size when expanded
          ) : (
            <MenuOpenIcon fontSize="large" />  // Smaller size when collapsed          
          )}
        </button>

        {/* Text appears only when not collapsed */}
        {!isCollapsed && <span className="ml-2 text-xl font-bold whitespace-nowrap transition-all">Duel Learn</span>}
      </div>



      {/** Create New */}
      <div className="space-y-4 w-full text-left rounded-xl gap-2">
        <button className={`w-full bg-[#381898] text-[#E2DDF3] py-2 rounded-lg hover:bg-[#4D18E8] flex items-center justify-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <AddRoundedIcon />
          {/* Text hides when collapsed */}
          {!isCollapsed && <span className=" whitespace-nowrap">Create New</span>}
        </button>

        <button className={`w-full border-2 border-[#E2DDF3] text-white py-2 rounded-xl flex items-center justify-center hover:bg-[#4D18E8] hover:border-2 hover:border-[#4D18E8] ${isCollapsed ? 'justify-center' : ''}`}>
          <PlayArrowRoundedIcon />
          {/* Text hides when collapsed */}
          {!isCollapsed && <span className="ml-2 whitespace-nowrap">Play</span>}
        </button>
      </div>

      {/** Divider */}
      <hr className="border-[#3F3565] my-5 w-full" />

      {/** Navigation */}
      {Menus.map((menu, index) => (
        <Tooltip
          title={menu.title}
          placement="right"
          key={index}
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 10], // Adjust this value to change tooltip positioning
                },
              },
            ],
          }}
          sx={{
            '& .MuiTooltip-tooltip': {
              animation: isCollapsed ? 'pop 0.3s ease-out' : 'none', // Apply "pop" effect when collapsed
            },
          }}
        >
          <button
            className={`flex items-center p-2 w-full text-left rounded-xl gap-2 m-1 ${location.pathname === menu.path
              ? "border-2 border-[#4D18E8] text-[#4D18E8]"
              : "hover:text-[#A38CE6]"} ${isCollapsed ? 'justify-center' : ''}`}
            onClick={() => handleMenuClick(menu)}
          >
            <span className={`${location.pathname === menu.path ? "text-[#4D18E8]" : ""} ${isCollapsed ? 'flex justify-center items-center w-full' : ''}`}>
              {menu.icon}
            </span>
            {!isCollapsed && <span className="ml-2 whitespace-nowrap">{menu.title}</span>} {/* Prevent text wrapping */}
          </button>
        </Tooltip>
      ))}

      {/** Profile Section */}
      <div className="flex mt-auto mb-7 gap-3 w-full items-center">
        {isCollapsed ? (
          <Avatar src="/broken-image.jpg" variant="rounded" />
        ) : (
          <>
            <Avatar src="/broken-image.jpg" variant="rounded" />
            <div className="ml-2">
              <h1 className="text-s text-[#E2DDF3]">
                {user ? user.username : "Guest"}
              </h1>
              <p className="text-sm text-[#3F3565]">LVL. 10</p>
            </div>
          </>
        )}
        <span className="ml-auto">
          <MoreVertIcon />
        </span>
      </div>
    </div>



  );
};

export default Sidebar;
