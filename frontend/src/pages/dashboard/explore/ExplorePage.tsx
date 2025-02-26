import { Box, Stack, Button, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import DocumentHead from "../../../components/DocumentHead";
import PageTransition from "../../../styles/PageTransition";
import ExploreCards from "./ExploreCards";
import { useUser } from "../../../contexts/UserContext";
import AutoHideSnackbar from "../../../components/ErrorsSnackbar";
import { Item, StudyMaterial } from "../../../types/studyMaterial";
import cauldronGif from "../../../assets/General/Cauldron.gif"; // Importing the gif animation for cauldron asset

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
  const refreshData = async () => {
    switch (selected) {
      case 0:
        await fetchTopPicks();
        break;
      case 1:
        await fetchRecommendedCards();
        break;
      case 2:
        setFilteredCards(
          cards.filter((card) => card.created_by === user?.username)
        );
        break;
      default:
        setFilteredCards([...cards]);
    }
  };

  // Fetch recommended cards
  const fetchRecommendedCards = async () => {
    if (!user?.username) return;
    setIsLoading(true); // Set loading to true before fetch

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/study-material/get-recommended-for-you/${encodeURIComponent(
          user.username
        )}`
      );

      if (!response.ok) throw new Error("Failed to fetch recommended cards");

      const data: StudyMaterial[] = await response.json();

      if (Array.isArray(data)) {
        setCards(data);
        setFilteredCards(data);
      }
    } catch (error) {
      console.error("Error fetching recommended cards:", error);
    } finally {
      setIsLoading(false); // Set loading to false after fetch
    }
  };

  // Fetch top picks
  const fetchTopPicks = async () => {
    setIsLoading(true); // Set loading to true before fetch
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/study-material/get-top-picks`
      );
      const data: StudyMaterial[] = await response.json();

      if (Array.isArray(data)) {
        setFilteredCards(data);
      } else {
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error("Error fetching top picks:", error);
    } finally {
      setIsLoading(false); // Set loading to false after fetch
    }
  };

  useEffect(() => {
    if (!user?.username) return;

    // Initial data fetch
    fetchRecommendedCards();

    // Listen for real-time study material updates
    const handleNewMaterial = async (newMaterial: StudyMaterial) => {
      console.log("📡 Real-time update received:", newMaterial);
      setSnackbarMessage("📚 New study material added!");
      setSnackbarOpen(true);

      // Update the cards state and then refresh filtered cards
      setCards((prevCards) => {
        const updatedCards = [newMaterial, ...prevCards];
        setFilteredCards(updatedCards);
        return updatedCards;
      });
    };

    socket.on("broadcastStudyMaterial", handleNewMaterial);

    return () => {
      socket.off("broadcastStudyMaterial", handleNewMaterial);
    };
  }, [user?.username]); // Remove selected from dependencies

  // Handle category selection
  const handleClick = async (index: number) => {
    setSelected(index);
    await refreshData();
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
        color: selected === index ? "#E2DDF3" : "#3B354D",
        transition: "all 0.3s ease",
        "&:hover": { color: "inherit" },
      }}
      onClick={() => handleClick(index)}
    >
      <Typography variant="h5">{label}</Typography>
    </Button>
  ));

  return (
    <PageTransition>
      <Box className="h-full w-auto">
        <DocumentHead title="Explore | Duel Learn" />
        <Stack className="px-5" spacing={2}>
          <Stack direction="row" spacing={1} paddingX={0.5}>
            {breadcrumbs}
          </Stack>
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
                style={{ width: "200px", height: "200px" }}
              />
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
