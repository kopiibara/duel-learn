import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AudioProvider } from "./contexts/AudioContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { 
  GlobalSnackbar, 
  SnackbarConnector, 
  AuthTokenSynchronizer,
  InvitationLobbySnackbar,
  AudioStopper 
} from "./components";
import theme from "../../frontend/src/contexts/ThemeContext";
import "./index.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthTokenSynchronizer />
        <UserProvider>
          <AudioProvider>
            <AudioStopper
              stopOnRoutes={[
                "/dashboard/home",
                "/dashboard/session-complete",
                "/dashboard/profile",
                "/dashboard/deck-gallery",
                "/dashboard/decks",
              ]}
            />
            <SnackbarProvider>
              <HelmetProvider>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <InvitationLobbySnackbar />
                  <AppRoutes />
                  <GlobalSnackbar />
                  <SnackbarConnector />
                </ThemeProvider>
              </HelmetProvider>
            </SnackbarProvider>
          </AudioProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
