import { Box } from "@mui/material";
import homeBanner from "../../../assets/images/homeBanner.png";
import { useNavigate } from "react-router-dom";

const HomeBanner = () => {
  const navigate = useNavigate();
  return (
    <Box
      className="rounded-[1rem] sm:mb-10 relative overflow-hidden z-[0]"
      style={{
        background: "linear-gradient(90deg, #9F87E5 0%, #6F58D9 100%)",
        height: "full",
        maxHeight: "320px",
        minHeight: "240px",
      }}
    >
      <Box className="absolute left-0 top-0 h-full flex flex-col justify-center items-start text-left px-16 z-[0]">
        <h1
          className="text-white text-xl md:text-[32px] font-medium mb-2"
          style={{ letterSpacing: "0.01em", lineHeight: "1.2" }}
        >
          Those gaps in your materials? <br /> Let's fill 'em up!
        </h1>
        <p className="text-white text-sm md:text-[15px] mt-1 mb-4 opacity-80">
          AI cross-referencing available in Duel-Learn Premium!
        </p>
        <button
          className="px-6 py-2 text-sm md:text-base bg-white text-[#9F87E5] rounded-full font-bold hover:scale-105 transition-all ease-in-out duration-300"
          onClick={() => navigate("/dashboard/shop")}
        >
          Learn More
        </button>
      </Box>

      <img src={homeBanner} alt="Home Banner" className="object-cover" />
    </Box>
  );
};

export default HomeBanner;
