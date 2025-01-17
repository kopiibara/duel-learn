import { Box, Grid } from "@mui/material";
import CardComponent from "../../../components/CardComponent";

type CardData = {
  title: string;
  description: string;
  tags: string[];
  creator: string;
  clicked: number;
  mutual?: string;
};

type ExploreCardsProps = {
  cards: CardData[]; // Receive filtered cards as prop
};

const ExploreCards = ({ cards }: ExploreCardsProps) => {
  return (
    <Box sx={{ padding: "1rem" }}>
      <Grid container spacing={2}>
        {cards.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <CardComponent
              title={item.title}
              description={item.description}
              tags={item.tags}
              creator={item.creator}
              clicked={item.clicked}
              mutual={item.mutual}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ExploreCards;
