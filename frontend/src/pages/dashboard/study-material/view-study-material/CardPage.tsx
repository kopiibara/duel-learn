import { Box, Stack, Typography } from "@mui/material";

interface Item {
  term: string;
  definition: string;
}
interface StudyMaterial {
  title: string;
  tags: string[];
  images: string[];
  total_items: string;
  created_by: string;
  total_views: number;
  created_at: string;
  items: Item[];
}

interface CardPageProps {
  studyMaterial: StudyMaterial | null;
}

const CardPage = ({ studyMaterial }: CardPageProps) => {
  return (
    <Stack spacing={2}>
      {/* Check if study material is available and contains items */}
      {studyMaterial && studyMaterial.items.length > 0 ? (
        studyMaterial.items.map((item, index) => (
          <Box
            key={index}
            className="bg-[#E2DDF3] p-8 rounded-[0.8rem] shadow-lg"
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              className="text-[#120F1D] text-lg"
            >
              {item.term}
            </Typography>
            <Typography variant="body1" className="text-[#120F1D] text-base">
              {item.definition}
            </Typography>
          </Box>
        ))
      ) : (
        // Fallback when no items are present
        <Box
          className="bg-[#E2DDF3] p-8 rounded-[0.8rem] shadow-lg"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="body1" className="text-[#120F1D]">
            {studyMaterial ? "No items found." : "Loading..."}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

export default CardPage;
