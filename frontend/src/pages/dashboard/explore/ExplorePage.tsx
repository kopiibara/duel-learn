import { Box, Stack, Button } from "@mui/material";
import { useState, useEffect } from "react";
import DocumentHead from "../../../components/DocumentHead";
import ExploreCards from "./ExploreCards";

type CardData = {
  title: string;
  description: string;
  tags: string[];
  creator: string;
  clicked: number;
  mutual?: string;
};

const ExplorePage = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardData[]>([]);

  // Fetch cards data on component mount
  useEffect(() => {
    fetch("/mock-data/StudyMaterialDetails.json")
      .then((response) => response.json())
      .then((data: CardData[]) => {
        setCards(data);
        setFilteredCards(data);
      })
      .catch((error) => console.error("Error fetching cards data:", error));
  }, []);

  const handleClick = (index: number) => {
    setSelected(index);
    console.info(`You clicked breadcrumb ${index + 1}`);

    // Apply filter based on the selected breadcrumb
    switch (index) {
      case 0: // "Recommended for you"
        setFilteredCards(cards); // Show all cards
        break;
      case 1: // "Top picks" - Show top 3 most clicked cards
        setFilteredCards(
          [...cards].sort((a, b) => b.clicked - a.clicked).slice(0, 3)
        ); // Top 3 most clicked
        break;
      case 2: // "Made by friends" - Show cards with mutual set to "true"
        setFilteredCards(cards.filter((card) => card.mutual === "true"));
        break;
      default:
        setFilteredCards(cards);
    }
  };

  const breadcrumbLabels = [
    "Recommended for you",
    "Top picks",
    "Made by friends",
  ];

  const breadcrumbs = breadcrumbLabels.map((label, index) => (
    <Button
      key={index}
      sx={{
        textTransform: "none",
        fontSize: "1.4rem",
        color: selected === index ? "#E2DDF3" : "#6F658D",
        "&:hover": {
          color: "inherit",
        },
      }}
      onClick={() => handleClick(index)} // Pass index to handle click
    >
      {label}
    </Button>
  ));

  return (
    <Box>
      <DocumentHead title="Explore" />
      <Stack>
        <Stack direction="row" spacing={1}>
          {breadcrumbs}
        </Stack>
        <ExploreCards cards={filteredCards} />
      </Stack>
    </Box>
  );
};

export default ExplorePage;
