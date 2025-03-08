import {
  Box,
  Stack,
  IconButton,
  Typography,
  Skeleton,
  Button,
} from "@mui/material";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import DocumentHead from "../../../components/DocumentHead";
import PageTransition from "../../../styles/PageTransition";
import ExploreCards from "./ExploreCards";
import { useUser } from "../../../contexts/UserContext";
import AutoHideSnackbar from "../../../components/ErrorsSnackbar";
import { StudyMaterial } from "../../../types/studyMaterialObject";
import noStudyMaterial from "../../../assets/images/NoStudyMaterial.svg";
import RefreshIcon from "@mui/icons-material/Refresh";

const ExplorePage = () => {
  const { user } = useUser();
  const [selected, setSelected] = useState<number>(0);
  const [_cards, setCards] = useState<StudyMaterial[]>([]);
  const [filteredCards, setFilteredCards] = useState<StudyMaterial[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // Add state for background refreshes
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);

  // Track data for all tabs to avoid refetching when switching tabs
  const cachedTabData = useRef<{ [key: number]: StudyMaterial[] }>({});

  // Track when data was last loaded for each tab
  const tabDataTimestamps = useRef<{ [key: number]: number }>({});

  // Memoize socket instance
  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_BACKEND_URL, {
        transports: ["websocket", "polling"],
        autoConnect: false,
      }),
    []
  );

  // Function to check if data needs refresh
  const needsRefresh = (tabIndex: number): boolean => {
    const timestamp = tabDataTimestamps.current[tabIndex];
    if (!timestamp) return true;

    // Refresh if data is older than 2 minutes
    return Date.now() - timestamp > 120000;
  };

  // Function to fetch study materials based on selected category
  const fetchData = useCallback(
    async (tabIndex = selected, force = false) => {
      if (!user?.username) return;

      // If we have cached data for this tab and it's recent, use it unless forced refresh
      if (
        !force &&
        cachedTabData.current[tabIndex] &&
        !needsRefresh(tabIndex)
      ) {
        console.log(`Using cached data for tab ${tabIndex}`);
        if (tabIndex === selected) {
          setCards(cachedTabData.current[tabIndex]);
          setFilteredCards(cachedTabData.current[tabIndex]);
          setIsLoading(false);
        }
        return;
      }

      console.log(`Fetching data for tab: ${tabIndex}`);
      if (tabIndex === selected) setIsLoading(true);

      try {
        let url = "";
        switch (tabIndex) {
          case 0:
            url = `${
              import.meta.env.VITE_BACKEND_URL
            }/api/study-material/get-top-picks`;
            break;
          case 1:
            url = `${
              import.meta.env.VITE_BACKEND_URL
            }/api/study-material/get-recommended-for-you/${encodeURIComponent(
              user.username
            )}`;
            break;
          case 2:
            url = `${
              import.meta.env.VITE_BACKEND_URL
            }/api/study-material/get-made-by-friends/${encodeURIComponent(
              user.firebase_uid
            )}`;
            break;
          default:
            return;
        }

        // Set a reasonable timeout to avoid hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok)
          throw new Error(`Failed to fetch: ${response.status}`);

        const data: StudyMaterial[] = await response.json();
        if (Array.isArray(data)) {
          // Cache the data for this tab
          cachedTabData.current[tabIndex] = data;
          tabDataTimestamps.current[tabIndex] = Date.now();

          // Only update state if this is the currently selected tab
          if (tabIndex === selected) {
            setCards(data);
            setFilteredCards(data);
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          console.log("Request was aborted due to timeout");
          if (tabIndex === selected) {
            setSnackbarMessage("Taking too long to load. Try again later.");
            setSnackbarOpen(true);
          }
        } else {
          console.error(`Error fetching data for tab ${tabIndex}:`, error);
        }
      } finally {
        if (tabIndex === selected) setIsLoading(false);
      }
    },
    [selected, user?.username, user?.firebase_uid]
  );

  // Background refresh function - doesn't show loading state
  const backgroundRefresh = useCallback(async () => {
    if (!user?.username || isBackgroundRefreshing) return;

    setIsBackgroundRefreshing(true);
    console.log("Starting background refresh of all tabs");

    try {
      // Refresh data for all tabs in the background
      await Promise.all([0, 1, 2].map((tabIndex) => fetchData(tabIndex, true)));
    } catch (error) {
      console.error("Error during background refresh:", error);
    } finally {
      setIsBackgroundRefreshing(false);
    }
  }, [fetchData, user?.username, isBackgroundRefreshing]);

  // Manual refresh function with visual feedback
  const refreshData = useCallback(async () => {
    if (!user?.username) return;
    setIsLoading(true);

    try {
      await fetchData(selected, true);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, selected, user?.username]);

  // Initial load and refresh intervals
  useEffect(() => {
    // Pre-fetch data for all tabs on initial load
    if (user?.username) {
      // Start with current tab
      fetchData(selected);

      // Then fetch other tabs in background with slight delays to avoid overwhelming server
      const timeouts = [
        setTimeout(() => fetchData(0 === selected ? 1 : 0), 1000),
        setTimeout(() => fetchData(2 === selected ? 1 : 2), 2000),
      ];

      // Set up background refresh interval
      const refreshInterval = setInterval(backgroundRefresh, 60000); // Every minute

      return () => {
        timeouts.forEach(clearTimeout);
        clearInterval(refreshInterval);
      };
    }
  }, [user?.username, fetchData, selected, backgroundRefresh]);

  // Handle tab changes
  useEffect(() => {
    console.log(`Tab selected: ${selected}`);

    // If we have cached data for this tab, use it immediately
    if (cachedTabData.current[selected]) {
      setCards(cachedTabData.current[selected]);
      setFilteredCards(cachedTabData.current[selected]);

      // If data is stale, refresh in background
      if (needsRefresh(selected)) {
        fetchData(selected, true);
      }
    } else {
      fetchData(selected);
    }
  }, [selected, fetchData]);

  // Socket connection for real-time updates
  useEffect(() => {
    if (!user?.firebase_uid) return;

    socket.connect();
    socket.emit("setup", user.firebase_uid);

    const handleNewMaterial = () => {
      // Refresh data in background when new material is received
      backgroundRefresh();
    };

    socket.on("broadcastStudyMaterial", handleNewMaterial);

    return () => {
      socket.off("broadcastStudyMaterial", handleNewMaterial);
      socket.disconnect();
    };
  }, [socket, user?.firebase_uid, backgroundRefresh]);

  return (
    <PageTransition>
      <Box className="h-full w-auto">
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
                  onClick={() => setSelected(index)}
                >
                  <Typography variant="h6">{label}</Typography>
                </Button>
              )
            )}
            <Box flex={1} />
            <button
              onClick={refreshData}
              className=" scale-100 text-[#3B354D] hover:scale-110 hover:text-[#E2DDF3] transition-all duration-300 "
            >
              <RefreshIcon />
            </button>
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
