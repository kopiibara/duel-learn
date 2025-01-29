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

interface SummaryPageProps {
  studyMaterial: StudyMaterial | null;
}

const SummaryPage = ({ studyMaterial }: SummaryPageProps) => {
  return (
    <Box className="h-full w-full p-8 rounded-[0.8rem] bg-[#E2DDF3]">
      <Stack spacing={2}>
        {studyMaterial ? (
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
            Loading...
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default SummaryPage;
