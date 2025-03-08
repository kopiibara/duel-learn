import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, Stack, Skeleton } from "@mui/material";
import DocumentHead from "../../../components/DocumentHead";
import PageTransition from "../../../styles/PageTransition";
import MyLibraryCards from "./MyLibraryCards";
import Filter from "../../../components/Filter";
import { useUser } from "../../../contexts/UserContext";
import { StudyMaterial } from "../../../types/studyMaterialObject";
import noStudyMaterial from "../../../assets/images/NoStudyMaterial.svg";

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

  // Add state to track background refreshes
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);

  // Add refs to track when data was last fetched
  const lastUserMaterialsFetch = useRef<number>(0);
  const lastBookmarksFetch = useRef<number>(0);

  // Cache data
  const cachedUserMaterials = useRef<StudyMaterial[]>([]);
  const cachedBookmarks = useRef<StudyMaterial[]>([]);

  // Create optimized fetch functions with caching
  const fetchStudyMaterials = useCallback(
    async (force = false) => {
      if (!created_by) return;

      const now = Date.now();
      const needsRefresh =
        force || now - lastUserMaterialsFetch.current > 120000; // 2 minutes

      if (!needsRefresh && cachedUserMaterials.current.length > 0) {
        console.log("Using cached user materials");
        setCards(cachedUserMaterials.current);
        return;
      }

      const fetchingUserMaterials = async () => {
        try {
          // Add timestamp to prevent browser caching
          const timestamp = now;
          const response = await fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/study-material/get-by-user/${created_by}?timestamp=${timestamp}`,
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
      const needsRefresh = force || now - lastBookmarksFetch.current > 120000; // 2 minutes

      if (!needsRefresh && cachedBookmarks.current.length > 0) {
        console.log("Using cached bookmarks");
        setBookmarkedCards(cachedBookmarks.current);
        return;
      }

      const fetchingBookmarks = async () => {
        try {
          const timestamp = now;
          const response = await fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/study-material/get-bookmarks-by-user/${firebase_uid}?timestamp=${timestamp}`,
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

    // Fetch both types of data
    Promise.all([
      fetchStudyMaterials(),
      fetchBookmarkedStudyMaterials(),
    ]).finally(() => {
      setIsLoading(false);
    });

    // Set up background refresh interval
    const refreshInterval = setInterval(backgroundRefresh, 60000); // Every minute

    return () => clearInterval(refreshInterval);
  }, [
    created_by,
    firebase_uid,
    fetchStudyMaterials,
    fetchBookmarkedStudyMaterials,
    backgroundRefresh,
    cards.length,
  ]);

  // Handle refresh request from child components
  const handleRefresh = useCallback(() => {
    console.log("Manual refresh requested");
    setIsLoading(true);

    Promise.all([
      fetchStudyMaterials(true),
      fetchBookmarkedStudyMaterials(true),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [fetchStudyMaterials, fetchBookmarkedStudyMaterials]);

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
              />
              <Filter
                menuItems={[
                  { value: "most recent", label: "Most Recent" },
                  { value: "least recent", label: "Least Recent" },
                  { value: "A-Z", label: "Alpabetical (A-Z)" },
                  { value: "Z-A", label: "Alpabetical (Z-A)" },
                ]}
                value={sort}
                onChange={setSort}
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
                style={{ width: "22rem", height: "auto" }}
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
