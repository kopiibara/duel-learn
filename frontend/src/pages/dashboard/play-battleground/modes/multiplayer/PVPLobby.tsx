import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { motion } from "framer-motion"; // Import motion from framer-motion
import "./../../styles/setupques.css";
import ManaIcon from "../../../../../assets/ManaIcon.png";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ContentCopy, CheckCircle } from "@mui/icons-material";

const PVPLobby: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, material, selectedTypes } = location.state || {};
  console.log(
    "Mode:",
    mode,
    "Material:",
    material,
    "Selected Types:",
    selectedTypes
  );

  const [manaPoints, setManaPoints] = useState(0); // Example starting mana points
  const [openManaAlert, setOpenManaAlert] = useState(false); // State for the mana points alert
  const [openDialog, setOpenDialog] = useState(false); // State to control the modal
  const [copySuccess, setCopySuccess] = useState(false); // To track if the text was copied

  const handleCopy = () => {
    navigator.clipboard
      .writeText("641283") // Text to be copied
      .then(() => {
        setCopySuccess(true); // Set success to true
        // Reset the icon back to ContentCopy after 5 seconds
        setTimeout(() => {
          setCopySuccess(false); // Reset state after 5 seconds
        }, 5000);
      })
      .catch(() => {
        setCopySuccess(false); // In case of error
      });
  };

  // Open the confirmation dialog
  const handleBackClick = () => {
    setOpenDialog(true); // Show the modal on back button click
  };

  // Confirm navigation
  const handleConfirmLeave = () => {
    setOpenDialog(false); // Close the modal
    navigate("/dashboard/home"); // Navigate to the home page
  };

  // Cancel navigation
  const handleCancelLeave = () => {
    setOpenDialog(false); // Close the modal if canceled
  };

  const handleBattleStart = () => {
    if (manaPoints < 10) {
      setOpenManaAlert(true);
    } else {
      setManaPoints((prev) => prev - 10); // Deduct mana points
      console.log("Battle Started!");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white px-6 py-8 overflow-hidden">
      {/* Full-Width Fixed Header */}
      <motion.div
        className="absolute top-0 left-0 w-full sm:px-8 md:px-16 lg:px-32 px-12 mt-5 py-12 flex justify-between items-center"
        initial={{ opacity: 0, y: -50 }} // Initial position off-screen
        animate={{ opacity: 1, y: 0 }} // Animate to visible and on-screen
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <IconButton
            className="text-gray-300"
            style={{
              border: "2px solid #6F658D",
              borderRadius: "50%",
              padding: "4px",
              color: "#6F658D",
            }}
            onClick={handleBackClick}
          >
            <ArrowBackIcon />
          </IconButton>

          <div>
            <h2 className="text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-semibold mb-1">
              {mode} Mode
            </h2>
            <p className="text-[12px] sm:text-[14px] text-gray-400">
              Chosen Study Material:{" "}
              <span className="font-bold text-white">{material?.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <img
            src={ManaIcon}
            alt="Mana"
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1"
          />
          <span className="text-[14px] sm:text-[16px] text-gray-300 mr-2 sm:mr-3">
            {manaPoints}
          </span>
          <span className="animate-spin text-[14px] sm:text-[16px] text-purple-400">
            ⚙️
          </span>
        </div>
      </motion.div>

      {/* Centered Content Wrapper */}
      <div className="flex-grow flex items-center justify-center w-full">
        <motion.div
          className="paper-container flex flex-col items-center justify-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-center p-6 sm:p-8 rounded-lg shadow-lg"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          {/* Players Section */}
          <div className="flex mt-24 w-full justify-between items-center">
            {/* Player 1 */}
            <motion.div
              className="flex flex-col ml-[-250px] mr-[210px] items-center"
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="w-16 h-16 sm:w-[185px] sm:h-[185px] mt-5 bg-white rounded-md"></div>
              <p className="text-sm sm:text-base font-semibold mt-5">JING009</p>
              <p className="text-xs sm:text-sm text-gray-400">LVL 6</p>
            </motion.div>

            {/* VS Text with Double Impact Animation */}
            <motion.span
              className="text-xl mt-14 sm:text-2xl md:text-[70px] font-bold text-[#4D18E8]"
              style={{ WebkitTextStroke: "1px #fff" }}
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: 1,
                scale: [1.5, 2, 1], // Scale up in two phases before returning to normal
              }}
              transition={{
                duration: 1, // The animation lasts for 1.2 seconds
                ease: "easeInOut",
              }}
            >
              VS
            </motion.span>

            {/* Player 2 */}
            <motion.div
              className="flex flex-col mr-[-250px] ml-[210px] items-center"
              initial={{ x: 1000 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="w-16 h-16 sm:w-[185px] sm:h-[185px] mt-5 bg-white rounded-md flex items-center justify-center"></div>
              <p className="text-sm sm:text-base font-semibold mt-5">
                SamisPRO
              </p>
              <p className="text-xs sm:text-sm text-gray-400">LVL 10</p>
            </motion.div>
          </div>

          {/* Lobby Code Section */}
          <motion.div
            className="flex flex-row mt-24 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm sm:text-base mr-6 text-white mb-1">
              LOBBY CODE
            </p>
            <div className="bg-white text-black text-sm sm:text-base font-bold px-2 ps-4 py-1 rounded-md flex items-center">
              641283
              <IconButton
                onClick={handleCopy}
                className="text-gray-500"
                style={{ fontSize: "16px" }}
              >
                {copySuccess ? (
                  <CheckCircle fontSize="small" style={{ color: "gray" }} />
                ) : (
                  <ContentCopy fontSize="small" />
                )}
              </IconButton>
            </div>
          </motion.div>

          {/* Battle Start Button */}
          <motion.button
            onClick={handleBattleStart}
            className="mt-6 sm:mt-11 w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] py-2 sm:py-3 bg-[#4D1EE3] text-white rounded-lg text-md sm:text-lg shadow-lg hover:bg-purple-800 transition flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 150 }}
          >
            BATTLE START! -10
            <img
              src={ManaIcon}
              alt="Mana"
              className="w-4 h-4 sm:w-3 sm:h-3 md:w-5 md:h-5 ml-2 filter invert brightness-0"
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <Dialog
        open={openDialog}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#080511", // Set dark background color for the modal itself
            paddingY: "30px", // Adds padding inside the modal
            paddingX: "20px", // Adds padding inside the modal
            paddingRight: "40px", // Adds padding inside the modal
            borderRadius: "10px", // Optional: Rounded corners
          },
          "& .MuiDialog-root": {
            backgroundColor: "transparent", // Ensures the root background is transparent (if needed)
          },
        }}
      >
        <DialogTitle
          id="confirmation-dialog-title"
          className="text-white py-4 px-6"
          sx={{
            backgroundColor: "#080511", // Ensures the title background is dark
          }}
        >
          Are you sure you want to leave?
        </DialogTitle>

        <DialogContent
          className="text-white py-6 px-6"
          sx={{ backgroundColor: "#080511" }}
        >
          <p>
            If you leave, your current progress will be lost. Please confirm if
            you wish to proceed.
          </p>
        </DialogContent>

        <DialogActions className="bg-[#080511]" sx={{ padding: "16px 0" }}>
          <Button
            onClick={handleCancelLeave}
            sx={{
              color: "#B0B0B0",
              py: 1,
              px: 4,
              "&:hover": {
                backgroundColor: "#080511",
                color: "#FFFFFF",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLeave}
            autoFocus
            sx={{
              backgroundColor: "#4D1EE3",
              color: "#FFFFFF",
              py: 1,
              px: 4,
              "&:hover": {
                backgroundColor: "#6A3EEA",
                color: "#fff",
              },
            }}
          >
            Yes, Leave
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PVPLobby;
