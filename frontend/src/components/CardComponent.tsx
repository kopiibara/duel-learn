import { Box, Stack, Typography, Chip, Card, CardContent } from "@mui/material";
import { styled } from "@mui/system";
import PropTypes from "prop-types";

interface CardComponentProps {
  title: string;
  description: string;
  tags: string[];
  creator: string;
  clicked?: number;
  mutual?: string;
  date?: string;
  filter?: string;
  createdBy?: string;
}

const CardComponent: React.FC<CardComponentProps> = ({
  title,
  description,
  tags,
  creator,
}) => {
  const ModeCard = styled(Card)(() => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    borderRadius: "1rem",
    height: "16rem",
    cursor: "pointer",
    maxHeight: "100%",
    background: "linear-gradient(to bottom, #ECE6FF, #DDD3FF)",
    position: "relative",
    transform: "scale(1)", // Initial transform state
    transition: "all 0.3s", // Ensure smooth transition between hover and unhover states
    "&:hover": {
      transform: "scale(1.03)", // Scales slightly on hover
    },
  }));

  return (
    <ModeCard>
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
            bottom: 28,
            left: 28,
            textAlign: "left",
          }}
        >
          <Stack spacing={1}>
            <Typography variant="body1" className="text-[#322168]">
              {description}
            </Typography>
            <Typography
              variant="h6"
              className="text-[#080511]"
              fontWeight="bold"
            >
              {title}
            </Typography>
            <Stack direction="row" spacing={1}>
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
            <Typography variant="body2" className="text-[#322168]">
              Made by <strong>{creator}</strong>
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </ModeCard>
  );
};

CardComponent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  creator: PropTypes.string.isRequired,
  clicked: PropTypes.number,
  mutual: PropTypes.string,
  date: PropTypes.string,
  filter: PropTypes.string,
  createdBy: PropTypes.string,
};

export default CardComponent;
