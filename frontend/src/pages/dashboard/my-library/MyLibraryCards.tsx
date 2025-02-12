import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CardComponent from "../../../components/CardComponent";

interface StudyMaterial {
  title: string;
  tags: string[];
  total_items: number;
  created_by: string;
  visibility: number;
  created_at: string;
  total_views: number;
  study_material_id: string;
}

type MyLibraryCardsProps = {
  cards: StudyMaterial[];
  createdBy: string;
};

const MyLibraryCards = ({ cards, createdBy }: MyLibraryCardsProps) => {
  const navigate = useNavigate();

  // Filter cards to only include those where created_by matches the current user
  const filteredCards = cards.filter((item) => item.created_by === createdBy);

  // Handle card click to navigate to the study material page
  const handleCardClick = (studyMaterialId: string) => {
    navigate(`/dashboard/study-material/preview/${studyMaterialId}`);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {filteredCards.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.study_material_id}>
            <CardComponent
              title={item.title}
              totalItems={item.total_items}
              tags={item.tags}
              creator={item.created_by}
              clicked={item.total_views}
              date={item.created_at}
              filter={item.visibility.toString()}
              createdBy={createdBy}
              onClick={() => handleCardClick(item.study_material_id)} // Add onClick handler
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyLibraryCards;
