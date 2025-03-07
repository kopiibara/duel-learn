//import * as React from "react";
import { Box, Card, CardContent, Typography, CardMedia } from "@mui/material";
import { styled } from "@mui/system";

const ModeCard = styled(Card)({
  padding: "2rem",
  borderRadius: "1rem",
  height: "14rem",
  width: "auto",
  cursor: "pointer",
  background: "#E2DDF3",
  transform: "scale(1)",
  transition: "all 0.3s",
  "& .cardMedia": {
    transform: "scale(1)",
    transition: "transform 0.5s ease-in-out",
  },
  "&:hover": {
    transform: "scale(1.03)",
    "& .cardMedia": {
      transform: "scale(1.07)",
    },
  },
});

const ChooseYourChallenge = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 2,
        mt: 6,
        paddingX: 1,
        "@media (min-width: 768px)": {
          gridTemplateColumns: "repeat(3, 1fr)",
        },
      }}
    >
      {/* Peaceful Mode */}
      <ModeCard>
        <CardMedia
          component="svg"
          className="cardMedia"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: -1,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          image="/game-mode-selection/peaceful-mode.svg"
        />
        <CardContent>
          <Box
            sx={{
              position: "absolute",
              bottom: 28,
              left: 28,
              textAlign: "left",
              // Higher z-index to appear above the CardMedia
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              className="text-[#3C715B]"
            >
              Peaceful Mode
            </Typography>
            <Typography
              variant="body2"
              fontWeight="medium"
              className="text-[#3C715B]"
            >
              Study your way, no rush, just flow!
            </Typography>
          </Box>
        </CardContent>
      </ModeCard>

      {/* Time Pressured Mode */}
      <ModeCard>
        <CardMedia
          component="svg"
          className="cardMedia"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: -1,
            width: "100%",
            height: "100%",
          }}
          image="/game-mode-selection/time-pressured-mode.svg"
        />
        <CardContent>
          <Box
            sx={{
              position: "absolute",
              bottom: 28,
              left: 28,
              textAlign: "left",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              className="text-[#504D3A]"
            >
              Time Pressured
            </Typography>
            <Typography variant="body2" className="text-[#504D3A]">
              Beat the clock, challenge your speed!
            </Typography>
          </Box>
        </CardContent>
      </ModeCard>

      {/* PvP Mode */}
      <ModeCard>
        <CardMedia
          component="svg"
          className="cardMedia"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: -1,
            width: "100%",
            height: "100%",
          }}
          image="/game-mode-selection/pvp-mode.svg"
        />
        <CardContent>
          <Box
            sx={{
              position: "absolute",
              bottom: 28,
              left: 28,
              textAlign: "left",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              className="text-[#383D61]"
            >
              PvP Mode
            </Typography>
            <Typography variant="body2" className="text-[#383D61]">
              Outsmart your opponent and win!
            </Typography>
          </Box>
        </CardContent>
      </ModeCard>
    </Box>
  );
};

export default ChooseYourChallenge;
