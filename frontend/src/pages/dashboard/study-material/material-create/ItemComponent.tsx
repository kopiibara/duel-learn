import { FC, useState } from "react";
import {
  Box,
  Stack,
  Button,
  FormControlLabel,
  Switch,
  Tooltip,
  IconButton,
  Divider,
  Fab,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicatorRounded";
import AddPhotoIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import { motion, AnimatePresence } from "framer-motion";
import { ItemComponentProps } from "../types/itemComponent";

const MAX_TERM_LENGTH = 50; // Define max term length
const MAX_DEFINITION_LENGTH = 200; // Define max definition length

const ItemComponent: FC<ItemComponentProps> = ({
  item,
  deleteItem,
  updateItem,
  dragHandleProps,
  isDragging,
}) => {
  // Add MUI theme and media query to detect mobile view
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Add a state to track grabbing state
  const [isGrabbing, setIsGrabbing] = useState(false);

  const [previewSrc, setPreviewSrc] = useState<string | null>(
    typeof item.image === "string"
      ? item.image
      : item.image instanceof File
      ? URL.createObjectURL(item.image)
      : null
  );
  // Replace your existing resizeTextarea function with this enhanced version:

  const resizeTextarea = (textarea: HTMLTextAreaElement) => {
    // Store the current scroll position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Reset height first to correctly calculate new height
    textarea.style.height = "auto";

    // Calculate new height based on scrollHeight
    const newHeight = textarea.scrollHeight;

    // Apply the new height
    textarea.style.height = `${newHeight}px`;

    // For mobile view, ensure the width is properly constrained
    if (isMobile) {
      // Force the width to match the container width
      // This prevents horizontal scrolling issues on mobile
      textarea.style.width = "100%";
    }

    // Restore scroll position (prevents page jumping)
    window.scrollTo(0, scrollTop);
  };

  const handleAddPhoto = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setPreviewSrc(base64String);
          updateItem("image", base64String);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleDeleteImage = () => {
    setPreviewSrc(null);
    updateItem("image", null); // Remove image from state
  };

  // Add functions to handle grab and release
  const handleGrabStart = () => setIsGrabbing(true);
  const handleGrabEnd = () => setIsGrabbing(false);

  // Determine the border class based on the current state
  const getBorderClass = () => {
    if (isDragging) return "ring-[0.1rem] ring-[#A38CE6] border-[#A38CE6]";
    if (isGrabbing) return "border-[#A38CE6] z-10"; // New color when grabbing
    return "border-[#3B354D] hover:border-[#9F9BAE]";
  };

  return (
    <Box
      className={`bg-[#080511] rounded-[0.8rem] border-2 ${getBorderClass()} w-full transition-colors duration-300 ease-in-out ${
        isMobile ? "relative cursor-grab active:cursor-grabbing" : ""
      }`}
      {...(isMobile ? dragHandleProps : {})}
    >
      <Stack spacing={1} direction={"row"} className="flex">
        {/* Drag Indicator with Item Number - Hidden on mobile */}
        {!isMobile && (
          <Box
            className={`flex items-center rounded-tl-[0.8rem] rounded-bl-[0.8rem] border-[#211D2F] ${
              isGrabbing ? "bg-[#3B354D]" : "bg-[#211D2F]"
            } w-auto border transition-colors duration-200`}
            {...dragHandleProps?.attributes}
          >
            <Button
              className="h-full"
              sx={{
                cursor: isGrabbing ? "grabbing" : "grab",
                color: isGrabbing ? "#3B354D" : "inherit",
                "&:active": { cursor: "grabbing", color: "#3B354D" },
                "&:hover": { color: "#6C63FF" },
                "& .MuiTouchRipple-root": { color: "#3B354D" },
                transition: "all 0.2s ease",
              }}
              {...dragHandleProps?.listeners}
              onMouseDown={handleGrabStart}
              onMouseUp={handleGrabEnd}
              onMouseLeave={handleGrabEnd} // In case the user drags out of the button
              onTouchStart={handleGrabStart}
              onTouchEnd={handleGrabEnd}
            >
              <DragIndicatorIcon
                className={isGrabbing ? "text-[#A38CE6]" : "text-[#3B354D]"}
              />
            </Button>
          </Box>
        )}

        {/* Terms and Definition */}
        <Stack
          spacing={2}
          className={`py-4 sm:py-6 ${
            isMobile ? "px-4" : "pr-4 sm:pr-8 pl-3 sm:pl-5"
          } w-full ${isMobile ? "rounded-[0.8rem]" : ""}`}
        >
          {/* Item number for mobile - Shown at the top on mobile */}
          {isMobile && (
            <p className="text-[#9F9BAE] font-bold text-[0.9rem]">
              No. {item.item_number}
            </p>
          )}

          <Stack spacing={2} className="w-full">
            {/* Image */}
            {previewSrc && (
              <AnimatePresence>
                <motion.div
                  key="photo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box className="relative flex justify-center items-center w-full">
                    <img
                      src={previewSrc}
                      alt="Uploaded"
                      className="rounded-[0.8rem] max-w-full w-full h-auto max-h-[250px] object-contain"
                    />

                    <Tooltip title="Delete Photo" arrow>
                      <Fab
                        size="small"
                        color="secondary"
                        aria-label="delete"
                        onClick={handleDeleteImage}
                        sx={{
                          position: "absolute",
                          top: "0.5rem",
                          right: "0.5rem",
                          backgroundColor: "inherit",
                          "&:hover": { backgroundColor: "#3B354D" },
                        }}
                      >
                        <DeleteIcon />
                      </Fab>
                    </Tooltip>
                  </Box>
                </motion.div>
              </AnimatePresence>
            )}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2 }}
              className="flex items-start w-full"
            >
              <Stack className="w-full sm:w-1/3">
                <textarea
                  id="term"
                  className="border-none outline-none bg-[#3B354D] hover:bg-[#564e70] focus:bg-[#4A4361] text-[#E2DDF3] resize-none w-full content-stretch text-[1rem] py-2 px-4 text-left rounded-[0.8rem] overflow-hidden transition-all ease-in-out duration-200"
                  rows={1}
                  placeholder="Enter Term"
                  onInput={(e) =>
                    resizeTextarea(e.target as HTMLTextAreaElement)
                  }
                  value={item.term}
                  onChange={(e) => updateItem("term", e.target.value)}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      item.term.length >= MAX_TERM_LENGTH
                        ? "#E57373"
                        : "#6F658D",
                    transition: "color 0.3s ease-in-out",
                    fontSize: "0.75rem",
                    textAlign: "right",
                    marginTop: "0.2rem",
                  }}
                >
                  {item.term.length}/{MAX_TERM_LENGTH} characters
                </Typography>
              </Stack>

              <Stack className="w-full sm:w-2/3">
                <textarea
                  id="definition"
                  className="border-none outline-none bg-[#3B354D] hover:bg-[#564e70] focus:bg-[#4A4361] text-[#E2DDF3] resize-none w-full content-stretch text-[1rem] py-2 px-4 text-left rounded-[0.8rem] overflow-hidden transition-colors duration-200"
                  rows={1}
                  placeholder="Enter definition"
                  onInput={(e) =>
                    resizeTextarea(e.target as HTMLTextAreaElement)
                  }
                  value={item.definition}
                  onChange={(e) => updateItem("definition", e.target.value)}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      item.definition.length >= MAX_DEFINITION_LENGTH
                        ? "#E57373"
                        : "#6F658D",
                    transition: "color 0.3s ease-in-out",
                    fontSize: "0.75rem",
                    textAlign: "right",
                    marginTop: "0.2rem",
                  }}
                >
                  {item.definition.length}/{MAX_DEFINITION_LENGTH} characters
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            className="flex items-start sm:items-center justify-between w-full pr-2 sm:pr-6"
          >
            {/* Item number - Only show on desktop */}
            {!isMobile && (
              <p className="text-[#9F9BAE] font-bold text-[0.9rem] pl-1">
                No. {item.item_number}
              </p>
            )}
            <Box flexGrow={1} className="hidden sm:block" />
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              className="flex items-start sm:items-center w-full sm:w-auto mt-2 sm:mt-0"
            >
              <FormControlLabel
                control={
                  <Switch
                    sx={{
                      "& .MuiSwitch-switchBase": {
                        color: "#3B354D",
                        "&.Mui-checked": { color: "#4D18E8" },
                        "&.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#3B354D",
                        },
                      },
                      "& .MuiSwitch-track": { backgroundColor: "#211D2F" },
                    }}
                  />
                }
                label="AI Cross-Referencing"
                className="text-[#9F9BAE] text-[0.8rem]"
              />
              <Box className="flex items-center space-x-2 mt-2 sm:mt-0">
                <Tooltip title="Add Photo" arrow>
                  <IconButton
                    onClick={handleAddPhoto}
                    className="transition-all duration-300 ease-in-out hover:scale-110"
                  >
                    <AddPhotoIcon className="text-[#3B354D]" />
                  </IconButton>
                </Tooltip>

                <Divider
                  orientation="vertical"
                  variant="middle"
                  flexItem
                  className="bg-[#3B354D] hidden sm:block"
                />

                <Tooltip title="Delete item" arrow>
                  <IconButton
                    onClick={deleteItem}
                    className="transition-all duration-300 ease-in-out hover:scale-110"
                  >
                    <img src="/delete-icon.svg" alt="delete" className="w-4" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* Mobile visual drag indicator */}
      {isMobile && (
        <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 h-10 w-1.5 bg-[#3B354D] rounded-full opacity-70"></div>
      )}
    </Box>
  );
};

export default ItemComponent;
