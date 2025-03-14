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
      <Box className="h-full w-auto" sx={{ backgroundColor: '#080511' }}>
        <DocumentHead title="Home | Duel Learn" />
        <Stack spacing={1} className="px-6 sm:px-6">
          <HomeBanner />
          <Stack spacing={2} className="pb-6 pt-6">
            <Stack
              direction={"row"}
              spacing={1.5}
              className="flex items-center justify-start pl-2"
            >
              <img src="/book.png" className="w-8 h-6" alt="icon" />
              <Typography variant="h6" sx={{ color: '#E2DDF3' }}>Choose your Challenge</Typography>
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
                  sx={{ color: '#E2DDF3' }}
                >
                  Discover more materials
                </Typography>
              </Stack>
              <Box flexGrow={1} />
              <Button
                variant="text"
                onClick={handleSeeMore}
                sx={{
                  textTransform: "none",
                  borderRadius: "0.8rem",
                  padding: "0.5rem 1rem",
                  color: "#E2DDF3",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "#4D18E8",
                    transform: "scale(1.01)",
                    backgroundColor: "rgba(77, 24, 232, 0.08)",
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
