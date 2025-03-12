import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    // Scroll handler for header background
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Intersection Observer for sections
    const observerOptions = {
      threshold: [0.1, 0.2, 0.3], // Lower thresholds for earlier detection
      rootMargin: "-10% 0px -20% 0px", // Adjusted margins for better detection
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Observe all sections
    const sections = ["about", "how-it-works", "features", "premium"];
    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) {
        observer.observe(element);
      }
    });

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  const navButtonStyle = {
    textTransform: "none",
    fontSize: "1rem",
    transition: "color 0.3s ease",
    "&:hover": {
      color: "#4D18E8",
      backgroundColor: "transparent",
    },
    "&:active": {
      backgroundColor: "transparent",
    },
    "&.MuiButtonBase-root:hover": {
      backgroundColor: "transparent",
    },
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "#080511",
        transition: "all 0.3s ease",
        boxShadow: "none",
        py: isScrolled ? 2 : 4,
        borderBottom: "2px solid rgba(255, 255, 255, 0.03)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: { xs: "48px", md: "64px" },
          }}
        >
          {/* Logo Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <img
              src="/duel-learn-logo.svg"
              alt="Duel Learn"
              style={{ height: "32px", width: "auto" }}
            />
            <Typography
              variant="h6"
              sx={{
                ml: 2,
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "white",
                display: { xs: "none", sm: "block" },
              }}
            >
              Duel Learn
            </Typography>
          </Box>

          {/* Navigation Links - Hidden on mobile */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 4,
              alignItems: "center",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Button
              color="inherit"
              disableRipple
              sx={{
                ...navButtonStyle,
                color: activeSection === "about" ? "white" : "#6F658D",
              }}
              onClick={() => scrollToSection("about")}
            >
              About
            </Button>
            <Button
              color="inherit"
              disableRipple
              sx={{
                ...navButtonStyle,
                color: activeSection === "how-it-works" ? "white" : "#6F658D",
              }}
              onClick={() => scrollToSection("how-it-works")}
            >
              How it Works
            </Button>
            <Button
              color="inherit"
              disableRipple
              sx={{
                ...navButtonStyle,
                color: activeSection === "features" ? "white" : "#6F658D",
              }}
              onClick={() => scrollToSection("features")}
            >
              Features
            </Button>
            <Button
              color="inherit"
              disableRipple
              sx={{
                ...navButtonStyle,
                color: activeSection === "premium" ? "white" : "#6F658D",
              }}
              onClick={() => scrollToSection("premium")}
            >
              Premium
            </Button>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              sx={{
                color: "white",
                borderColor: "white",
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
                "&:hover": {
                  borderColor: "#4D18E8",
                  color: "#4D18E8",
                },
                display: { xs: "none", sm: "flex" },
              }}
              onClick={() => navigate("/login")}
            >
              LOG IN
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#4D18E8",
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
                "&:hover": {
                  backgroundColor: "#4315c7",
                },
              }}
              onClick={() => navigate("/sign-up")}
            >
              GET STARTED
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
