import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate, useLocation } from "react-router-dom"; // Add useLocation import
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
import { motion, AnimatePresence } from "framer-motion"; // Importing from Framer Motion
import { useUser } from "../../../../contexts/UserContext"; // Import the useUser hook
import AutoHideSnackbar from "../../../../components/ErrorsSnackbar"; // Adjust the
import Filter from "../../../../components/Filter"; // Adjust the

// Add these imports near the top with your other imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "../types/SortableItem";

const MAX_IMAGE_SIZE_MB = 10;
const MAX_TOTAL_PAYLOAD_MB = 50;

// Add this helper function to check file size
const getFileSizeInMB = (base64String: string): number => {
  // Base64 string length * 0.75 gives approximate size in bytes
  // (base64 encoding increases size by ~33%)
  const sizeInBytes = base64String.length * 0.75;
  return sizeInBytes / (1024 * 1024); // Convert to MB
};

// Add this function to recalculate item numbers after any change
const recalculateItemNumbers = (
  itemsArray: {
    id: number;
    term: string;
    definition: string;
    image?: File | null;
    item_number: number;
  }[]
) => {
  return itemsArray.map((item, index) => ({
    ...item,
    item_number: index + 1,
  }));
};

const CreateStudyMaterial = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Add this line
  const { user } = useUser();
  const socket = io(import.meta.env.VITE_BACKEND_URL);

  // Check if we're in edit mode
  const editMode = location.state?.editMode || false;
  const studyMaterialId = location.state?.studyMaterialId || null;
  const [_studyMaterial, setStudyMaterial] = useState(null);

  // Initialize state using data from location if in edit mode
  const [tags, setTags] = useState<string[]>(location.state?.tags || []);
  const [title, setTitle] = useState(location.state?.title || "");
  const [currentTag, setCurrentTag] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [items, setItems] = useState<
    {
      id: number;
      term: string;
      definition: string;
      image?: File | null;
      item_number: number;
    }[]
  >(location.state?.items || []);
  const [visibility, setVisibility] = useState<string>("0"); // Add this state for visibility

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end and update item_numbers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = currentItems.findIndex((item) => item.id === over.id);

        // First move the items around
        const newItems = arrayMove(currentItems, oldIndex, newIndex);

        // Then reassign item_number based on new positions using our helper function
        return recalculateItemNumbers(newItems);
      });
    }
  };

  // Update document title based on mode
  useEffect(() => {
    if (editMode) {
      document.title = `Edit ${title || "Study Material"}`;
    }
  }, [editMode, title]);

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
    const newItems = [
      ...items,
      {
        id: Date.now(),
        term: "",
        definition: "",
        item_number: items.length + 1,
      },
    ];

    // This is optional as adding to the end doesn't affect other item numbers
    // but keeps our logic consistent
    setItems(recalculateItemNumbers(newItems));
  };

  const handleDeleteItem = (id: number) => {
    // Filter out the deleted item
    const updatedItems = items.filter((item) => item.id !== id);

    // Recalculate item numbers for all remaining items
    setItems(recalculateItemNumbers(updatedItems));
  };

  // Update the handleUpdateItem function to validate image size
  const handleUpdateItem = (
    id: number,
    field: string,
    value: string | File | null
  ) => {
    // Check if the field is an image and it's a base64 string
    if (
      field === "image" &&
      typeof value === "string" &&
      value.startsWith("data:")
    ) {
      const imageSizeMB = getFileSizeInMB(value);

      if (imageSizeMB > MAX_IMAGE_SIZE_MB) {
        handleShowSnackbar(
          `Image too large (${imageSizeMB.toFixed(
            2
          )}MB). Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`
        );
        return; // Don't update the item with this image
      }

      // Calculate total payload size after adding this image
      let totalSize = 0;
      items.forEach((item) => {
        if (item.id !== id && item.image && typeof item.image === "string") {
          totalSize += getFileSizeInMB(item.image);
        }
      });
      totalSize += imageSizeMB;

      if (totalSize > MAX_TOTAL_PAYLOAD_MB) {
        handleShowSnackbar(
          `Total images size (${totalSize.toFixed(
            2
          )}MB) exceeds maximum allowed (${MAX_TOTAL_PAYLOAD_MB}MB).`
        );
        return; // Don't update the item with this image
      }
    }

    // Update the item if validation passes
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

  // Update the save button handler to preserve item_number values
  // Update the handleSaveButton function

  const handleSaveButton = async () => {
    if (!user?.username) {
      handleShowSnackbar("User is not authenticated.");
      return;
    }

    if (!user.firebase_uid) {
      handleShowSnackbar("User ID is not available.");
      return;
    }

    if (!title.trim() || items.length === 0) {
      handleShowSnackbar("Title and at least one item are required.");
      return;
    }

    // Define summary variable outside try block so it's accessible in the main scope
    let summary = "";

    try {
      // Generate summary using OpenAI
      const summaryPayload = {
        tags,
        items: items.map((item) => ({
          term: item.term,
          definition: item.definition,
        })),
      };

      console.log("Sending summary request with payload:", summaryPayload);

      try {
        const summaryResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/openai/generate-summary`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(summaryPayload),
          }
        );

        if (!summaryResponse.ok) {
          const errorData = await summaryResponse.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to generate summary");
        }

        const summaryData = await summaryResponse.json();
        summary = summaryData.summary;

        console.log("Generated summary:", summary);
      } catch (summaryError) {
        console.error("Error generating summary:", summaryError);
        // Create a fallback summary instead of failing the whole save process
        summary = title;
        handleShowSnackbar(
          "Couldn't generate summary, using title as fallback."
        );
      }

      // Continue with saving the study material using the summary (or fallback)

      // Check total payload size before sending
      let totalImageSize = 0;
      items.forEach((item) => {
        if (item.image && typeof item.image === "string") {
          totalImageSize += getFileSizeInMB(item.image);
        }
      });

      if (totalImageSize > MAX_TOTAL_PAYLOAD_MB) {
        handleShowSnackbar(
          `Total images size (${totalImageSize.toFixed(
            2
          )}MB) exceeds maximum allowed (${MAX_TOTAL_PAYLOAD_MB}MB). Please reduce image sizes or remove some images.`
        );
        return;
      }

      try {
        // Transform items to include base64 images and preserve item_number
        const transformedItems = items.map((item) => ({
          term: item.term,
          definition: item.definition,
          image: item.image || null,
          item_number: item.item_number, // Preserve the item number
        }));

        const studyMaterial = {
          studyMaterialId: editMode ? studyMaterialId : nanoid(),
          title,
          tags,
          summary, // Use the generated or fallback summary
          totalItems: items.length,
          visibility: parseInt(visibility), // Use the visibility state here
          createdBy: user.username,
          createdById: user.firebase_uid,
          items: transformedItems, // Now includes item_number
        };

        // Determine the endpoint based on whether we're creating or updating
        const endpoint = editMode
          ? `${import.meta.env.VITE_BACKEND_URL}/api/study-material/update`
          : `${import.meta.env.VITE_BACKEND_URL}/api/study-material/save`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studyMaterial),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || `Server error: ${response.status}`
          );
        }

        const savedData = await response.json();

        if (!savedData) {
          throw new Error("No data received from server");
        }

        // Create broadcast data with consistent property naming
        const broadcastData = {
          study_material_id:
            savedData.studyMaterialId || studyMaterial.studyMaterialId,
          title: savedData.title || title,
          tags: savedData.tags || tags,
          summary: savedData.summary || summary,
          total_items: savedData.totalItems || items.length,
          created_by: savedData.createdBy || user.username,
          created_by_id: savedData.createdById || user.firebase_uid,
          visibility: savedData.visibility,
          created_at: savedData.created_at || new Date().toISOString(),
          items: savedData.items || transformedItems,
        };

        // Emit the transformed data
        console.log("Emitting new study material event:", broadcastData);
        socket.emit("newStudyMaterial", broadcastData);

        // Navigate to preview page
        navigate(
          `/dashboard/study-material/view/${broadcastData.study_material_id}`
        );
      } catch (error) {
        console.error(
          editMode
            ? "Failed to update study material:"
            : "Failed to save study material:",
          error
        );
        handleShowSnackbar(
          error instanceof Error
            ? error.message
            : "Failed to save study material. Please try again."
        );
      }
    } catch (error) {
      console.error("Error in handleSaveButton:", error);
      handleShowSnackbar("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const fetchStudyMaterial = async () => {
      if (editMode && studyMaterialId) {
        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/study-material/get-by-study-material-id/${studyMaterialId}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch study material");
          }

          const data = await response.json();
          setStudyMaterial(data);

          // Check if current user is the creator
          if (user && user.firebase_uid !== data.created_by_id) {
            handleShowSnackbar(
              "You don't have permission to edit this study material"
            );
            navigate(`/dashboard/study-material/view/${studyMaterialId}`);
          }
        } catch (error) {
          console.error("Error fetching study material:", error);
          handleShowSnackbar("Error loading study material");
          navigate(-1);
        }
      }
    };

    fetchStudyMaterial();
  }, [editMode, studyMaterialId, user]);

  const handleDiscard = () => {
    if (editMode && studyMaterialId) {
      // If coming from edit mode, return to the view page for that specific material
      navigate(`/dashboard/study-material/view/${studyMaterialId}`);
    } else {
      // Otherwise, just go back to the previous page
      navigate(-1);
    }
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

  // Add a handler for the visibility change
  const handleVisibilityChange = (value: string | number) => {
    setVisibility(value.toString());
  };

  return (
    <>
      <PageTransition>
        <Box className="h-full w-full px-8">
          <DocumentHead
            title={
              editMode
                ? `Editing ${title || "Study Material"}`
                : title || "Create Study Material"
            }
          />
          <Stack spacing={2.5}>
            {/* Title Input */}
            <Box className="sticky top-4">
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
                <Stack direction={"row"} spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={handleDiscard}
                    sx={{
                      alignItems: "center",
                      borderColor: "#E2DDF3",
                      color: "#E2DDF3",
                      height: "fit-content",
                      borderRadius: "0.8rem",
                      padding: "0.4rem 2rem",
                      fontSize: "0.8rem",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    Discard
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: "0.8rem",
                      padding: "0.4rem 2rem",
                      display: "flex",
                      width: "full",
                      height: "fit-content",
                      borderColor: "#E2DDF3",
                      color: "#E2DDF3",
                      fontSize: "0.8rem",
                      backgroundColor: "#4D18E8",
                      transition: " all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                    onClick={handleSaveButton}
                  >
                    {editMode ? "Update" : "Save"}
                  </Button>
                </Stack>
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
                    borderRadius: "0.8rem",
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
              <Stack direction={"row"} spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: "0.8rem",
                    paddingX: "2rem",
                    display: "flex",
                    width: "auto",
                    justifyContent: "center",
                    color: "#3B354D",
                    height: "fit-content",
                    border: "0.15rem solid #3B354D",
                    textTransform: "none",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.03)",
                      borderColor: "#9F9BAE",
                      color: "#E2DDF3",
                    },
                  }}
                  onClick={handleUploadFile}
                >
                  Upload File
                </Button>
                <Box flex={1} />
                <Filter
                  menuItems={[
                    { value: "0", label: "Private" },
                    { value: "1", label: "Public" },
                  ]}
                  value={visibility}
                  onChange={handleVisibilityChange}
                  hoverOpen
                />
              </Stack>
            </Box>

            {/* Items */}
            <Box className="pb-6">
              <Stack spacing={2}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <AnimatePresence>
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <SortableItem
                            id={item.id}
                            item={item}
                            deleteItem={() => handleDeleteItem(item.id)}
                            updateItem={(field, value) =>
                              handleUpdateItem(item.id, field, value)
                            }
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                </DndContext>

                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: "0.8rem",
                    padding: "0.6rem 2rem",
                    display: "flex",
                    width: "full",
                    fontSize: "1rem",
                    justifyContent: "center",
                    color: "#3B354D",
                    border: "2px solid #3B354D",
                    textTransform: "none",
                    bottom: 0,
                    transform: "scale(1)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.005)",
                      borderColor: "#9F9BAE",
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
