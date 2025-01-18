import { useState } from "react";
import {
  Box,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Tooltip,
  Zoom,
} from "@mui/material";
import ProfilePopover from "./ProfilePopover";
import SearchField from "./SearchField";
import ManaCoins from "./ManaCoins";

export default function Header() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box className="flex-1 pt-10 pb-4">
      <AppBar position="sticky" elevation={0} color="transparent">
        <Toolbar className="gap-3">
          <SearchField />
          <Box flexGrow={1} />
          <ManaCoins />
          <Tooltip title="Profile" arrow slots={{ transition: Zoom }}>
            <IconButton
              aria-label="profile"
              onClick={handleClick}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(75, 23, 205, 0.1)",
                },
              }}
            >
              <Avatar
                alt="Profile"
                variant="rounded"
                src="/mock-data/profile-picture/kopibara.jpg"
              />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ProfilePopover Component */}
      <ProfilePopover
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
      />
    </Box>
  );
}
