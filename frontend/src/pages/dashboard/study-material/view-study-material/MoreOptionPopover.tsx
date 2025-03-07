// import  React from "react";
import { Popover, Button, Stack, Divider, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import coverPhoto from "../../../../assets/study-material-popover-icons/cover-photo.svg";
import shareIcon from "../../../../assets/study-material-popover-icons/share-icon.svg";
import printIcon from "../../../../assets/study-material-popover-icons/print-icon.svg";
import exportIcon from "../../../../assets/study-material-popover-icons/export-icon.svg";
import archiveIcon from "../../../../assets/study-material-popover-icons/archive-icon.svg";

interface MoreOptionPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  studyMaterialId: string;
  isOwner: boolean;
}

export default function MoreOptionPopover({
  anchorEl,
  open,
  onClose,
  studyMaterialId,
  isOwner,
}: MoreOptionPopoverProps) {
  const id = open ? "more-options-popover" : undefined;

  const navigate = useNavigate();

  const handleChangeCover = () => {
    console.log("Change Cover clicked");
    // Implement cover change functionality here
  };

  const handleShare = () => {
    console.log("Share clicked");
    // Implement share functionality here
  };

  const handlePrint = () => {
    console.log("Print clicked");
    // Implement print functionality here
  };

  const handleExport = () => {
    console.log("Export clicked");
    // Implement export functionality here
  };

  const handleArchive = async () => {
    if (!studyMaterialId) return;

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/study-material/archive/${studyMaterialId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Study material archived successfully");
        onClose();
        // Navigate back to the dashboard after archiving
        navigate("/dashboard/my-library");
      } else {
        const errorData = await response.json();
        console.error("Error archiving study material:", errorData);
      }
    } catch (error) {
      console.error("Error archiving study material:", error);
    }
  };

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          backgroundColor: "#120F1B", // Dark background
          borderRadius: "0.8rem",
          width: "18rem", // Set width of the popover
          padding: 2, // Adjust padding inside the popover
          mt: 1, // Space between the popover and profile button
        },
      }}
    >
      <Stack spacing={1.5}>
        <Button
          variant="text"
          startIcon={<img src={coverPhoto} alt="cover-photo" />}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: "inherit",
            fontWeight: 400,
            borderRadius: "0.8rem",
            padding: "0.6rem 1rem",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
              backgroundColor: "#3B354C",
            },
          }}
          onClick={handleChangeCover}
        >
          Change Cover
        </Button>
        <Button
          variant="text"
          startIcon={<img src={shareIcon} alt="share-icon" />}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: "inherit",
            fontWeight: 400,
            borderRadius: "0.8rem",
            padding: "0.6rem 1rem",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
              backgroundColor: "#3B354C",
            },
          }}
          onClick={handleShare}
        >
          Share
        </Button>
        <Button
          variant="text"
          startIcon={<img src={printIcon} alt="print-icon" />}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: "inherit",
            fontWeight: 400,
            padding: "0.6rem 1rem",
            borderRadius: "0.8rem",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
              backgroundColor: "#3B354C",
            },
          }}
          onClick={handlePrint}
        >
          Print
        </Button>
        <Button
          variant="text"
          startIcon={<img src={exportIcon} alt="export-icon" />}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: "inherit",
            fontWeight: 400,
            borderRadius: "0.8rem",
            padding: "0.6rem 1rem",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
              backgroundColor: "#3B354C",
            },
          }}
          onClick={handleExport}
        >
          Export
        </Button>

        {isOwner && (
          <Box>
            <Divider sx={{ height: "2px", backgroundColor: "#3B354C" }} />
            <Button
              variant="text"
              startIcon={<img src={archiveIcon} alt="archive-icon" />}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                color: "inherit",
                fontWeight: 400,
                borderRadius: "0.8rem",
                padding: "0.6rem 1rem",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: "#3B354C",
                },
              }}
              onClick={handleArchive}
            >
              Archive
            </Button>
          </Box>
        )}
      </Stack>
    </Popover>
  );
}
