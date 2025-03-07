import { useState, useEffect } from "react";
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

  // Fetch study materials created by the user
  useEffect(() => {
    const fetchStudyMaterials = async () => {
      if (!created_by) return;
      setIsLoading(true);
      setPreviousCardCount(cards.length || 3);

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/study-material/get-by-user/${created_by}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch study materials");
        }
        const data = await response.json();
        setCards(data);
      } catch (error) {
        console.error("Error fetching study materials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyMaterials();
  }, [created_by]);

  // Fetch bookmarked study materials
  useEffect(() => {
    const fetchBookmarkedStudyMaterials = async () => {
      if (!firebase_uid) return;

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/study-material/get-bookmarks-by-user/${firebase_uid}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch bookmarked study materials");
        }

        const data = await response.json();

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

        setBookmarkedCards(formattedBookmarks);
      } catch (error) {
        console.error("Error fetching bookmarked study materials:", error);
      }
    };

    fetchBookmarkedStudyMaterials();
  }, [firebase_uid]);

  useEffect(() => {
    // Combine cards and bookmarked cards depending on the filter
    let allCards: StudyMaterial[] = [...cards];

    if (filter === "all" || filter === "bookmark") {
      // Avoid duplicates - if a card is both created by user and bookmarked
      const combinedCards = [...cards];

      if (filter === "bookmark") {
        // Only show bookmarked cards
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

    let filteredData = allCards;

    // Apply visibility filter
    if (filter === "public") {
      filteredData = filteredData.filter((card) => card.visibility === 1);
    } else if (filter === "private") {
      filteredData = filteredData.filter((card) => card.visibility === 0);
    } else if (filter === "archive") {
      filteredData = filteredData.filter((card) => card.status === "archived");
    }

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
              <MyLibraryCards cards={filteredCards} createdBy={created_by} />
            )
          )}
        </Stack>
      </Box>
    </PageTransition>
  );
};

export default MyLibraryPage;
