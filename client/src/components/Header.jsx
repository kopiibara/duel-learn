import React from "react";
import SearchField from "../hooks/SearchField"; // Assuming the SearchField component is in the same directory
import StatsNProfile from "./StatsNProfile"; // Assuming the SearchField component is in the same directory

const Header = () => {
  return (
    <div className="w-full h-28 pt-6 text-white shadow flex px-7 items-center justify-between">
      {/* Search Field */}
      <div className="flex-1 max-w-xl pr-6">
        <SearchField />
      </div>

      {/* Icon Section */}
      <div className="flex items-center space-x-2 sm:space-x-6 sm:pr-4">
        <StatsNProfile />
      </div>
    </div>
  );
};

export default Header;
