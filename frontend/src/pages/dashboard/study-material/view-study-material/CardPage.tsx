import { Box, Stack, Typography } from "@mui/material";

interface Item {
  term: string;
  definition: string;
  image?: string | null;
}

interface StudyMaterial {
  title: string;
  tags: string[];
  images: string[];
  total_items: number;
  created_by: string;
  total_views: number;
  updated_at: string;
  items: Item[]; // Expecting an array of terms and definitions
}

interface CardPageProps {
  studyMaterial: StudyMaterial | null;
}

const CardPage = ({ studyMaterial }: CardPageProps) => {
  return (
    <Stack spacing={2}>
      {/* Check if study material is available and contains items */}
      {studyMaterial &&
      studyMaterial.items &&
      studyMaterial.items.length > 0 ? (
        studyMaterial.items.map((item, index) => (
          <Box
            key={index}
            className="bg-[#E2DDF3] py-4 px-8 rounded-[0.8rem] shadow-lg"
          >
            <Stack
              direction="row"
              spacing={4}
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack spacing={1} flex={1}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  className="text-[#120F1D] text-lg"
                >
                  {item.term}
                </Typography>
                <Typography
                  variant="body1"
                  className="text-[#120F1D] text-base"
                >
                  {item.definition}
                </Typography>
              </Stack>
              {item.image && (
                <Box className="w-48 h-48 flex-shrink-0">
                  <img
                    src={typeof item.image === "string" ? item.image : ""}
                    alt={item.term}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </Box>
              )}
            </Stack>
          </Box>
        ))
      ) : (
        // Fallback when no items are present or data is still loading
        <Box
          className="bg-[#E2DDF3] p-8 rounded-[0.8rem] shadow-lg"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="body1" className="text-[#120F1D]">
            {studyMaterial === null
              ? "Loading..." // Show Loading if studyMaterial is not available
              : "No items found."}{" "}
            {/* Show No items message if studyMaterial is empty */}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

export default CardPage;
