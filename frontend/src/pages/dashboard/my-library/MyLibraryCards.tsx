import { Box, Grid } from "@mui/material";
import CardComponent from "../../../components/CardComponent";

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

type MyLibraryCardsProps = {
  cards: CardData[];
};

const MyLibraryCards = ({ cards }: MyLibraryCardsProps) => {
  // Filter cards to only include those where createdBy is "you"
  const filteredCards = cards.filter((item) => item.createdBy === "you");

  return (
    <Box>
      <Grid container spacing={2}>
        {filteredCards.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <CardComponent
              title={item.title}
              description={item.description}
              tags={item.tags}
              creator={item.creator}
              clicked={item.clicked}
              mutual={item.mutual}
              date={item.date}
              filter={item.filter}
              createdBy={"you"}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyLibraryCards;
