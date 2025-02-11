import { Box, Stack, Typography } from "@mui/material";

interface Item {
  term: string;
  definition: string;
}
interface StudyMaterial {
  title: string;
  tags: string[];
  images: string[];
  total_items: number;
  created_by: string;
  total_views: number;
  created_at: string;
  items: Item[];
}
interface SummaryPageProps {
  studyMaterial: StudyMaterial | null;
}

const SummaryPage = ({ studyMaterial }: SummaryPageProps) => {
  return (
    <Box className="h-full w-full px-8 py-4 rounded-[0.8rem] bg-[#E2DDF3]">
      <Stack spacing={2}>
        {studyMaterial ? (
          Array.isArray(studyMaterial.items) &&
          studyMaterial.items.length > 0 ? ( // Ensure items is an array and not empty
            studyMaterial.items.map((item, index) => (
              <Stack key={index}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  className="text-[#120F1D]"
                >
                  {item.term}
                </Typography>
                <Typography variant="body1" className="text-[#120F1D]">
                  {item.definition}
                </Typography>
              </Stack>
            ))
          ) : (
            <Typography variant="body1" className="text-[#120F1D]">
              No items available
            </Typography>
          )
        ) : (
          <Typography variant="body1" className="text-[#120F1D]">
            Loading...
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default SummaryPage;
