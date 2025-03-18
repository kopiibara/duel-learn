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
    <Stack spacing={1}>
      {/* Check if study material is available and contains items */}
      {studyMaterial &&
      studyMaterial.items &&
      studyMaterial.items.length > 0 ? (
        studyMaterial.items.map((item, index) => (
          <Box
            key={index}
            className="bg-[#E2DDF3] py-4 px-4 md:py-6 md:px-8 rounded-[0.8rem] shadow-lg"
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Stack spacing={1} flex={1}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  className="text-[#120F1D]"
                  sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" } }}
                >
                  {item.term}
                </Typography>
                <Typography
                  variant="body1"
                  className="text-[#120F1D]"
                  sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  {item.definition}
                </Typography>
              </Stack>
              {item.image && (
                <Box
                  sx={{
                    width: { xs: "100%", md: "12rem" },
                    height: { xs: "10rem", md: "12rem" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: { xs: 2, md: 0 },
                  }}
                >
                  <img
                    src={typeof item.image === "string" ? item.image : ""}
                    alt={item.term}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </Box>
              )}
            </Stack>
          </Box>
        ))
      ) : (
        // Fallback when no items are present or data is still loading
        <Box
          className="bg-[#E2DDF3] p-4 md:p-8 rounded-[0.8rem] shadow-lg"
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
