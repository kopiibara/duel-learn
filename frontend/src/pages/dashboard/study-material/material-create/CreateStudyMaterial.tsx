import { useState } from "react";
import DocumentHead from "../../../../components/DocumentHead";
import {
  Box,
  Stack,
  Button,
  Typography,
  Divider,
  TextField,
  Chip,
} from "@mui/material";
import ItemComponent from "./ItemComponent";
import { motion, AnimatePresence } from "framer-motion"; // Importing from Framer Motion

const CreateStudyMaterial = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [items, setItems] = useState<
    { id: number; term: string; definition: string }[]
  >([]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault(); // Prevent form submission on Enter
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  // Function to handle adding a new item
  const handleAddItem = () => {
    // Create a new item with empty fields for term and definition
    setItems([...items, { id: Date.now(), term: "", definition: "" }]);
  };

  const handleDeleteItem = (id: number) => {
    // Filter out the deleted item
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: number, field: string, value: string) => {
    // Update the corresponding item in the state
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <Box>
      <DocumentHead title="Create Study Material" />
      <Stack spacing={2.5} className="px-8">
        {/* Title Input */}
        <Box className="sticky top-4 z-10">
          <Stack direction={"row"} spacing={2} className="flex items-center">
            <TextField
              id="title"
              label="Title"
              variant="standard"
              size="medium"
              sx={{
                width: "32rem",
                "& .MuiInputLabel-root": { color: "#3B354D" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#381898" },
                "& .MuiInput-root": { color: "#E2DDF3", fontWeight: 500 },
                "& .MuiInput-underline:before": {
                  borderBottomColor: "#3B354D",
                },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                  borderBottomColor: "#A38CE6",
                },
                "& .MuiInput-underline:after": { borderBottomColor: "#381898" },
              }}
            />
            <Box flexGrow={1} />
            <Button
              variant="contained"
              sx={{
                borderRadius: "0.8rem",
                padding: "0.4rem 2rem",
                display: "flex",
                width: "full",
                justifyContent: "center",
                alignItems: "center",
                borderColor: "#E2DDF3",
                color: "#E2DDF3",
                backgroundColor: "#4D18E8",
              }}
            >
              Save
            </Button>
          </Stack>
        </Box>

        {/* Tags Input */}
        <Box className="flex items-center">
          <Stack spacing={1} className="flex">
            <Typography variant="subtitle1" className="text-[#3B354D]">
              Tags
            </Typography>
            <Box
              sx={{
                display: "inline-flex", // Make the Box adjust based on content size
                alignItems: "center",
                flexWrap: "wrap",
                gap: 0.5,
                padding: "0.5rem",
                border: "1px solid #3B354D",
                borderRadius: "0.5rem",
                backgroundColor: "#3B354D",
                transition: "all 0.3s ease", // Smooth transition for hover and active
                minWidth: "200px", // Set the minimum width for the Box
                maxWidth: "100%", // Let the Box expand up to 100% of its container width
                width: "auto", // Allow Box to take the width of its content
                "&:hover": {
                  backgroundColor: "#4A435C", // Hover styles
                  borderColor: "#A38CE6",
                },
                "&:active": {
                  backgroundColor: "#2F283A", // Active styles
                  borderColor: "#9B85E1",
                },
              }}
              onClick={() => document.getElementById("tags")?.focus()}
            >
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  sx={{
                    backgroundColor: "#4D18E8",
                    color: "#E2DDF3",
                    padding: "0.4rem",
                    "& .MuiChip-deleteIcon": { color: "#E2DDF3" },
                  }}
                />
              ))}

              <input
                id="tags"
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add a tag"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "#E2DDF3",
                  flexGrow: 0, // Ensure the input does not force resizing of the Box
                  minWidth: "8rem", // Input should not be too small
                  fontSize: "1rem", // Adjust font size as needed
                  paddingLeft: 6, // Remove any default right padding that may create the extra space
                  textAlign: "left", // Ensure text is aligned properly
                }}
                className="tag-input-placeholder"
              />
            </Box>
          </Stack>
        </Box>

        {/* Counter for Items */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1">{items.length} Items</Typography>
            <Divider className="bg-[#3B354D] flex-1" />
          </Stack>
        </Box>

        {/* Upload File */}
        <Box>
          <Button
            variant="outlined"
            sx={{
              borderRadius: "0.5rem",
              padding: "0.4rem 2rem",
              display: "flex",
              width: "full",
              justifyContent: "center",
              color: "#3B354D",
              border: "0.15rem solid #3B354D",
              textTransform: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#E2DDF3",
                color: "#E2DDF3",
              },
            }}
          >
            Upload File
          </Button>
        </Box>

        {/* Items */}
        <Box className="pb-6">
          <Stack spacing={2}>
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ItemComponent
                    item={item}
                    deleteItem={() => handleDeleteItem(item.id)}
                    updateItem={(field, value) =>
                      handleUpdateItem(item.id, field, value)
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              variant="outlined"
              sx={{
                borderRadius: "0.6rem",
                padding: "0.6rem 2rem",
                display: "flex",
                width: "full",
                justifyContent: "center",
                color: "#3B354D",
                border: "0.15rem solid #3B354D",
                textTransform: "none",
                bottom: 0,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#E2DDF3",
                  color: "#E2DDF3",
                },
              }}
              onClick={handleAddItem}
            >
              Add New Item
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default CreateStudyMaterial;
