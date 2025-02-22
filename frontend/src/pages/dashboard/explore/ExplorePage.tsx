import { Box, Stack, Button, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import DocumentHead from "../../../components/DocumentHead";
import PageTransition from "../../../styles/PageTransition";
import ExploreCards from "./ExploreCards";
import { useUser } from "../../../contexts/UserContext";
import { useSocket } from "../../../contexts/SocketContext";
import AutoHideSnackbar from "../../../components/ErrorsSnackbar";

interface Item {
  term: string;
  definition: string;
  image?: string | null;
}

interface StudyMaterial {
  title: string;
  tags: string[];
  images: string[];
  total_items: number;
  created_by: string;
  total_views: number;
  visibility: number;
  created_at: string;
  study_material_id: string;
  items: Item[];
}

const ExplorePage = () => {
  const { user } = useUser();
  const { socket } = useSocket();
  const [selected, setSelected] = useState<number>(0);
  const [cards, setCards] = useState<StudyMaterial[]>([]);
  const [filteredCards, setFilteredCards] = useState<StudyMaterial[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Separate function to fetch recommended cards
  const fetchRecommendedCards = async () => {
    if (user?.displayName) {
      try {
        const encodedUser = encodeURIComponent(user.displayName);
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/study-material/get-recommended-for-you/${encodedUser}`
        );
        const data: StudyMaterial[] = await response.json();

        if (Array.isArray(data)) {
          setCards(data);
          // Only update filtered cards if we're on the recommended view
          if (selected === 0) {
            setFilteredCards(data);
          }
        }
      } catch (error) {
        console.error("Error fetching recommended cards:", error);
      }
    }
  };

  // Socket connection and event handling
  useEffect(() => {
    if (socket && user?.displayName) {
      // Join user's room on connection
      socket.emit("joinRoom", user.displayName);

      const handleNewStudyMaterial = (data: {
        type: string;
        data: StudyMaterial;
        timestamp: string;
        creator: string;
      }) => {
        console.log("📩 Received new study material notification:", data);

        // Only show notification if:
        // 1. Material wasn't created by current user
        // 2. User is logged in
        if (user?.displayName && data.creator !== user.displayName) {
          // Show notification
          setSnackbarMessage(
            `New study material "${data.data.title}" by ${data.creator} is available!`
          );
          setSnackbarOpen(true);

          // Auto-refresh after snackbar duration (6 seconds)
          setTimeout(() => {
            fetchRecommendedCards();
            setSnackbarOpen(false);
          }, 6000);
        }
      };

      // Connect to socket and listen for events
      socket.connect();
      socket.on("studyMaterialCreated", handleNewStudyMaterial);

      return () => {
        socket.off("studyMaterialCreated", handleNewStudyMaterial);
        socket.disconnect();
      };
    }
  }, [socket, user]);

  // Initial data fetch
  useEffect(() => {
    fetchRecommendedCards();
  }, [user]);

  const fetchTopPicks = async () => {
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
    }
  };

  const handleClick = async (index: number) => {
    setSelected(index);
    switch (index) {
      case 0:
        await fetchRecommendedCards();
        break;
      case 1:
        await fetchTopPicks();
        break;
      case 2:
        setFilteredCards(
          cards.filter((card) => card.created_by === user?.displayName)
        );
        break;
      default:
        setFilteredCards([...cards]);
    }
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
      <Box className="h-full w-full">
        <DocumentHead title="Explore | Duel Learn" />
        <Stack className="px-5" spacing={2}>
          <Stack direction="row" spacing={1} paddingX={0.5}>
            {breadcrumbs}
          </Stack>
          <ExploreCards cards={filteredCards} />
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
