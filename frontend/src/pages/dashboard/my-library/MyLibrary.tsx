import { useState, useEffect } from "react";
import { Box, Typography, Stack } from "@mui/material";
import DocumentHead from "../../../components/DocumentHead";
import MyLibraryCards from "./MyLibraryCards";
import Filter from "./Filter";
import { useUser } from "../../../contexts/UserContext";

// Define your card data types as before
interface StudyMaterial {
  title: string;
  tags: string[];
  total_items: number;
  created_by: string;
  visibility: number; // 0 = private, 1 = public
  created_at: string;
  total_views: number;
  study_material_id: string;
}

const MyLibraryPage = () => {
  const { user } = useUser();
  const created_by = user?.displayName; // Placeholder for the current user
  const [cards, setCards] = useState<StudyMaterial[]>([]);
  const [filteredCards, setFilteredCards] = useState<StudyMaterial[]>([]);
  const [count, setCount] = useState<number>(0);
  const [filter, setFilter] = useState<string | number>("all");
  const [sort, setSort] = useState<string | number>("most recent");

  useEffect(() => {
    if (!created_by) return;

    fetch(
      `http://localhost:5000/api/studyMaterial/view-your-study-material/${created_by}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data);

        if (
          data.message === "Study materials fetched successfully" &&
          Array.isArray(data.data)
        ) {
          const parsedData = data.data.map((item: any) => ({
            ...item,
            // Handle the 'tags' field correctly
            tags:
              typeof item.tags === "string" ? item.tags.split(",") : item.tags,
          }));

          setCards(parsedData);
        } else {
          console.error("Unexpected API response format:", data);
        }
      })

      .catch((error) => console.error("Error fetching study material:", error));
  }, [created_by]);

  const handleFilterChange = (newFilter: string | number) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort: string | number) => {
    setSort(newSort);
  };

  useEffect(() => {
    let filteredData = cards.filter((card) => card.created_by === created_by);

    // Apply visibility filter
    if (filter !== "all") {
      if (filter === "public") {
        filteredData = filteredData.filter((card) => card.visibility === 1);
      } else if (filter === "private") {
        filteredData = filteredData.filter((card) => card.visibility === 0);
      }
    }

    // Sorting logic
    if (sort === "most recent") {
      filteredData.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === "least recent") {
      filteredData.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sort === "A-Z") {
      filteredData.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "Z-A") {
      filteredData.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredCards(filteredData);
    setCount(filteredData.length);
  }, [filter, sort, cards]);

  return (
    <Box>
      <DocumentHead title="My Library" />
      <Stack spacing={2} className="px-8">
        <Stack
          direction={"row"}
          spacing={1}
          className="flex items-center justify-center"
        >
          <Typography variant="h5" color="inherit">
            My Library
          </Typography>
          <Typography variant="h5" color="#6F658D">
            ({count})
          </Typography>
          <Box flexGrow={1} />
          <Stack direction={"row"} spacing={2}>
            <Filter
              menuItems={[
                { value: "all", label: "All" },
                { value: "public", label: "Public" },
                { value: "private", label: "Private" },
                { value: "bookmark", label: "Bookmark" },
                { value: "archive", label: "Archive" },
              ]}
              value={filter}
              onChange={handleFilterChange}
            />
            <Filter
              menuItems={[
                { value: "most recent", label: "Most Recent" },
                { value: "least recent", label: "Least Recent" },
                { value: "A-Z", label: "A-Z" },
                { value: "Z-A", label: "Z-A" },
              ]}
              value={sort}
              onChange={handleSortChange}
            />
          </Stack>
        </Stack>
        {created_by && (
          <MyLibraryCards cards={filteredCards} createdBy={created_by} />
        )}
      </Stack>
    </Box>
  );
};

export default MyLibraryPage;
