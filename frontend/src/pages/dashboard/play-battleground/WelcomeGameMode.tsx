import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DefaultUnknownPic from "../../../assets/General/DefaultUnknownPic.png";

const WelcomeGameMode: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, material } = location.state || {};
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(
        () =>
          navigate("/dashboard/setup/questions", { state: { mode, material } }),
        1000
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, mode, material]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center h-screen text-center px-6 sm:px-8 md:px-12 lg:px-16"
      style={{ opacity: fadeOut ? 0 : 1, transition: "opacity 1s ease-in-out" }}
    >
      {mode && (
        <>
          <motion.img
            src={DefaultUnknownPic}
            alt="Game Mode"
            className="w-60 sm:w-60 md:w-68 lg:w-64 xl:w-[382px] mb-6 sm:mb-8 md:mb-10 lg:mb-12"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.p
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {mode} Mode Activated!
          </motion.p>
        </>
      )}
    </motion.div>
  );
};

export default WelcomeGameMode;
