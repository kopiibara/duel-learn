// src/components/DrawerRightSideBar.tsx

import React from "react";
import { Drawer, Box } from "@mui/material";

interface DrawerProps {
  open: boolean;
  toggleDrawer: (open: boolean) => void;
}

const DrawerRightSideBar: React.FC<DrawerProps> = ({ open, toggleDrawer }) => {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={() => toggleDrawer(false)}
      sx={{
        width: "100%", // Full width
        height: "200px", // Set the height to 200px
        "& .MuiDrawer-paper": {
          height: "430px", // Set the drawer height
          width: "100%", // Full width
          borderRadius: "16px 16px 0 0", // Optional: rounded top corners for the drawer
          backgroundColor: "#080511",
        },
      }}
    >
      <Box className="p-4">
        {/* Add content for the drawer here */}
        <h3>Drawer Content</h3>
        <p>This can contain your leaderboards or friend list content</p>
      </Box>
    </Drawer>
  );
};

export default DrawerRightSideBar;
