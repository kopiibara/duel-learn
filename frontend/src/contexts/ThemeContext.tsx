import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { PaletteMode } from "@mui/material";

function ThemeContext(mode: PaletteMode = "light") {
  console.log("Current mode:", mode); // Debugging mode

  let theme = createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            background: {
              default: "#F0F0F0",
            },
            text: {
              primary: "#0A0A0A",
              secondary: "#4A4A4A",
            },
          }
        : {
            background: {
              default: "#121212",
            },
            text: {
              primary: "#FFFEFE",
              secondary: "#B3B3B3",
            },
          }),
    },
    typography: {
      fontFamily: "Questrial",
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "background-color 0.3s ease, color 0.3s ease",
          },
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);

  return theme;
}

export default ThemeContext;
