import { Box, Stack, Button, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import DocumentHead from "../../../components/DocumentHead";
import PageTransition from "../../../styles/PageTransition";

import ExploreCards from "./ExploreCards";

type CardData = {
  title: string;
  totalItems: number;
  tags: string[];
  creator: string;
  clicked: number;
  mutual?: string;
};

const ExplorePage = () => {
  const [selected, setSelected] = useState<number>(0);
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
        color: selected === index ? "#E2DDF3" : "#3B354D",
        transition: "all 0.3s ease", // Smooth transition for visibility

        "&:hover": {
          color: "inherit",
        },
      }}
      onClick={() => handleClick(index)} // Pass index to handle click
    >
      <Typography variant="h5">{label}</Typography>
    </Button>
  ));

  return (
    <PageTransition>
      <Box className="h-screen w-full">
        <DocumentHead title="Explore | Duel Learn" />
        <Stack className="px-5" spacing={2}>
          <Stack direction="row" spacing={1} paddingX={0.5}>
            {breadcrumbs}
          </Stack>
          <ExploreCards cards={filteredCards} />
        </Stack>
      </Box>
    </PageTransition>
  );
};

export default ExplorePage;
