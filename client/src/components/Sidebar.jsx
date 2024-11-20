import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import Avatar from "@mui/material/Avatar";
import { UserContext } from "/context/userContext"; // Import the context

// Icons
import DuelLearnRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ExploreRoundedIcon from "@mui/icons-material/NearMeRounded";
import YourLibraryRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import ProfileRoundedIcon from "@mui/icons-material/PersonRounded";
import ShopRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Paths
import Home from "../pages/Home";
import Explore from "../pages/Explore";
import YourLibrary from "../pages/YourLibrary";
import Profile from "../pages/Profile";
import Shop from "../pages/Shop";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(UserContext); // Get user from context

  const [selectedMenu, setSelectedMenu] = useState(null);

  const Menus = [
    {
      title: "Home",
      icon: <HomeRoundedIcon />,
      path: "/home",
      element: <Home />,
    },
    {
      title: "Explore",
      icon: <ExploreRoundedIcon />,
      path: "/explore",
      element: <Explore />,
    },
    {
      title: "Your Library",
      icon: <YourLibraryRoundedIcon />,
      path: "/your-library",
      element: <YourLibrary />,
    },
    {
      title: "Profile",
      icon: <ProfileRoundedIcon />,
      path: "/profile",
      element: <Profile />,
    },
    {
      title: "Shop",
      icon: <ShopRoundedIcon />,
      path: "/shop",
      element: <Shop />,
    },
  ];

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu.title);
    navigate(menu.path);
  };

  useEffect(() => {
    if (user) {
      console.log(`Welcome, ${user.username}!`);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>; // Optionally handle loading state
  }

  return (
    <div className="h-screen w-64 text-[#E2DDF3] flex flex-col p-4 space-4 ml-3">
      {/** Header */}
      <div className="flex items-center p-2 mb-4 gap-2">
        <DuelLearnRoundedIcon />
        <span className="ml-2 text-xl font-bold">Duel Learn</span>
      </div>

      {/** Create New */}
      <div className="space-y-4 w-full text-left rounded-xl gap-2 m-1">
        <button className="w-full bg-[#381898] text-[#E2DDF3] py-2 rounded-lg hover:bg-[#4D18E8]">
          + Create New
        </button>
        <button className="w-full border-2 border-[#E2DDF3] text-white py-2 rounded-xl flex items-center justify-center hover:bg-[#4D18E8] hover:border-2 hover:border-[#4D18E8]">
          <span className="mr-2">▶</span> Play
        </button>
      </div>

      {/** Divider */}
      <hr className="border-[#3F3565] my-5 w-full" />

      {/** Navigation */}
      {Menus.map((menu, index) => (
        <button
          key={index}
          className={`flex items-center p-2 w-full text-left rounded-xl gap-2 m-1 ${
            selectedMenu === menu.title
              ? "border-2 border-[#4D18E8] text-[#4D18E8]"
              : "hover:text-[#A38CE6]"
          }`}
          onClick={() => handleMenuClick(menu)}
        >
          <span
            className={`ml-2 ${
              selectedMenu === menu.title ? "text-[#4D18E8]" : ""
            }`}
          >
            {menu.icon}
          </span>
          <span className="ml-2">{menu.title}</span>
        </button>
      ))}

      <div className="flex mt-auto mb-7 gap-3 w-full items-center ">
        <Avatar src="/broken-image.jpg" variant="rounded" />
        <div className="ml-2">
          <h1 className="text-s text-[#E2DDF3]">
            {user ? user.username : "Guest"}
          </h1>
          <p className="text-sm text-[#3F3565]">LVL. 10</p>
        </div>
        <span className="ml-auto">
          <MoreVertIcon />
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
