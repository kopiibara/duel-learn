import { HelmetProvider } from "react-helmet-async";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

// Create a theme instance with Nunito font
const theme = createTheme({
  typography: {
    fontFamily: "Nunito, sans-serif",
  },
  palette: {
    background: {
      default: "#080511",
    },
    text: {
      primary: "#E2DDF3",
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRoutes />
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
