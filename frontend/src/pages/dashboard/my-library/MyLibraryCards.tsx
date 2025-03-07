import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CardComponent from "../../../components/CardComponent";
import { StudyMaterial } from "../../../types/studyMaterialObject";

// Remove the showBookmarkIndicator prop since we don't need it anymore
interface MyLibraryCardsProps {
  cards: StudyMaterial[];
  createdBy: string;
}

const MyLibraryCards = ({ cards }: MyLibraryCardsProps) => {
  const navigate = useNavigate();

  // Filter cards to only include those where created_by matches the current user
  const filteredCards = cards;

  // Handle card click to navigate to the study material page
  const handleCardClick = (studyMaterialId: string, title: string) => {
    navigate(`/dashboard/study-material/view/${studyMaterialId}`, {
      state: { title },
    });
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
        gap: 2,
        width: "100%",
      }}
    >
      {filteredCards.map((item) => (
        <Box key={item.study_material_id} position="relative">
          {/* Removed the bookmark indicator */}
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
            status={item.status}
            visibility={item.visibility} // Pass visibility as a number
            items={item.items}
            onClick={() => handleCardClick(item.study_material_id, item.title)} // Pass title as state
          />
        </Box>
      ))}
    </Box>
  );
};

export default MyLibraryCards;
