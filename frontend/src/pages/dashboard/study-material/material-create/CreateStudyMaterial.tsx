import { useState, useEffect } from "react";
import DocumentHead from "../../../../components/DocumentHead";
import PageTransition from "../../../../styles/PageTransition";
import {
  Box,
  Stack,
  Button,
  Typography,
  Divider,
  TextField,
  Chip,
} from "@mui/material";
import { nanoid } from "nanoid";
import ItemComponent from "./ItemComponent";
import { motion, AnimatePresence } from "framer-motion"; // Importing from Framer Motion
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext"; // Import the useUser hook
import AutoHideSnackbar from "../../../../components/ErrorsSnackbar"; // Adjust the
import { useSocket } from "../../../../contexts/SocketContext"; // Use socket context

const CreateStudyMaterial = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { socket } = useSocket();
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [items, setItems] = useState<
    {
      id: number;
      term: string;
      definition: string;
      image?: File | null;
    }[]
  >([]);

  useEffect(() => {
    if (socket) {
      socket.connect();
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

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

  const handleUpdateItem = (
    id: number,
    field: string,
    value: string | File | null
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleShowSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSaveButton = async () => {
    if (!user?.displayName) {
      handleShowSnackbar("User is not authenticated.");
      return;
    }

    if (!title.trim() || items.length === 0) {
      handleShowSnackbar("Title and at least one item are required.");
      return;
    }

    try {
      const studyMaterial = {
        studyMaterialId: nanoid(),
        title,
        tags,
        totalItems: items.length,
        visibility: 0,
        createdBy: user.displayName,
        items: await Promise.all(
          items.map(async (item) => ({
            ...item,
            image: item.image ? await convertFileToBase64(item.image) : null,
          }))
        ),
      };

      // Save to database
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/study-material/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studyMaterial),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const savedData = await response.json();

      // Emit socket event with full study material data
      if (socket?.connected) {
        console.log("📤 Emitting newStudyMaterial event:", savedData);
        socket.emit("newStudyMaterial", {
          ...savedData,
          created_by: user.displayName,
        });
      } else {
        console.warn("⚠️ Socket not connected, real-time updates disabled");
      }

      // Navigate to preview
      navigate(
        `/dashboard/study-material/preview/${savedData.studyMaterialId}`
      );
    } catch (error) {
      console.error("Failed to save study material:", error);
      handleShowSnackbar("Failed to save study material. Please try again.");
    }
  };

  // Function to convert a File to Base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUploadFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf, .docx, .jpg, .jpeg, .png, .gif";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log("Uploaded file:", file);
      }
    };
    input.click();
  };

  return (
    <>
      <PageTransition>
        <Box className="h-screen w-full px-8">
          <DocumentHead title={title || "Create Study Material"} />
          <Stack spacing={2.5}>
            {/* Title Input */}
            <Box className="sticky top-4 z-10">
              <Stack
                direction={"row"}
                spacing={2}
                className="flex items-center"
              >
                <TextField
                  id="title"
                  label="Title"
                  variant="standard"
                  value={title} // <-- Bind to state
                  onChange={(e) => setTitle(e.target.value)} // <-- Update state on change
                  sx={{
                    width: "32rem",

                    "& .MuiInputLabel-root": { color: "#3B354D" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#381898" },
                    "& .MuiInput-root": {
                      color: "#E2DDF3",
                      fontWeight: 500,
                      fontSize: "1.3rem",
                    },
                    "& .MuiInput-underline:before": {
                      borderBottomColor: "#3B354D",
                    },
                    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                      borderBottomColor: "#A38CE6",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottomColor: "#381898",
                    },
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

                    borderColor: "#E2DDF3",
                    color: "#E2DDF3",
                    backgroundColor: "#4D18E8",
                  }}
                  onClick={handleSaveButton}
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
                    padding: "0.6rem",
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
                    placeholder="Press enter"
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: "#E2DDF3",
                      width: "5.5rem", // Input should not be too small
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
                <Typography variant="subtitle1">
                  {items.length} Items
                </Typography>
                <Divider className="flex-1" />
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
                onClick={handleUploadFile}
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
                    fontSize: "1rem",
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
      </PageTransition>
      <AutoHideSnackbar
        message={snackbarMessage}
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
      />
    </>
  );
};

export default CreateStudyMaterial;
