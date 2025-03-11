import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Stack,
  Skeleton,
  Badge,
  CircularProgress,
} from "@mui/material";
import DocumentHead from "../../../components/DocumentHead";
import PageTransition from "../../../styles/PageTransition";
import MyLibraryCards from "./MyLibraryCards";
import Filter from "../../../components/Filter";
import { useUser } from "../../../contexts/UserContext";
import { StudyMaterial } from "../../../types/studyMaterialObject";
import noStudyMaterial from "../../../assets/images/NoStudyMaterial.svg";
import RefreshIcon from "@mui/icons-material/Refresh"; // Add this import

const MyLibraryPage = () => {
  const { user } = useUser();
  const created_by = user?.username;
  const firebase_uid = user?.firebase_uid;
  const [cards, setCards] = useState<StudyMaterial[]>([]);
  const [bookmarkedCards, setBookmarkedCards] = useState<StudyMaterial[]>([]);
  const [filteredCards, setFilteredCards] = useState<StudyMaterial[]>([]);
  const [count, setCount] = useState<number>(0);
  const [filter, setFilter] = useState<string | number>("all");
  const [sort, setSort] = useState<string | number>("most recent");
  const [isLoading, setIsLoading] = useState(true);
  const [previousCardCount, setPreviousCardCount] = useState(3);

  // Improved background refresh state
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Add refs to track when data was last fetched
  const lastUserMaterialsFetch = useRef<number>(0);
  const lastBookmarksFetch = useRef<number>(0);

  // Cache data
  const cachedUserMaterials = useRef<StudyMaterial[]>([]);
  const cachedBookmarks = useRef<StudyMaterial[]>([]);

  // Add these two state variables inside your component
  const [showUpdateLabel, setShowUpdateLabel] = useState(false);
  const updateLabelTimer = useRef<NodeJS.Timeout | null>(null);

  // Create optimized fetch functions with caching
  const fetchStudyMaterials = useCallback(
    async (force = false) => {
      if (!created_by) return;

      const now = Date.now();
      // Reduce cache invalidation time to better match backend's cache TTL (10 minutes)
      const needsRefresh =
        force || now - lastUserMaterialsFetch.current > 540000; // 9 minutes

      if (!needsRefresh && cachedUserMaterials.current.length > 0) {
        console.log("Using cached user materials");
        setCards(cachedUserMaterials.current);
        return;
      }

      const fetchingUserMaterials = async () => {
        try {
          // Use the timestamp parameter to signal the backend to skip its cache when forced
          const queryParam = force ? `?timestamp=${now}` : "";
          const response = await fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/study-material/get-by-user/${created_by}${queryParam}`,
            {
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch study materials: ${response.status}`
            );
          }

          const data = await response.json();
          console.log("Fetched study materials:", data.length);

          // Update cache with new data
          cachedUserMaterials.current = data;
          lastUserMaterialsFetch.current = now;

          // Update state
          setCards(data);
          setLastUpdated(new Date());
          showTemporaryUpdateLabel();
        } catch (error) {
          console.error("Error fetching study materials:", error);
        }
      };

      if (!isBackgroundRefreshing) {
        setIsLoading(true);
        await fetchingUserMaterials();
        setIsLoading(false);
      } else {
        await fetchingUserMaterials();
      }
    },
    [created_by, isBackgroundRefreshing]
  );

  const fetchBookmarkedStudyMaterials = useCallback(
    async (force = false) => {
      if (!firebase_uid) return;

      const now = Date.now();
      const needsRefresh = force || now - lastBookmarksFetch.current > 540000; // 9 minutes

      if (!needsRefresh && cachedBookmarks.current.length > 0) {
        console.log("Using cached bookmarks");
        setBookmarkedCards(cachedBookmarks.current);
        return;
      }

      const fetchingBookmarks = async () => {
        try {
          // Only use timestamp parameter when forcing refresh
          const queryParam = force ? `?timestamp=${now}` : "";
          const response = await fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/study-material/get-bookmarks-by-user/${firebase_uid}${queryParam}`,
            {
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch bookmarked study materials");
          }

          const data = await response.json();
          console.log("Fetched bookmarked materials:", data.length);

          // Transform the bookmarked study materials to match the StudyMaterial format
          interface BookmarkInfo {
            bookmarked_at: string;
          }

          interface BookmarkedStudyMaterialResponse {
            study_material_info: StudyMaterial;
            bookmark_info: BookmarkInfo;
          }

          const formattedBookmarks: StudyMaterial[] = data.map(
            (item: BookmarkedStudyMaterialResponse) => ({
              ...item.study_material_info,
              bookmarked: true,
              bookmarked_at: item.bookmark_info.bookmarked_at,
            })
          );

          // Update cache
          cachedBookmarks.current = formattedBookmarks;
          lastBookmarksFetch.current = now;

          // Update state
          setBookmarkedCards(formattedBookmarks);
          setLastUpdated(new Date());
          showTemporaryUpdateLabel();
        } catch (error) {
          console.error("Error fetching bookmarked study materials:", error);
        }
      };

      await fetchingBookmarks();
    },
    [firebase_uid]
  );

  // Background refresh function
  const backgroundRefresh = useCallback(() => {
    if (isBackgroundRefreshing) return;

    setIsBackgroundRefreshing(true);

    Promise.all([
      fetchStudyMaterials(true),
      fetchBookmarkedStudyMaterials(true),
    ]).finally(() => {
      setIsBackgroundRefreshing(false);
    });
  }, [
    fetchStudyMaterials,
    fetchBookmarkedStudyMaterials,
    isBackgroundRefreshing,
  ]);

  // Initial data fetch and set up auto-refresh
  useEffect(() => {
    if (!created_by || !firebase_uid) return;

    setIsLoading(true);
    setPreviousCardCount(cards.length || 3);

    // Fetch both types of data - don't force refresh on initial load
    // to take advantage of backend preloaded cache
    Promise.all([
      fetchStudyMaterials(false),
      fetchBookmarkedStudyMaterials(false),
    ]).finally(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    });

    // Set up background refresh interval - align with backend's cache TTL (10 minutes)
    const refreshInterval = setInterval(backgroundRefresh, 300000); // Every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [
    created_by,
    firebase_uid,
    fetchStudyMaterials,
    fetchBookmarkedStudyMaterials,
    backgroundRefresh,
  ]);

  // Handle manual refresh request from child components or refresh button
  const handleRefresh = useCallback(() => {
    console.log("Manual refresh requested");
    setIsLoading(true);

    Promise.all([
      fetchStudyMaterials(true),
      fetchBookmarkedStudyMaterials(true),
    ]).finally(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
      showTemporaryUpdateLabel();
    });
  }, [fetchStudyMaterials, fetchBookmarkedStudyMaterials]);

  // Format last updated time for display
  const formattedLastUpdated = useCallback(() => {
    if (!lastUpdated) return "";

    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hrs ago`;
  }, [lastUpdated]);

  // Create a function to handle update notifications
  const showTemporaryUpdateLabel = useCallback(() => {
    // Clear any existing timer
    if (updateLabelTimer.current) {
      clearTimeout(updateLabelTimer.current);
    }

    // Show the label
    setShowUpdateLabel(true);

    // Set timer to hide it after 5 seconds
    updateLabelTimer.current = setTimeout(() => {
      setShowUpdateLabel(false);
    }, 1000);
  }, []);

  // Make sure to clean up the timer in useEffect
  useEffect(() => {
    return () => {
      if (updateLabelTimer.current) {
        clearTimeout(updateLabelTimer.current);
      }
    };
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    // Combine cards and bookmarked cards depending on the filter
    let allCards: StudyMaterial[] = [...cards];

    console.log(
      "Applying filters - User cards:",
      cards.length,
      "Bookmarks:",
      bookmarkedCards.length
    );

    if (filter === "all" || filter === "bookmark") {
      // Avoid duplicates - if a card is both created by user and bookmarked
      const combinedCards = [...cards];

      if (filter === "bookmark") {
        console.log("Showing only bookmarked cards");
        allCards = bookmarkedCards;
      } else {
        // For "all", merge both with no duplicates
        bookmarkedCards.forEach((bookmarkedCard) => {
          if (
            !combinedCards.some(
              (card) =>
                card.study_material_id === bookmarkedCard.study_material_id
            )
          ) {
            combinedCards.push(bookmarkedCard);
          }
        });
        allCards = combinedCards.filter((card) => card.status !== "archived");
      }
    }

    console.log("Combined cards before filtering:", allCards.length);

    let filteredData = allCards;

    if (filter !== "archive") {
      filteredData = filteredData.filter((card) => card.status !== "archived");
    }

    // Apply visibility filter
    if (filter === "public") {
      filteredData = filteredData.filter((card) => card.visibility === 1);
    } else if (filter === "private") {
      filteredData = filteredData.filter((card) => card.visibility === 0);
    } else if (filter === "archive") {
      filteredData = filteredData.filter((card) => card.status === "archived");
    }

    console.log("Cards after filtering:", filteredData.length);

    // Sorting logic
    if (sort === "most recent") {
      filteredData.sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at).getTime() -
          new Date(a.updated_at || a.created_at).getTime()
      );
    } else if (sort === "least recent") {
      filteredData.sort(
        (a, b) =>
          new Date(a.updated_at || a.created_at).getTime() -
          new Date(b.updated_at || b.created_at).getTime()
      );
    } else if (sort === "A-Z") {
      filteredData.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "Z-A") {
      filteredData.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredCards(filteredData);
    setCount(filteredData.length);
  }, [filter, sort, cards, bookmarkedCards]);

  return (
    <PageTransition>
      <Box className="h-full w-full">
        <DocumentHead title="My Library | Duel Learn" />
        <Stack spacing={2} className="px-8">
          <Stack
            direction={"row"}
            spacing={1}
            className="flex items-center justify-center"
          >
            <Typography variant="h6" color="inherit">
              My Library
            </Typography>
            <Typography variant="subtitle2">•</Typography>
            <Typography variant="h6">{count}</Typography>
            <Box flexGrow={1} />

            {/* Add refresh button with indicator */}
            <Box className="flex items-center pr-2">
              <Typography
                variant="caption"
                sx={{
                  mr: 1,
                  color: "#6F658D",
                  opacity: isBackgroundRefreshing || showUpdateLabel ? 1 : 0,
                  transition: "opacity 0.5s ease-in-out",
                }}
              >
                {isBackgroundRefreshing
                  ? "Refreshing..."
                  : `Updated ${formattedLastUpdated()}`}
              </Typography>
              {isBackgroundRefreshing ? (
                <CircularProgress size={20} color="primary" sx={{ mr: 1 }} />
              ) : (
                <Badge
                  color="primary"
                  variant="dot"
                  invisible={
                    lastUserMaterialsFetch.current > Date.now() - 300000
                  }
                >
                  <RefreshIcon
                    onClick={handleRefresh}
                    sx={{
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      color: "#6F658D",
                    }}
                  />
                </Badge>
              )}
            </Box>

            <Stack direction={"row"} spacing={1}>
              <Filter
                menuItems={[
                  { value: "all", label: "All" },
                  { value: "public", label: "Public" },
                  { value: "private", label: "Private" },
                  { value: "bookmark", label: "Bookmark" },
                  { value: "archive", label: "Archive" },
                ]}
                value={filter}
                onChange={setFilter}
                hoverOpen={true}
              />
              <Filter
                menuItems={[
                  { value: "most recent", label: "Most Recent" },
                  { value: "least recent", label: "Least Recent" },
                  { value: "A-Z", label: "A-Z" },
                  { value: "Z-A", label: "Z-A" },
                ]}
                value={sort}
                onChange={setSort}
                hoverOpen={true}
              />
            </Stack>
          </Stack>

          {isLoading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                gap: 2,
                width: "100%",
              }}
            >
              {[...Array(previousCardCount)].map((_, index) => (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  animation="wave"
                  sx={{
                    height: "14rem",
                    borderRadius: "0.8rem",
                  }}
                />
              ))}
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
                style={{ width: "22rem", height: "auto", opacity: 0.75 }}
              />
              <p className="text-[#6F658D] font-bold text-[1rem] mt-4 pr-4 text-center">
                {filter === "bookmark"
                  ? "You don't have any bookmarked study materials yet"
                  : filter === "archive"
                  ? "You don't have any archived study materials yet"
                  : "You don't have any study materials yet"}
              </p>
            </Box>
          ) : (
            created_by && (
              <MyLibraryCards
                cards={filteredCards}
                createdBy={created_by}
                onRefreshNeeded={handleRefresh}
              />
            )
          )}
        </Stack>
      </Box>
    </PageTransition>
  );
};

export default MyLibraryPage;
