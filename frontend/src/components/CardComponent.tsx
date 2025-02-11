import {
  Box,
  Stack,
  Typography,
  Chip,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { styled } from "@mui/system";

interface CardComponentProps {
  title: string;
  totalItems: number;
  tags: string[];
  creator: string;
  clicked?: number;
  mutual?: string;
  date?: string;
  filter?: string;
  createdBy?: string;
  onClick?: () => void; // Optional onClick prop to handle card clicks
}

const CardComponent: React.FC<CardComponentProps> = ({
  title,
  totalItems,
  tags,
  creator,
  clicked,
  onClick, // Destructured onClick handler
}) => {
  const ModeCard = styled(Card)(() => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    borderRadius: "1rem",
    height: "14rem",
    cursor: "pointer",
    maxHeight: "100%",
    background: "#E2DDF3",
    position: "relative",
    transform: "scale(1)", // Initial transform state
    transition: "all 0.3s ease", // Ensure smooth transition between hover and unhover states
    "&:hover": {
      transform: "scale(1.03)", // Scales slightly on hover
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
        }}
      >
        <Box
          sx={{
            position: "absolute",
            bottom: 26,
            left: 26,
            textAlign: "left",
          }}
        >
          <Stack spacing={0}>
            <Stack direction="row" spacing={1} alignItems={"center"}>
              <Typography variant="body2" className="text-[#3B354D]">
                {totalItems} Items
              </Typography>
              <Typography variant="subtitle2" className="text-[#3B354D]">
                &#x2022;
              </Typography>
              {clicked && (
                <Typography variant="body2" className="text-[#3B354D]">
                  {clicked} Views
                </Typography>
              )}
            </Stack>

            <Typography
              variant="h6"
              className="text-[#080511]"
              fontWeight="bold"
            >
              {title}
            </Typography>
            <Stack direction="row" spacing={1} className="w-auto mb-2">
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{
                    backgroundColor: "#3B354D",
                    color: "#E2DDF3",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    width: "fit-content",
                  }}
                />
              ))}
            </Stack>
            <Typography variant="body2" className="text-[#3B354D]">
              Made by <strong>{creator}</strong>
            </Typography>
          </Stack>
        </Box>
        <CardMedia
          component="img"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: -1,
            width: "12rem",
            height: "100%",
          }}
          image="/cardBackground.svg"
        />
      </CardContent>
    </ModeCard>
  );
};

export default CardComponent;
