import { Box, Stack, Typography, Button } from "@mui/material";
import DocumentHead from "../../../components/DocumentHead";
import ChooseYourChallenge from "../../../components/ChooseYourChallenge";
import DiscoverMore from "./DiscoverMore";
import RecentlyOpened from "./RecentlyOpened";

const HomePage = () => {
  return (
    <Box>
      <DocumentHead title="Home" />
      <Stack spacing={2} className="px-6">
        {/* Choose Your Challenge */}
        <Stack spacing={2} className="pb-6">
          <Stack
            direction={"row"}
            spacing={2}
            className="flex items-center justify-start"
          >
            <img src="/book.svg" className="w-10 h-10" alt="icon" />
            <Typography variant="h5">Choose your Challenge</Typography>
          </Stack>
          <ChooseYourChallenge />
        </Stack>

        {/* Recently Opened */}
        <Stack spacing={0}>
          <Typography variant="h5">Recently Opened</Typography>
          <RecentlyOpened />
        </Stack>

        {/* Discover More */}
        <Stack spacing={0}>
          <Stack direction={"row"} spacing={2} className="flex items-center">
            <Typography variant="h5">Discover more materials</Typography>
            <Box flexGrow={1} />
            <Button
              variant="text"
              sx={{ color: "#3B354D", fontSize: "0.8rem" }}
            >
              See More
            </Button>
          </Stack>

          <DiscoverMore />
        </Stack>
      </Stack>
    </Box>
  );
};

export default HomePage;
