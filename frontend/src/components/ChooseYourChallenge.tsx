import {
  Box,
  Card,
  CardContent,
  Typography,
  CardMedia,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import { useState } from "react";
import SelectStudyMaterialModal from "./modals/SelectStudyMaterialModal";
import { StudyMaterial } from "../types/studyMaterialObject";

// Using a function to make the styled component responsive with theme access
const ModeCard = styled(Card)(({ theme }) => {
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return {
    padding: isXsScreen ? "1.5vh 1vw" : "2vh 1vw", // Responsive padding
    borderRadius: "0.8rem",
    height: isXsScreen ? "18vh" : "24vh", // Responsive height with vh
    minHeight: isXsScreen ? "18vh" : "12vh", // Min height to prevent too small cards
    maxHeight: isXsScreen ? "18vh" : "24vh", // Max height to prevent too large cards
    width: isXsScreen ? "32.5vh" : "auto",
    marginBottom: "1vh", // Use vh for margin bottom
    cursor: "pointer",
    background: "#E2DDF3",
    position: "relative", // Add position relative
    transform: "scale(1)",
    transition: "all 0.3s",
    overflow: "hidden", // Prevent content overflow
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
  };
});

interface ChooseYourChallengeProps {
  onSelectMode?: (mode: string) => void;
  onSelectMaterial?: (material: StudyMaterial) => void;
}

// First, let's map game types to each mode
const modeToTypesMap = {
  "Peaceful Mode": ["matching", "flashcards", "quiz"],
  "Time Pressured Mode": ["matching", "flashcards", "quiz"],
  "PvP Mode": ["matching", "quiz"],
};

const ChooseYourChallenge: React.FC<ChooseYourChallengeProps> = ({
  onSelectMode,
  onSelectMaterial,
}) => {
  // State to control the material selection modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isLobby, setIsLobby] = useState(false); // Add this state
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Handler for material selection
  const handleMaterialSelect = (material: StudyMaterial) => {
    if (onSelectMaterial) {
      onSelectMaterial(material);
    }
    setModalOpen(false);
  };

  // Handler for mode selection
  const handleModeSelect = (mode: string) => {
    if (onSelectMode) {
      onSelectMode(mode);
    }
  };

  // New handler similar to ChooseModeModal
  const handleModeClick = (mode: string) => {
    setSelectedMode(mode);
    // Set types based on the mode selected
    setSelectedTypes(modeToTypesMap[mode as keyof typeof modeToTypesMap] || []);

    // Set isLobby flag based on the mode
    setIsLobby(mode === "PvP Mode");

    setModalOpen(true);
  };

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "vh", // Use vh for vertical gap
          mt: "3vh", // Use vh for margin top
          paddingX: "0.4vw", // Use vw for horizontal padding
          "@media (min-width: 768px)": {
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.8vw", // Use vw for horizontal gap in desktop
          },
        }}
      >
        {/* Peaceful Mode */}
        <ModeCard onClick={() => handleModeClick("Peaceful Mode")}>
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
          <CardContent sx={{ padding: 0, height: "100%" }}>
            <Box
              sx={{
                position: "absolute",
                bottom: isXsScreen ? "6vw" : "3vh", // Use vh for positioning
                left: isXsScreen ? "6vw" : "1.5vw", // Use vw for positioning
                textAlign: "left",
                maxWidth: "80%",
              }}
            >
              <Typography
                fontWeight="700"
                className="text-[#266349]"
                sx={{
                  fontSize: "clamp(1rem, 2.2vh, 1.5rem)", // Responsive font size
                  marginBottom: "0.5vh", // Use vh for margin
                }}
              >
                Peaceful Mode
              </Typography>
              <Typography
                fontWeight="650"
                className="text-[#266349]"
                sx={{
                  fontSize: "clamp(0.75rem, 0.8vw, 1rem)", // Responsive font size
                }}
              >
                Study your way, no rush, just flow!
              </Typography>
            </Box>
          </CardContent>
        </ModeCard>

        {/* Time Pressured Mode */}
        <ModeCard onClick={() => handleModeClick("Time Pressured Mode")}>
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
            image="/game-mode-selection/time-pressured-mode.svg"
          />
          <CardContent sx={{ padding: 0, height: "100%" }}>
            <Box
              sx={{
                position: "absolute",
                bottom: isXsScreen ? "6vw" : "3vh", // Use vh for positioning
                left: isXsScreen ? "6vw" : "1.5vw", // Use vw for positioning
                textAlign: "left",
                maxWidth: "80%",
              }}
            >
              <Typography
                fontWeight="700"
                className="text-[#504c36]"
                sx={{
                  fontSize: "clamp(1rem, 2.2vh, 1.5rem)", // Responsive font size
                  marginBottom: "0.5vh", // Use vh for margin
                }}
              >
                Time Pressured
              </Typography>
              <Typography
                fontWeight="650"
                className="text-[#504c36]"
                sx={{
                  fontSize: "clamp(0.75rem, 0.75vw, 1rem)", // Responsive font size
                }}
              >
                Beat the clock, challenge your speed!
              </Typography>
            </Box>
          </CardContent>
        </ModeCard>

        {/* PvP Mode */}
        <ModeCard onClick={() => handleModeClick("PvP Mode")}>
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
            image="/game-mode-selection/pvp-mode.svg"
          />
          <CardContent sx={{ padding: 0, height: "100%" }}>
            <Box
              sx={{
                position: "absolute",
                bottom: isXsScreen ? "6vw" : "3vh", // Use vh for positioning
                left: isXsScreen ? "6vw" : "1.5vw", // Use vw for positioning
                maxWidth: "80%",
              }}
            >
              <Typography
                fontWeight="700"
                className="text-[#303869]"
                sx={{
                  fontSize: "clamp(1rem, 2.2vh, 1.5rem)", // Responsive font size // Responsive font size
                  marginBottom: "0.5vh", // Use vh for margin
                }}
              >
                PvP Mode
              </Typography>
              <Typography
                variant="body2"
                fontWeight="650"
                className="text-[#303869]"
                sx={{
                  fontSize: "clamp(0.75rem, 0.8vw, 1rem)", // Responsive font size
                }}
              >
                Outsmart your opponent and win!
              </Typography>
            </Box>
          </CardContent>
        </ModeCard>
      </Box>

      {/* Material Selection Modal */}
      <SelectStudyMaterialModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)} // This closes the study material modal
        mode={selectedMode} // Pass the selected mode
        isLobby={isLobby} // Pass the isLobby flag
        onMaterialSelect={handleMaterialSelect} // Pass the selection handler
        onModeSelect={handleModeSelect} // Pass the mode selection handler
        selectedTypes={selectedTypes} // Pass selectedTypes to the modal
      />
    </>
  );
};

export default ChooseYourChallenge;
