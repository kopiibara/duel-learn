import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./contexts/UserContext";
import { AudioProvider } from "./contexts/AudioContext";
import theme from "../../frontend/src/contexts/ThemeContext";
import "./index.css";
import InvitationLobbySnackbar from './components/InvitationLobbySnackbar';

function App() {
  return (
    <Router>
      <UserProvider>
        <AudioProvider>
          <HelmetProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AppRoutes />
              <InvitationLobbySnackbar />
            </ThemeProvider>
          </HelmetProvider>
        </AudioProvider>
      </UserProvider>
    </Router>
  );
}

export default App;