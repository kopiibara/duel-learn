// ProfilePopover.js
import { Popover, Stack, Box, Button } from "@mui/material";

import { PopoverProps } from "@mui/material";

interface ProfilePopoverProps {
  anchorEl: PopoverProps["anchorEl"];
  open: boolean;
  handleClose: () => void;
}

export default function ProfilePopover({
  anchorEl,
  open,
  handleClose,
}: ProfilePopoverProps) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Box sx={{ p: 2, width: 220 }}>
        <Stack spacing={1}>
          {" "}
          <Button variant="text">Profile</Button>
          <Button variant="text">Settings</Button>
          <Button variant="text">Logout</Button>
        </Stack>
      </Box>
    </Popover>
  );
}
