import * as React from "react";
import { Popover, Button, Stack, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ShareLink from "./ShareLink";
import coverPhoto from "../../../../assets/study-material-popover-icons/cover-photo.svg";
import shareIcon from "../../../../assets/study-material-popover-icons/share-icon.svg";
import printIcon from "../../../../assets/study-material-popover-icons/print-icon.svg";
import exportIcon from "../../../../assets/study-material-popover-icons/export-icon.svg";
import archiveIcon from "../../../../assets/study-material-popover-icons/archive-icon.svg";
import restoreIcon from "../../../../assets/study-material-popover-icons/restore-icon.svg";
import deleteIcon from "../../../../assets/study-material-popover-icons/delete-icon.svg";

interface MoreOptionPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  studyMaterialId: string;
  isOwner: boolean;
  status?: string; // Add this prop to track if material is archived
}

export default function MoreOptionPopover({
  anchorEl,
  open,
  onClose,
  studyMaterialId,
  isOwner,
  status,
}: MoreOptionPopoverProps) {
  const id = open ? "more-options-popover" : undefined;

  const navigate = useNavigate();
  const [shareModalOpen, setShareModalOpen] = React.useState(false);

  const handleChangeCover = () => {
    console.log("Change Cover clicked");
    // Implement cover change functionality here
  };

  const handleShare = () => {
    setShareModalOpen(true);
    onClose();
  };

  const handleShareModalClose = () => {
    setShareModalOpen(false);
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
        navigate(`/dashboard/my-library`);
      } else {
        const errorData = await response.json();
        console.error("Error archiving study material:", errorData);
      }
    } catch (error) {
      console.error("Error archiving study material:", error);
    }
  };

  const handleRestore = async () => {
    if (!studyMaterialId) return;

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/study-material/restore/${studyMaterialId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Study material restored successfully");
        onClose();
        // Refresh the current page to show updated status
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error("Error restoring study material:", errorData);
      }
    } catch (error) {
      console.error("Error restoring study material:", error);
    }
  };

  const handleDelete = async () => {
    if (!studyMaterialId) return;

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/study-material/delete/${studyMaterialId}`,
        {
          method: "POST", // Changed from DELETE to POST to match the backend route
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Study material deleted successfully");
        onClose();
        // Navigate back to the dashboard after deleting
        navigate("/dashboard/my-library");
      } else {
        const errorData = await response.json();
        console.error("Error deleting study material:", errorData);
      }
    } catch (error) {
      console.error("Error deleting study material:", error);
    }
  };

  return (
    <>
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
            <>
              <Divider sx={{ height: "2px", backgroundColor: "#3B354C" }} />

              {status === "archived" ? (
                // If archived, show restore and delete buttons
                <>
                  <Button
                    variant="text"
                    startIcon={<img src={restoreIcon} alt="export-icon" />}
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
                    onClick={handleRestore}
                  >
                    Restore
                  </Button>
                  <Button
                    variant="text"
                    startIcon={<img src={deleteIcon} alt="export-icon" />}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      color: "#FF4141", // Red color for delete
                      fontWeight: 400,
                      borderRadius: "0.8rem",
                      padding: "0.6rem 1rem",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                        backgroundColor: "rgba(255, 82, 82, 0.1)",
                      },
                    }}
                    onClick={handleDelete}
                  >
                    Delete Permanently
                  </Button>
                </>
              ) : (
                // If not archived, show archive button
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
              )}
            </>
          )}
        </Stack>
      </Popover>
      <ShareLink
        open={shareModalOpen}
        onClose={handleShareModalClose}
        studyMaterialId={studyMaterialId}
      />
    </>
  );
}
