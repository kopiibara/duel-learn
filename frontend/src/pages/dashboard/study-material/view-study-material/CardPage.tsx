import { Box, Stack, Typography } from "@mui/material";

interface StudyMaterial {
  title: string;
  description: string;
  tags: string[];
  creator: string;
  "date-created": string;
  "no-people": number;
  items: {
    term: string;
    definition: string;
  }[];
}

interface CardPageProps {
  studyMaterial: StudyMaterial | null;
}

const CardPage = ({ studyMaterial }: CardPageProps) => {
  return (
    <Stack spacing={2}>
      {studyMaterial && studyMaterial.items ? (
        studyMaterial.items.map((item, index) => (
          <Box key={index} className="bg-[#E2DDF3] p-8 rounded-[0.8rem]">
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
          </Box>
        ))
      ) : (
        <Box className="bg-[#E2DDF3] p-8 rounded-[0.8rem]">
          <Typography variant="body1" className="text-[#120F1D]">
            {studyMaterial ? "No items found." : "Loading..."}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

export default CardPage;
