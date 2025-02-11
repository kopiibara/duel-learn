import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./contexts/UserContext";

import theme from "../../frontend/src/contexts/ThemeContext";
import "./index.css";

function App() {
  return (
    <UserProvider>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AppRoutes />
          </Router>
        </ThemeProvider>
      </HelmetProvider>
    </UserProvider>
  );
}

export default App;
