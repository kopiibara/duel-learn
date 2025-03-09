import { Box, Grid } from "@mui/material";
import CardComponent from "../../../components/CardComponent";
import { useNavigate } from "react-router-dom";
import { StudyMaterial } from "../../../types/studyMaterialObject";

type ExploreCardsProps = {
  cards: StudyMaterial[]; // Receive filtered cards as prop
};

const ExploreCards = ({ cards }: ExploreCardsProps) => {
  const navigate = useNavigate();

  const handleCardClick = async (studyMaterialId: string, title: string) => {
    try {
      await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/study-material/increment-views/${studyMaterialId}`,
        {
          method: "POST",
        }
      );

      navigate(`/dashboard/study-material/view/${studyMaterialId}`, {
        state: { title },
      });
    } catch (error) {
      console.error("Error updating total views:", error);
    }
  };

  return (
    <Box className="px-3">
      <Grid container spacing={2}>
        {cards.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <CardComponent
              title={item.title}
              tags={item.tags}
              images={item.images}
              totalItems={item.total_items}
              createdBy={item.created_by}
              createdById={item.created_by_id}
              totalViews={item.total_views}
              createdAt={item.updated_at}
              updatedAt={item.updated_at}
              visibility={item.visibility}
              status={item.status}
              items={item.items}
              onClick={() =>
                handleCardClick(item.study_material_id, item.title)
              }
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ExploreCards;
