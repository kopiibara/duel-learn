import { useNavigate } from "react-router-dom";
import { Button, Box, Stack } from "@mui/material";

const Footer = () => {
  const navigate = useNavigate();

  const handleTermsCondition = () => {
    navigate("/terms-condition");
  };

  const handlePrivacyPolicy = () => {
    window.open("/privacy-policy", "_blank");
  };

  return (
    <footer className="mt-12 mb-5 flex justify-between text-gray-500 px-8 items-baseline">
      <Stack spacing={1} direction="row" className="flex items-center w-full">
        <Button
          variant="text"
          sx={{
            textTransform: "none",
            color: "#5A5076",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "color 0.3s ease",
            "&:hover": {
              color: "#E2DDF3", // Darker shade on hover
            },
          }}
          onClick={handlePrivacyPolicy}
        >
          Privacy
        </Button>
        <Button
          variant="text"
          sx={{
            textTransform: "none",
            color: "#5A5076",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "color 0.3s ease",
            "&:hover": {
              color: "#E2DDF3", // Darker shade on hover
            },
          }}
          onClick={handleTermsCondition}
        >
          Terms and Condition
        </Button>
        <Box flexGrow={1} />
        <p className=" text-[#5a5076] text-[1rem]">© 2024 Duel-Learn Inc.</p>
      </Stack>
    </footer>
  );
};

export default Footer;