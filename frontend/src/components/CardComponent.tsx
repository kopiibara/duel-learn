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
            bottom: 30,
            left: 26,
            textAlign: "left",
          }}
        >
          <Stack spacing={0} className="flex items-baseline justify-end">
            <Stack direction="row" spacing={1} alignItems={"center"}>
              <Typography
                sx={{
                  color: "#000000",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                }}
              >
                {totalItems} Items
              </Typography>
              <Typography
                sx={{
                  color: "#000000",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                }}
              >
                &#x2022;
              </Typography>
              {clicked && (
                <Typography
                  sx={{
                    color: "#000000",
                    fontSize: "0.7rem",
                    fontWeight: "600",
                  }}
                >
                  {clicked} Views
                </Typography>
              )}
            </Stack>{" "}
            <Typography
              variant="h6"
              className="text-[#080511] pb-[0.2rem]"
              fontWeight="bold"
            >
              {title}
            </Typography>
            <Stack direction="row" spacing={1} className="w-auto mb-3">
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{
                    backgroundColor: "#4F4A64",
                    color: "#FFFFFF",
                    borderRadius: "0.3rem",
                    width: "fit-content",
                    height: "fit-content",
                    py: "0.3rem",
                    fontSize: "0.7rem",
                    fontWeight: "600",
                  }}
                />
              ))}
            </Stack>
            <Typography
              sx={{
                color: "#000000",
                fontSize: "0.7rem",
                fontWeight: "600",
                paddingLeft: "1px",
              }}
            >
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
