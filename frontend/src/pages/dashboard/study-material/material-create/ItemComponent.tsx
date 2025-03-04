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

// Define props interface for ItemComponent
interface ItemComponentProps {
  item: {
    id: number;
    term: string;
    definition: string;
    image?: string | File | null;
  };
  deleteItem: () => void;
  updateItem: (field: string, value: string | File | null) => void;
}

const ItemComponent: FC<ItemComponentProps> = ({
  item,
  deleteItem,
  updateItem,
}) => {
  const [previewSrc, setPreviewSrc] = useState<string | null>(
    typeof item.image === "string"
      ? item.image
      : item.image instanceof File
      ? URL.createObjectURL(item.image)
      : null
  );

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

  return (
    <Box className="bg-inherit rounded-[0.8rem] border-2 border-[#3B354D] w-full">
      <Stack spacing={1} direction={"row"} className="flex">
        {/* Drag Indicator */}
        <Box className="flex items-center rounded-tl-[0.7rem] rounded-bl-[0.7rem] border-[#211D2F] bg-[#211D2F] w-auto border">
          <Button
            className="h-full"
            sx={{
              "&:hover": { color: "#6C63FF", cursor: "grab" },
              "&:active": { color: "#FF6F61", cursor: "grabbing" },
              "& .MuiTouchRipple-root": { color: "#3B354D" },
            }}
          >
            <DragIndicatorIcon className="text-[#3B354D]" />
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
                      className="rounded-md max-w-full md:max-w-xs h-auto"
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
                className="border-none outline-none bg-[#3B354D] text-[#E2DDF3] resize-none w-full sm:w-1/3 text-[1rem] py-2 px-4 text-left rounded-[0.6rem] overflow-hidden"
                rows={1}
                placeholder="Enter Term"
                value={item.term}
                onChange={(e) => updateItem("term", e.target.value)}
              />
              <textarea
                id="definition"
                className="border-none outline-none bg-[#3B354D] text-[#E2DDF3] resize-none w-full sm:w-2/3 text-[1rem] py-2 px-4 text-left rounded-[0.6rem] overflow-hidden"
                rows={1}
                placeholder="Enter definition"
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
                className="text-[#E2DDF3] text-[0.8rem]"
              />
              <Tooltip title="Add Photo" arrow>
                <IconButton onClick={handleAddPhoto}>
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
                <IconButton onClick={deleteItem}>
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
