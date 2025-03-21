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
import { useAudio } from "../contexts/AudioContext";

// Using a function to make the styled component responsive with theme access
const ModeCard = styled(Card)(({ theme }) => {
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return {
    padding: isXsScreen ? "1rem 0.75rem" : "1.5rem 0.75rem", // Responsive padding with rem
    borderRadius: "0.8rem",
    height: isXsScreen ? "180px" : "240px", // Fixed height values instead of vh
    minHeight: isXsScreen ? "120px" : "140px", // Min height with px
    maxHeight: isXsScreen ? "180px" : "240px", // Max height with px
    width: "100%",
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
  const { setActiveModeAudio } = useAudio();

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

    // Remove audio trigger from here - it should only play on the welcome page
    // setActiveModeAudio(mode);

    setModalOpen(true);
  };

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "0.75rem", // Use rem for gap
          mt: "1.5rem", // Use rem for margin top
          paddingX: "0.5rem", // Use rem for horizontal padding
          "@media (min-width: 768px)": {
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem", // Use rem for horizontal gap in desktop
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
                bottom: isXsScreen ? "1.5rem" : "1.25rem", // Use rem for positioning
                left: isXsScreen ? "1.5rem" : "1rem", // Use rem for positioning
                textAlign: "left",
                maxWidth: "80%",
              }}
            >
              <Typography
                fontWeight="700"
                className="text-[#266349]"
                sx={{
                  fontSize: isXsScreen ? "1.1rem" : "1.3rem", // Responsive font size with rem
                  marginBottom: "0.4rem", // Use rem for margin
                }}
              >
                Peaceful Mode
              </Typography>
              <Typography
                fontWeight="650"
                className="text-[#266349]"
                sx={{
                  fontSize: isXsScreen ? "0.75rem" : "0.85rem", // Responsive font size with rem
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
                bottom: isXsScreen ? "1.5rem" : "1.25rem", // Use rem for positioning
                left: isXsScreen ? "1.5rem" : "1rem", // Use rem for positioning
                textAlign: "left",
                maxWidth: "80%",
              }}
            >
              <Typography
                fontWeight="700"
                className="text-[#504c36]"
                sx={{
                  fontSize: isXsScreen ? "1.1rem" : "1.3rem", // Responsive font size with rem
                  marginBottom: "0.4rem", // Use rem for margin
                }}
              >
                Time Pressured
              </Typography>
              <Typography
                fontWeight="650"
                className="text-[#504c36]"
                sx={{
                  fontSize: isXsScreen ? "0.75rem" : "0.85rem", // Responsive font size with rem
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
                bottom: isXsScreen ? "1.5rem" : "1.25rem", // Use rem for positioning
                left: isXsScreen ? "1.5rem" : "1rem", // Use rem for positioning
                maxWidth: "80%",
              }}
            >
              <Typography
                fontWeight="700"
                className="text-[#303869]"
                sx={{
                  fontSize: isXsScreen ? "1.1rem" : "1.3rem", // Responsive font size with rem
                  marginBottom: "0.4rem", // Use rem for margin
                }}
              >
                PvP Mode
              </Typography>
              <Typography
                variant="body2"
                fontWeight="650"
                className="text-[#303869]"
                sx={{
                  fontSize: isXsScreen ? "0.75rem" : "0.85rem", // Responsive font size with rem
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
