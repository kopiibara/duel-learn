import { Box, Stack, Typography, Paper } from "@mui/material";
import { StudyMaterial } from "../../../../types/studyMaterialObject";

interface SummaryPageProps {
  studyMaterial: StudyMaterial | null;
}

const SummaryPage = ({ studyMaterial }: SummaryPageProps) => {
  return (
    <Box className="h-full w-full px-4 py-4 rounded-[0.8rem] bg-[#E2DDF3]">
      <Stack spacing={2}>
        {studyMaterial ? (
          <Paper elevation={0} sx={{ bgcolor: "transparent", p: 2 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              className="text-[#120F1D] mb-4"
            >
              {studyMaterial.title}
            </Typography>
            <Typography variant="body1" className="text-[#120F1D] text-lg">
              {studyMaterial.summary ||
                "No summary available for this study material."}
            </Typography>
          </Paper>
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
