import { Box, Stack, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DocumentHead from "../../../components/DocumentHead";
import PageTransition from "../../../styles/PageTransition";

import ChooseYourChallenge from "../../../components/ChooseYourChallenge";
import DiscoverMore from "./DiscoverMore";
import HomeBanner from "./HomeBanner";

const HomePage = ({
  setSelectedIndex,
}: {
  setSelectedIndex: (index: number) => void;
}) => {
  const navigate = useNavigate();

  const handleSeeMore = () => {
    setSelectedIndex(1); // Set "Explore" as the active sidebar item (index 1)
    navigate("/dashboard/explore");
  };

  return (
    <PageTransition>
      <Box className="h-full w-auto">
        <DocumentHead title="Home | Duel Learn" />
        <Stack spacing={2} className="px-4 sm:px-6">
          <HomeBanner />

          <Stack spacing={2} className="pb-6 pt-6">
            <Stack
              direction={"row"}
              spacing={1.5}
              className="flex items-center justify-start pl-2"
            >
              <img src="/book.png" className="w-8 h-6" alt="icon" />
              <Typography variant="h6">Choose your Challenge</Typography>
            </Stack>
            <ChooseYourChallenge />
          </Stack>

          <Stack spacing={0} className="w-full overflow-hidden">
            <Stack direction={"row"} spacing={2} className="flex items-center">
              <Stack
                direction={"row"}
                spacing={1.5}
                className="flex items-center justify-start pl-2"
              >
                <img src="/book.png" className="w-8 h-6" alt="icon" />
                <Typography
                  variant="h6"
                  className="text-base sm:text-lg md:text-xl"
                >
                  Discover more materials
                </Typography>
              </Stack>
              <Box flexGrow={1} />
              <Button
                variant="text"
                onClick={handleSeeMore}
                sx={{
                  color: "#3B354D",
                  fontSize: {
                    xs: "0.7rem",
                    sm: "0.8rem",
                  },
                  borderRadius: "0.5rem",
                  transition: "color 0.3s ease",
                  "&:hover": {
                    color: "#E2DDF3",
                    borderRadius: "0.5rem",
                  },
                }}
              >
                See More
              </Button>
            </Stack>
            <Box className="w-full overflow-hidden">
              <DiscoverMore />
            </Box>
          </Stack>

          {/* <Stack spacing={0}>
            <Stack
              direction={"row"}
              spacing={1.5}
              className="flex items-center justify-start pl-2"
            >
              <img src="/book.png" className="w-8 h-6" alt="icon" />
              <Typography variant="h6">Recently Opened</Typography>
            </Stack>
            <RecentlyOpened />
          </Stack> */}
        </Stack>
      </Box>
    </PageTransition>
  );
};

export default HomePage;
