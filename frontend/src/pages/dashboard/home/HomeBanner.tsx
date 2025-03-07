import { Box } from "@mui/material";
import homeBanner from "../../../assets/images/homeBanner.svg";
import { useNavigate } from "react-router-dom";

const HomeBanner = () => {
  const navigate = useNavigate();
  return (
    <Box
      className="rounded-[1rem] flex text-left sm:mb-10"
      style={{
        background: "linear-gradient(90deg, #9F87E5 0%, #6F58D9 100%)",
        height: "auto", // Remove fixed height for better mobile display
        minHeight: "180px", // Minimum height instead of fixed height
        overflow: "hidden", // Added to clip CardMedia
      }}
    >
      <Box className="flex flex-col justify-center items-start text-left px-16 py-12 mb-8 sm:mb-10">
        <h1
          className="text-white text-lg md:text-[26px] font-medium mb-2"
          style={{ letterSpacing: "0.01em", lineHeight: "1.2" }}
        >
          Those gaps in your materials? <br /> Let's fill 'em up!
        </h1>
        <p className="text-white text-sm md:text-[15px] mt-1 opacity-80">
          AI cross-referencing available in Duel-Learn Premium!
        </p>
        <button
          className="mt-4 px-6 py-2 text-sm md:text-base bg-white text-[#9F87E5] rounded-full font-bold hover:scale-105 transition-all ease-in-out duration-300"
          onClick={() => navigate("/dashboard/shop")}
        >
          Learn More
        </button>
      </Box>

      <Box flex={1} />
      <img src={homeBanner} alt="Home Banner" className="w-[24rem] h-auto" />
    </Box>
  );
};

export default HomeBanner;
