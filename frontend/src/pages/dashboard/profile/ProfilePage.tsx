import { Box, Typography } from "@mui/material";
import DocumentHead from "../../../components/DocumentHead";
import ProfileHeader from "./ProfileHeader";
import Statistics from "./Statistics";
import Achievements from "./Achievements";
import Leaderboards from "./Leaderboards";

const ProfilePage = () => {
  return (
    <Box className="">
      <DocumentHead title="Profile" />
      <Typography variant="h3">Profile Page</Typography>
      <ProfileHeader />
      <Statistics />
      <Achievements />
      <Leaderboards />
    </Box>
  );
};

export default ProfilePage;
