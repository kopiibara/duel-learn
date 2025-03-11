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
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicatorRounded";
import AddPhotoIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import { motion, AnimatePresence } from "framer-motion";
import { ItemComponentProps } from "../types/itemComponent";

const ItemComponent: FC<ItemComponentProps> = ({
  item,
  deleteItem,
  updateItem,
  dragHandleProps,
  isDragging,
}) => {
  // Add a state to track grabbing state
  const [isGrabbing, setIsGrabbing] = useState(false);

  const [previewSrc, setPreviewSrc] = useState<string | null>(
    typeof item.image === "string"
      ? item.image
      : item.image instanceof File
      ? URL.createObjectURL(item.image)
      : null
  );

  const resizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = textarea.scrollHeight + "px"; // Set height to fit content
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
      className={`bg-[#080511] rounded-[0.8rem] border-2 ${getBorderClass()} w-full transition-colors duration-300 ease-in-out`}
    >
      <Stack spacing={1} direction={"row"} className="flex">
        {/* Drag Indicator with Item Number */}
        <Box
          className={`flex items-center rounded-tl-[0.65rem] rounded-bl-[0.7rem] border-[#211D2F] ${
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

        {/* Terms and Definition */}
        <Stack spacing={2} className="py-6 pr-8 pl-5 w-full">
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
                  <Box className="relative flex justify-center items-center w-full h-auto">
                    <img
                      src={previewSrc}
                      alt="Uploaded"
                      className="rounded-[0.8rem] max-w-full md:max-w-xs h-auto w-[14vw]"
                    />
                    <Tooltip title="Delete Photo" arrow>
                      <Fab
                        size="small"
                        color="secondary"
                        aria-label="delete"
                        onClick={handleDeleteImage}
                        sx={{
                          position: "absolute",
                          top: "0rem",
                          right: "1rem",
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
              spacing={2}
              className="flex items-center w-full"
            >
              <textarea
                id="term"
                className="border-none outline-none bg-[#3B354D] hover:bg-[#564e70] focus:bg-[#4A4361] text-[#E2DDF3] resize-none w-full content-stretch sm:w-1/3 text-[1rem] py-2 px-4 text-left rounded-[0.8rem] overflow-hidden transition-all ease-in-out duration-200"
                rows={1}
                placeholder="Enter Term"
                onInput={(e) => resizeTextarea(e.target as HTMLTextAreaElement)}
                value={item.term}
                onChange={(e) => updateItem("term", e.target.value)}
              />
              <textarea
                id="definition"
                className="border-none outline-none bg-[#3B354D] hover:bg-[#564e70] focus:bg-[#4A4361] text-[#E2DDF3] resize-none w-full content-stretch sm:w-2/3 text-[1rem] py-2 px-4 text-left rounded-[0.8rem] overflow-hidden transition-colors duration-200"
                rows={1}
                placeholder="Enter definition"
                onInput={(e) => resizeTextarea(e.target as HTMLTextAreaElement)}
                value={item.definition}
                onChange={(e) => updateItem("definition", e.target.value)}
              />
            </Stack>
          </Stack>

          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={1}
            className="flex items-center justify-between w-full pr-6"
          >
            <p className="text-[#9F9BAE] font-bold text-[0.9rem] pl-1">
              No. {item.item_number}
            </p>
            <Box flexGrow={1} />
            <Stack direction="row" spacing={1} className="flex items-center">
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
                className="bg-[#3B354D]"
              />
              <Tooltip title="Delete item" arrow>
                <IconButton
                  onClick={deleteItem}
                  className="transition-all duration-300 ease-in-out hover:scale-110"
                >
                  <img src="/delete-icon.svg" alt="delete" className="w-4" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ItemComponent;
