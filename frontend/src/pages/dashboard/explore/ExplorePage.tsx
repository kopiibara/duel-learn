import { Box, Stack, Button, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import DocumentHead from "../../../components/DocumentHead";
import PageTransition from "../../../styles/PageTransition";
import ExploreCards from "./ExploreCards";
import { useUser } from "../../../contexts/UserContext";
import AutoHideSnackbar from "../../../components/ErrorsSnackbar";
import { StudyMaterial } from "../../../types/studyMaterialObject";
import cauldronGif from "../../../assets/General/Cauldron.gif";
import noStudyMaterial from "../../../assets/images/NoStudyMaterial.svg";

const ExplorePage = () => {
  const { user } = useUser();
  const [selected, setSelected] = useState<number>(0);
  const [cards, setCards] = useState<StudyMaterial[]>([]);
  const [filteredCards, setFilteredCards] = useState<StudyMaterial[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Move socket initialization outside of the component or useEffect
  const [socket] = useState(() =>
    io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket", "polling"],
    })
  );

  // Fetch data based on current selection
  const refreshData = async (currentSelection = selected) => {
    switch (currentSelection) {
      case 0:
        await fetchTopPicks();
        break;
      case 1:
        await fetchRecommendedCards();
        break;
      case 2:
        await fetchMadeByFriends();
        break;
      default:
        setFilteredCards([...cards]);
    }
  };

  // Fix the fetchRecommendedCards function to be fully consistent
  const fetchRecommendedCards = async () => {
    console.log("Fetching recommended cards for:", user?.username);

    // Clear BOTH states immediately upon starting a new fetch
    setCards([]);
    setFilteredCards([]);

    if (!user?.username) {
      setIsLoading(false);
      return;
    }

    const encodedUser = encodeURIComponent(user?.username);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/study-material/get-recommended-for-you/${encodedUser}`
      );

      if (response.status === 404) {
        console.log("No tags found for user. Showing empty results.");
        return; // Both states already cleared above
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch recommended cards: ${errorText}`);
      }

      const data: StudyMaterial[] = await response.json();
      console.log("Fetched data:", data);

      if (Array.isArray(data) && data.length > 0) {
        setCards(data);
        setFilteredCards(data);
      }
      // No need for else case - states are already cleared at the beginning
    } catch (error) {
      console.error("Error fetching recommended cards:", error);
      // States already cleared at the beginning
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch top picks
  const fetchTopPicks = async () => {
    // Clear both states immediately
    setCards([]);
    setFilteredCards([]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/study-material/get-top-picks`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch top picks: ${response.status}`);
      }

      const data: StudyMaterial[] = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setCards(data);
        setFilteredCards(data);
      }
    } catch (error) {
      console.error("Error fetching top picks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMadeByFriends = async () => {
    // Clear both states immediately
    setCards([]);
    setFilteredCards([]);

    if (!user?.firebase_uid) {
      console.error("Username is undefined");
      setIsLoading(false);
      setSnackbarMessage("User information missing. Please log in again.");
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/study-material/get-made-by-friends/${encodeURIComponent(
          user.firebase_uid
        )}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch: ${response.status} - ${errorText}`);
      }

      const data: StudyMaterial[] = await response.json();
      console.log("Fetched study materials from friends:", data);

      if (Array.isArray(data)) {
        setCards(data);
        setFilteredCards(data);
      } else {
        console.error("Unexpected response format:", data);
        setCards([]);
        setFilteredCards([]);
      }
    } catch (error) {
      console.error("Error fetching study materials from friends:", error);
      setCards([]);
      setFilteredCards([]);
      setSnackbarMessage(
        "Failed to load friend materials. Please try again later."
      );
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the isRelevantToCurrentView function
  const isRelevantToCurrentView = async (material: StudyMaterial) => {
    if (!user?.firebase_uid) return false;

    // For "Top Picks" - always relevant
    if (selected === 0) return true;

    // For "Recommended for You" - check if tags match user's interests
    if (selected === 1) {
      // You can implement a more sophisticated check here
      // For now, we'll just refresh the recommended data
      return true;
    }

    // For "Made by Friends" - check if creator is a friend
    if (selected === 2) {
      try {
        // Quick check if the material was created by a friend
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/study-material/get-made-by-friends/${
            user.firebase_uid
          }/${encodeURIComponent(material.created_by_id || "")}`
        );

        if (response.ok) {
          const { isFriend } = await response.json();
          return isFriend;
        }
        return false;
      } catch (error) {
        console.error("Error checking friendship:", error);
        return false;
      }
    }

    return false;
  };

  useEffect(() => {
    if (!user?.username) return;

    // Initial data fetch
    refreshData(selected);

    // Set up socket connection properly
    socket.emit("setup", user.firebase_uid);

    // Listen for real-time study material updates with better debugging
    const handleNewMaterial = async (newMaterial: StudyMaterial) => {
      console.log("📡 Real-time update received:", newMaterial);

      // Enhanced debugging
      console.log(`Current selection: ${selected}`);
      console.log(`Material creator ID: ${newMaterial.created_by_id}`);
      console.log(`Current user ID: ${user.firebase_uid}`);

      try {
        // Check if this material is relevant to the current view
        const isRelevant = await isRelevantToCurrentView(newMaterial);
        console.log(`Is material relevant to current view? ${isRelevant}`);

        if (isRelevant) {
          console.log("Refreshing data for view:", selected);
          // Refresh the current data view
          refreshData(selected);
        } else {
          console.log(
            "Material not relevant to current view. No refresh needed."
          );
        }
      } catch (error) {
        console.error("Error processing new study material:", error);
        // Still refresh data to be safe
        refreshData(selected);
      }
    };

    console.log("Setting up socket listener for broadcastStudyMaterial events");
    socket.on("broadcastStudyMaterial", handleNewMaterial);

    return () => {
      console.log("Cleaning up socket listener");
      socket.off("broadcastStudyMaterial", handleNewMaterial);
    };
  }, [user?.username, user?.firebase_uid, selected, socket]); // Include all dependencies

  // Add this useEffect for socket connection setup
  useEffect(() => {
    if (!user?.firebase_uid) return;

    // Set up socket connection
    console.log("Setting up socket connection for user:", user.firebase_uid);
    socket.connect();
    socket.emit("setup", user.firebase_uid);

    // Handle connection events
    socket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSnackbarMessage("Connection error.");
      setSnackbarOpen(true);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [user?.firebase_uid, socket]);

  // Handle category selection
  const handleClick = (index: number) => {
    setSelected((prev) => {
      const newSelected = index;
      refreshData(newSelected); // Pass the updated value
      return newSelected;
    });
  };

  const breadcrumbLabels = [
    "Top picks",
    "Recommended for you",
    "Made by friends",
  ];
  const breadcrumbs = breadcrumbLabels.map((label, index) => (
    <Button
      key={index}
      sx={{
        textTransform: "none",
        borderRadius: "0.8rem",
        padding: "0.5rem 1rem",
        color: selected === index ? "#E2DDF3" : "#3B354D",
        transition: "all 0.3s ease",
        "&:hover": {
          color: "inherit",
          transform: "scale(1.01)",
          backgroundColor: "#3B354C",
        },
      }}
      onClick={() => handleClick(index)}
    >
      <Typography variant="h6">{label}</Typography>
    </Button>
  ));

  return (
    <PageTransition>
      <Box className="h-full w-auto">
        <DocumentHead title="Explore | Duel Learn" />
        <Stack className="px-5" spacing={2}>
          <Stack direction="row">{breadcrumbs}</Stack>
          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="60vh"
            >
              <img
                src={cauldronGif}
                alt="Loading..."
                style={{ width: "8rem", height: "auto" }}
              />
            </Box>
          ) : filteredCards.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              minHeight="60vh"
            >
              <img
                src={noStudyMaterial}
                alt="No Study Materials"
                style={{ width: "20rem", height: "auto" }}
              />
              <p className="text-[#6F658D] font-bold text-[1rem] mt-4 pr-7 text-center">
                {selected === 1
                  ? "No recommended study materials found for you yet"
                  : selected === 2
                  ? "No study materials from your friends found"
                  : "No study materials available"}
              </p>
            </Box>
          ) : (
            <ExploreCards cards={filteredCards} />
          )}
        </Stack>
        <AutoHideSnackbar
          message={snackbarMessage}
          open={snackbarOpen}
          onClose={() => setSnackbarOpen(false)}
        />
      </Box>
    </PageTransition>
  );
};

export default ExplorePage;
