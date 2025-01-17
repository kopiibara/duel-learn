import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DocumentHead from "../../components/DocumentHead";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleDashboard = () => {
    navigate("/dashboard/home"); // Navigate to the dashboard
  };

  const handleLogin = () => {
    navigate("/login"); // Navigate to the login page
  };

  return (
    <Box>
      <DocumentHead title="Duel Learn" />
      <Typography variant="h3">Landing Page</Typography>
      <Stack spacing={3}>
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
        <Button variant="contained" color="primary" onClick={handleDashboard}>
          Dashboard
        </Button>
      </Stack>
    </Box>
  );
};

export default LandingPage;
