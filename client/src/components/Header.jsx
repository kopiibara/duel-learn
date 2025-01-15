import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FlareIcon from "@mui/icons-material/Flare";
import NotificationsIcon from "@mui/icons-material/Notifications";

const SearchBar = () => {
  return (
    <div className="flex justify-between items-center w-full bg-[#080511] py-4">
      {/* Search Bar */}
      <div className="relative w-full max-w-[31.25rem]">
        <input
          type="text"
          placeholder="Search"
          className="bg-[#3B354D] text-[#E2DDF3]  w-full h-[2.5rem] rounded-xl pl-10 pr-4 text-sm placeholder-[#AFAFAF] focus:outline-none"
        />
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E2DDF3] " />
      </div>

      {/* Icon Container */}
      <div className="flex items-center space-x-4">
        {" "}
        {/* Increased space between icons */}
        {/* Coins Icon */}
        <div className="flex items-center text-[#E2DDF3] ">
          <AttachMoneyIcon />
          <span className="text-sm">100</span>{" "}
          {/* Placeholder for coins value */}
        </div>
        {/* Mana Icon */}
        <div className="flex items-center space-x-1 text-[#E2DDF3] ">
          <FlareIcon /> {/* Spark-like icon for mana */}
          <span className="text-sm">50</span> {/* Placeholder for mana value */}
        </div>
        {/* Notification Icon */}
        <button className="group relative p-2 rounded-full hover:bg-white hover:text-[#080511] transition-colors duration-300">
          <NotificationsIcon className="text-white group-hover:text-[#080511]" />
          {/* Optional: Add a badge for notifications */}
          <span className="absolute top-0 right-0 bg-red-500 text-[#E2DDF3]  text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
