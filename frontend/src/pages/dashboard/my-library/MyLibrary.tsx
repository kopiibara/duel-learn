import React, { useState, useEffect } from "react";
import { Box, Typography, Stack } from "@mui/material";
import DocumentHead from "../../../components/DocumentHead";
import MyLibraryCards from "./MyLibraryCards";
import Filter from "./Filter";

// Define your card data types as before
type CardData = {
  title: string;
  description: string;
  tags: string[];
  creator: string;
  clicked: number;
  mutual?: string;
  date?: string;
  filter?: string;
  createdBy: "you" | string;
};

const MyLibraryPage = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardData[]>([]);
  const [count, setCount] = useState<number>(0); // Count of cards created by "you"
  const [filter, setFilter] = useState<string | number>(""); // Filter state
  const [sort, setSort] = useState<string | number>(""); // Sort state

  useEffect(() => {
    fetch("/mock-data/StudyMaterialDetails.json")
      .then((response) => response.json())
      .then((data: CardData[]) => {
        setCards(data); // Store the full dataset
        setFilteredCards(data); // Initially, show all cards

        // Filter out the cards created by "you"
        const filtered = data.filter((item) => item.createdBy === "you");
        setFilteredCards(filtered);
        setCount(filtered.length); // Update count of "you" created cards
      })
      .catch((error) => console.error("Error fetching cards data:", error));
  }, []);

  const handleFilterChange = (newFilter: number | string) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort: number | string) => {
    setSort(newSort);
  };

  useEffect(() => {
    // Initial filtered data based on "you"
    let filteredData = cards.filter((card) => card.createdBy === "you");

    // Apply the filter logic (e.g., "All", "Public", "Private", etc.)
    if (filter && filter !== "all") {
      filteredData = filteredData.filter((card) => card.filter === filter);
    }

    // Apply sorting logic
    if (sort === "most recent") {
      filteredData = filteredData.sort((a, b) => {
        // Assuming `date` is in a format that can be directly compared (e.g., ISO 8601 string)
        return (
          new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
        );
      });
    } else if (sort === "least recent") {
      filteredData = filteredData.sort((a, b) => {
        return (
          new Date(a.date || "").getTime() - new Date(b.date || "").getTime()
        );
      });
    } else if (sort === "A-Z") {
      filteredData = filteredData.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    } else if (sort === "Z-A") {
      filteredData = filteredData.sort((a, b) =>
        b.title.localeCompare(a.title)
      );
    }

    // Update the filtered cards and count
    setFilteredCards(filteredData);
    setCount(filteredData.length);
  }, [filter, sort, cards]); // Re-run whenever filter, sort, or cards change

  return (
    <Box>
      <DocumentHead title="My Library" />
      <Stack spacing={2} className="px-8">
        <Stack direction={"row"} spacing={1} className="flex items-center">
          <Typography variant="h5" color="inherit">
            My Library
          </Typography>
          <Typography variant="h5" color="#6F658D">
            {" "}
            ({count})
          </Typography>{" "}
          {/* Display count of filtered cards */}
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

        {/* Pass filtered cards to MyLibraryCards */}
        <MyLibraryCards cards={filteredCards} />
      </Stack>
    </Box>
  );
};

export default MyLibraryPage;
