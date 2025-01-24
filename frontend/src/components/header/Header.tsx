// src/components/Header.tsx

import React, { useState } from "react";
import { Box, IconButton, AppBar, Toolbar, Avatar, Tooltip, Zoom, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import DrawerSidebar from "./DrawerSidebar"; // Import the new Drawer component
import SearchField from "./SearchField";
import StatsNProfile from "./StatsNProfile";

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const isMobile = useMediaQuery("(max-width:1022px)");

  return (
    <div className="w-full h-28 pt-6 text-white shadow flex ps-7 pe-3 items-center justify-between">
      {isMobile && (
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => toggleDrawer(true)}
          sx={{
            display: "block",
            mr: "10px",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Search Field */}
      <div className="flex-1 max-w-xl pr-6">
        <SearchField />
      </div>

      {/* Icon Section */}
      <div className="flex items-center space-x-2 sm:space-x-6 sm:pr-4">
        <StatsNProfile />
      </div>

      <DrawerSidebar
        open={drawerOpen}
        toggleDrawer={toggleDrawer}
        collapsed={collapsed}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </div>
  );
};

export default Header;
