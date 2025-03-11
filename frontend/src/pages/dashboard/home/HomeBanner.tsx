import { Box, useMediaQuery, useTheme } from "@mui/material";
import homeBanner from "../../../assets/images/homeBanner.svg";
import { useNavigate } from "react-router-dom";

// Fix the styled component implementation
const HomeBannerComponent = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      className="rounded-[1rem] relative overflow-hidden"
      sx={{
        background: "linear-gradient(90deg, #9F87E5 0%, #6F58D9 100%)",
        height: isXsScreen ? "20vh" : "25vh", // Use vh for height
        minHeight: isXsScreen ? "12rem" : "15rem", // Min height to prevent too small banners
        maxHeight: isXsScreen ? "18rem" : "20rem", // Max height to prevent too large banners
        width: isXsScreen ? "32.5vh" : "auto",

        marginBottom: isXsScreen ? "2vh" : "3vh", // Use vh for margin
        borderRadius: "1rem",
        position: "relative",
      }}
    >
      {/* Background Image (Full Container Coverage) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          },
        }}
      >
        <img
          src={homeBanner}
          alt="Home Banner"
          style={{
            width: isXsScreen ? "100%" : "100% ",
            height: isXsScreen ? "100%" : "100% ",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </Box>

      {/* Text Content */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: { xs: "100%", sm: "60%", md: "50%" },
          padding: isXsScreen ? "8vh 8vw" : "2vh 2vw", // Responsive padding
          textAlign: "left",
          zIndex: 2, // Ensure text is above the image and overlay
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: isXsScreen ? "1.5vh" : "1vw",
            fontWeight: 500,
            marginBottom: "1vh", // Use vh for vertical margin
            letterSpacing: "0.01em",
            lineHeight: 1.2,
          }}
        >
          Those gaps in your materials? <br /> Let's fill 'em up!
        </h1>
        <p
          style={{
            color: "white",
            fontSize: isXsScreen ? "1vh" : "0.8vw",
            marginTop: "0.5vh", // Use vh for vertical margin
            marginBottom: "2vh", // Use vh for vertical margin
            opacity: 0.8,
          }}
        >
          AI cross-referencing available in Duel-Learn Premium!
        </p>
        <button
          className="hover:scale-105 transition-all ease-in-out duration-300"
          onClick={() => navigate("/dashboard/shop")}
          style={{
            padding: `${isXsScreen ? "1vh" : "1.2vh"} ${
              isXsScreen ? "4vw" : "2vw"
            }`, // Use vh/vw for padding
            width: "fit-content",
            fontSize: isXsScreen ? "1vh" : "0.7vw",
            backgroundColor: "white",
            color: "#9F87E5",
            borderRadius: "2rem",
            fontWeight: 700,
          }}
        >
          Learn More
        </button>
      </Box>
    </Box>
  );
};

export default HomeBannerComponent;
