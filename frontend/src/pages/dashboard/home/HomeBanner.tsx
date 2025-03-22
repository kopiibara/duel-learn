import { Box, useMediaQuery, useTheme } from "@mui/material";
import homeBanner from "/images/homeBanner.svg";
import { useNavigate } from "react-router-dom";

const HomeBannerComponent = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      className="rounded-[0.8rem] relative overflow-hidden"
      sx={{
        background: "linear-gradient(90deg, #9F87E5 0%, #6F58D9 100%)",
        height: "auto", // Auto height based on content
        minHeight: isXsScreen ? "150px" : "240px", // Fixed min height in pixels
        maxHeight: isXsScreen ? "220px" : "300px", // Fixed max height in pixels
        width: "100%",
        marginBottom: isXsScreen ? "1rem" : "1.5rem", // Use rem for margin
        borderRadius: "0.8rem",
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
            width: "100%",
            height: "100%",
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
          padding: isXsScreen ? "1rem 1.25rem" : "1.5rem 2rem", // Responsive padding with rem
          textAlign: "left",
          zIndex: 2, // Ensure text is above the image and overlay
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: isXsScreen ? "1rem" : "1.25rem", // Fixed sizes with rem
            fontWeight: 500,
            marginBottom: "0.75rem", // Use rem for vertical margin
            letterSpacing: "0.01em",
            lineHeight: 1.2,
          }}
        >
          Those gaps in your materials? <br /> Let's fill 'em up!
        </h1>
        <p
          style={{
            color: "white",
            fontSize: isXsScreen ? "0.75rem" : "0.875rem", // Fixed sizes with rem
            marginTop: "0.5rem", // Use rem for vertical margin
            marginBottom: "1rem", // Use rem for vertical margin
            opacity: 0.8,
          }}
        >
          AI cross-referencing available in Duel-Learn Premium!
        </p>
        <button
          className="hover:scale-105 transition-all ease-in-out duration-300"
          onClick={() => navigate("/dashboard/shop")}
          style={{
            padding: isXsScreen ? "0.5rem 1rem" : "0.75rem 1.5rem", // Use rem for padding
            width: "fit-content",
            fontSize: isXsScreen ? "0.75rem" : "0.875rem", // Fixed sizes with rem
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
