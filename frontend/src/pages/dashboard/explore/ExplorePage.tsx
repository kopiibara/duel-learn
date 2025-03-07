import { Box, Stack, Button, Typography, Skeleton } from "@mui/material";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import DocumentHead from "../../../components/DocumentHead";
import PageTransition from "../../../styles/PageTransition";
import ExploreCards from "./ExploreCards";
import { useUser } from "../../../contexts/UserContext";
import AutoHideSnackbar from "../../../components/ErrorsSnackbar";
import { StudyMaterial } from "../../../types/studyMaterialObject";
import noStudyMaterial from "../../../assets/images/NoStudyMaterial.svg";

const ExplorePage = () => {
  const { user } = useUser();
  const [selected, setSelected] = useState<number>(0);
  const [cards, setCards] = useState<StudyMaterial[]>([]);
  const [filteredCards, setFilteredCards] = useState<StudyMaterial[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Memoize socket instance
  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_BACKEND_URL, {
        transports: ["websocket", "polling"],
        autoConnect: false, // Avoid auto-connection before setup
      }),
    []
  );

  // Function to fetch study materials based on selected category
  const fetchData = useCallback(async () => {
    if (!user?.username) return;

    console.log(`Fetching data for tab: ${selected}`); // Debug which tab is being fetched
    setIsLoading(true);
    setCards([]);
    setFilteredCards([]);

    try {
      let url = "";
      switch (selected) {
        case 0:
          url = `${
            import.meta.env.VITE_BACKEND_URL
          }/api/study-material/get-top-picks`;
          console.log("Fetching top picks from:", url);
          break;
        case 1:
          url = `${
            import.meta.env.VITE_BACKEND_URL
          }/api/study-material/get-recommended-for-you/${encodeURIComponent(
            user.username
          )}`;
          console.log("Fetching recommendations from:", url);
          break;
        case 2:
          url = `${
            import.meta.env.VITE_BACKEND_URL
          }/api/study-material/get-made-by-friends/${encodeURIComponent(
            user.firebase_uid
          )}`;
          console.log("Fetching friends' materials from:", url);
          break;
        default:
          return;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const data: StudyMaterial[] = await response.json();
      if (Array.isArray(data)) {
        setCards(data);
        setFilteredCards(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selected, user?.username, user?.firebase_uid]);

  // Add a ref to track initial mount
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Prevents the initial double fetch
    }
    console.log(`Tab selected: ${selected}`);
    fetchData();
  }, [selected, fetchData]);

  // Modify the socket effect
  useEffect(() => {
    if (!user?.firebase_uid) return;

    socket.connect();
    socket.emit("setup", user.firebase_uid);

    const handleNewMaterial = async (newMaterial: StudyMaterial) => {
      if (!isInitialMount.current) {
        console.log("📡 Real-time update received:", newMaterial);
        fetchData();
      }
    };

    socket.on("broadcastStudyMaterial", handleNewMaterial);

    return () => {
      socket.off("broadcastStudyMaterial", handleNewMaterial);
      socket.disconnect();
    };
  }, [socket, user?.firebase_uid, selected, fetchData]);

  // Add a cleanup effect for the ref when component unmounts

  return (
    <PageTransition>
      <Box className=" h-full w-auto">
        <DocumentHead title="Explore | Duel Learn" />
        <Stack className="px-5" spacing={2}>
          <Stack direction="row">
            {["Top picks", "Recommended for you", "Made by friends"].map(
              (label, index) => (
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
                  onClick={() => {
                    console.log(`Switching to tab: ${index} (${label})`);
                    setSelected(index);
                  }}
                >
                  <Typography variant="h6">{label}</Typography>
                </Button>
              )
            )}
          </Stack>
          {isLoading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                gap: 2,
              }}
            >
              {[...Array(Math.max(filteredCards.length || 3))].map(
                (_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    animation="wave"
                    sx={{
                      height: "14rem",
                      borderRadius: "0.8rem",
                    }}
                  />
                )
              )}
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
