import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CardComponent from "../../../components/CardComponent";
import { StudyMaterial } from "../../../types/studyMaterialObject";

type MyLibraryCardsProps = {
  cards: StudyMaterial[];
  createdBy: string;
};

const MyLibraryCards = ({ cards, createdBy }: MyLibraryCardsProps) => {
  const navigate = useNavigate();

  // Filter cards to only include those where created_by matches the current user
  const filteredCards = cards.filter((item) => item.created_by === createdBy);

  // Handle card click to navigate to the study material page
  const handleCardClick = (studyMaterialId: string, title: string) => {
    navigate(`/dashboard/study-material/view/${studyMaterialId}`, {
      state: { title },
    });
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {filteredCards.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.study_material_id}>
            <CardComponent
              title={item.title}
              tags={item.tags}
              images={item.images}
              totalItems={item.total_items}
              createdBy={item.created_by}
              totalViews={item.total_views}
              createdAt={item.updated_at}
              visibility={item.visibility} // Pass visibility as a number
              items={item.items}
              onClick={() =>
                handleCardClick(item.study_material_id, item.title)
              } // Pass title as state
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyLibraryCards;
