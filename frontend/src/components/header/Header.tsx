// Header.tsx
import { useState } from "react";
import { IconButton, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DrawerSidebarMenu from "./DrawerSidebarMenu";
import SearchField from "./SearchField";
import StatsNProfile from "./StatsNProfile";
import { Box } from "@mui/system";

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const isMobile = useMediaQuery("(max-width:1022px)");
  const isVerySmall = useMediaQuery("(max-width:460px)");

  return (
    <Box
      className={`w-full shadow flex items-center justify-between bg-[#080511] ${
        isVerySmall ? "h-20 py-2" : "h-28 pt-6"
      }`}
      sx={{ zIndex: 1 }}
    >
      {/* Mobile Menu Icon */}
      {isMobile && (
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => toggleDrawer(true)}
          className={isVerySmall ? "ml-1" : ""}
          sx={{
            display: "block",
            mr: isVerySmall ? "6px" : "10px",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Search Field */}
      <Box
        className={`flex-1 ${
          isVerySmall ? "px-1" : isMobile ? "sm:pl-2" : "sm:pl-4 lg:pl-10"
        }`}
      >
        <SearchField />
      </Box>

      {/* Icon Section */}
      <div
        className={`flex items-center ${
          isVerySmall ? "space-x-1 pr-1" : "space-x-2 sm:space-x-6 sm:pr-4"
        }`}
      >
        <StatsNProfile />
      </div>

      {/* Drawer Menu Component */}
      <DrawerSidebarMenu
        drawerOpen={drawerOpen}
        toggleDrawer={toggleDrawer}
        collapsed={collapsed}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        hoveredIndex={hoveredIndex}
        setHoveredIndex={setHoveredIndex}
      />
    </Box>
  );
}
