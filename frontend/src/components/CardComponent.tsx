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
  totalViews: number;
  createdAt: string;
  visibility: number;
  items: Item[];
  onClick?: () => void; // Optional onClick prop to handle card clicks
}

const CardComponent: React.FC<CardComponentProps> = ({
  title,
  tags,
  images,
  totalItems,
  createdBy,
  totalViews,
  createdAt,
  visibility,
  items,
  onClick, // Destructured onClick handler
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const safeTags = Array.isArray(tags) ? tags : [];

  const ModeCard = styled(Card)(() => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    borderRadius: "1rem",
    height: "auto",
    minHeight: isMobile ? "10rem" : "14rem",
    width: "100%",
    cursor: "pointer",
    maxHeight: "100%",
    background: "#E2DDF3",
    position: "relative",
    transform: "scale(1)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.03)",
    },
  }));

  return (
    <ModeCard onClick={onClick}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          height: "100%",
          padding: { xs: "1rem", sm: "1.5rem" },
          "&:last-child": { paddingBottom: { xs: "1rem", sm: "1.5rem" } },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: { xs: "100%", sm: "70%" },
            zIndex: 1,
          }}
        >
          <Stack spacing={0.5}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ mb: 0.5 }}
            >
              <Typography
                sx={{
                  color: "#000000",
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  fontWeight: "600",
                }}
              >
                {totalItems} Items
              </Typography>
              <Typography
                sx={{
                  color: "#000000",
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  fontWeight: "600",
                }}
              >
                &#x2022;
              </Typography>
              <Typography
                sx={{
                  color: "#000000",
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  fontWeight: "600",
                }}
              >
                {totalViews} Views
              </Typography>
            </Stack>
            <Typography
              variant="h6"
              sx={{
                color: "#080511",
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.25rem" },
                pb: "0.2rem",
                wordBreak: "break-word",
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
              sx={{ mb: 1.5 }}
              flexWrap="wrap"
              gap={0.5}
            >
              {safeTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{
                    backgroundColor: "#4F4A64",
                    color: "#FFFFFF",
                    borderRadius: "0.3rem",
                    height: "auto",
                    py: "0.2rem",
                    px: "0.4rem",
                    fontSize: { xs: "0.6rem", sm: "0.7rem" },
                    fontWeight: "600",
                  }}
                />
              ))}
            </Stack>
            <Typography
              sx={{
                color: "#000000",
                fontSize: { xs: "0.65rem", sm: "0.7rem" },
                fontWeight: "600",
              }}
            >
              Made by <strong>{createdBy}</strong>
            </Typography>
          </Stack>
        </Box>
        <CardMedia
          component="img"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 0,
            width: { xs: "50%", sm: "45%", md: "40%" },
            height: "100%",
            objectFit: "cover",
          }}
          image="/cardBackground.svg"
        />
      </CardContent>
    </ModeCard>
  );
};

export default CardComponent;
