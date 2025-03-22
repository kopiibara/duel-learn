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
  AudioStopper,
} from "./components";
import theme from "./contexts/ThemeContext";
import "./index.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

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
                  <AppRoutes />
                  <GlobalSnackbar />
                  <SnackbarConnector />
                  <InvitationLobbySnackbar />
                  <Analytics />
                  <SpeedInsights />
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
