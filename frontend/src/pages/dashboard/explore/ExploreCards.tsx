import { Box, Grid } from "@mui/material";
import CardComponent from "../../../components/CardComponent";

type CardData = {
  title: string;
  totalItems: number;
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
    <Box className="px-3">
      <Grid container spacing={2}>
        {cards.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <CardComponent
              title={item.title}
              tags={item.tags}
              totalItems={item.totalItems}
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
