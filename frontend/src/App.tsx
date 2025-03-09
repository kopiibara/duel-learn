import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./contexts/UserContext";
import { AudioProvider } from "./contexts/AudioContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import GlobalSnackbar from "./components/GlobalSnackbar";
import SnackbarConnector from "./components/SnackbarConnector";
import theme from "../../frontend/src/contexts/ThemeContext";
import "./index.css";

function App() {
  return (
    <Router>
      <UserProvider>
        <AudioProvider>
          <SnackbarProvider>
            <HelmetProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <AppRoutes />
                <GlobalSnackbar />
                <SnackbarConnector />
              </ThemeProvider>
            </HelmetProvider>
          </SnackbarProvider>
        </AudioProvider>
      </UserProvider>
    </Router>
  );
}

export default App;