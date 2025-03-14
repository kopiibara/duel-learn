import {
  Box,
  Stack,
  Typography,
  Chip,
  Card,
  CardContent,
  CardMedia,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import defaultCover from "../assets/study-material-cover/cardBackground.svg";

interface Item {
  term: string;
  definition: string;
  image?: string | null; // Update to string for Base64 images
}

interface CardComponentProps {
  title: string;
  tags: string[];
  images: string[];
  totalItems: number;
  createdBy: string;
  createdById: string;
  totalViews: number;
  createdAt: string;
  updatedAt: string;
  visibility: number;
  status: string;
  items: Item[];
  onClick?: () => void; // Optional onClick prop to handle card clicks
}

const CardComponent: React.FC<CardComponentProps> = ({
  title,
  tags,
  totalItems,
  createdBy,
  totalViews,
  onClick, // Destructured onClick handler
}) => {
  const safeTags = Array.isArray(tags) ? tags : []; // Ensure it's always an array
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const ModeCard = styled(Card)(() => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    borderRadius: isXsScreen ? "0.75rem" : "1rem",
    height: isXsScreen ? "20vh" : "11vw",
    width: isXsScreen ? "32.5vh" : "auto",
    cursor: "pointer",
    maxHeight: "100%",
    background: "#E2DDF3",
    position: "relative",
    transform: "scale(1)", // Initial transform state
    transition: "all 0.3s ease-in-out", // Ensure smooth transition between hover and unhover states
    "& .cardMedia": {
      transform: "scale(1)", // Initial scale
      transition: "transform 0.5s ease-in-out", // Always apply transition, not just on hover
    },
    "&:hover": {
      transform: "scale(1.03)", // Scales slightly on hover
      "& .cardMedia": {
        transform: "scale(1.05)", // Scale the image on hover
      },
    },
  }));

  return (
    <ModeCard onClick={onClick}>
      {" "}
      {/* Added onClick to the card */}
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: isXsScreen ? "12px" : "16px",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            bottom: isXsScreen ? 20 : 30,
            left: isXsScreen ? 20 : 30,
            textAlign: "left",
            maxWidth: "85%",
          }}
        >
          <Stack spacing={0} className="flex items-baseline justify-end">
            <Stack
              direction="row"
              spacing={isXsScreen ? 0.5 : 1}
              alignItems={"center"}
            >
              <Typography
                sx={{
                  color: "#080511",
                  fontSize: isXsScreen
                    ? "1.2vh"
                    : isSmScreen
                    ? "0.6vw"
                    : "0.6vw",
                  fontWeight: "650",
                }}
              >
                {totalItems} Items
              </Typography>
              <Typography
                sx={{
                  color: "#080511",
                  fontSize: isXsScreen
                    ? "1.2vh"
                    : isSmScreen
                    ? "0.6vw"
                    : "0.6vw",
                  fontWeight: "65",
                }}
              >
                &#x2022;
              </Typography>
              <Typography
                sx={{
                  color: "#080511",
                  fontSize: isXsScreen
                    ? "1.2vh"
                    : isSmScreen
                    ? "0.6vw"
                    : "0.6vw",
                  fontWeight: "650",
                }}
              >
                {totalViews} Views
              </Typography>
            </Stack>{" "}
            <Typography
              className="text-[#080511] pb-[0.2rem]"
              fontWeight="bold"
              sx={{
                fontSize: isXsScreen ? "2vh" : isSmScreen ? "1vw" : "1.1vw",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {title}
            </Typography>
            <Stack
              direction="row"
              spacing={0.5}
              className="w-auto mb-3"
              sx={{ flexWrap: "wrap" }}
              gap={0.5}
            >
              {safeTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{
                    backgroundColor: "#4D18E8 !important", // Force background color
                    color: "#E2DDF3 !important", // Force text color
                    borderRadius: "0.8rem",
                    width: "fit-content",
                    height: "fit-content",
                    py: isXsScreen ? "0.2rem" : "0.3rem",
                    px: "0.5rem",
                    fontSize: isXsScreen
                      ? "0.7rem"
                      : isSmScreen
                      ? "0.65rem"
                      : "0.7rem",
                    fontWeight: "600",
                    mb: 0.5,
                    display: "inline-flex",
                    alignItems: "center",
                    "& .MuiChip-label": {
                      padding: "0 4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "#E2DDF3 !important", // Force label text color
                    },
                  }}
                />
              ))}
            </Stack>
            <Typography
              sx={{
                color: "#000000",
                fontSize: isXsScreen
                  ? "1.2vh"
                  : isSmScreen
                  ? "0.65rem"
                  : "0.7rem",
                fontWeight: "600",
                paddingLeft: "1px",
              }}
            >
              Made by <strong>{createdBy}</strong>
            </Typography>
          </Stack>
        </Box>
        <CardMedia
          component="svg"
          className="cardMedia"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: -1,
            width: isXsScreen ? "9rem" : isSmScreen ? "10rem" : "12rem",
            height: "100%",
            objectFit: "cover",
          }}
          image={defaultCover}
        />
      </CardContent>
    </ModeCard>
  );
};

export default CardComponent;
