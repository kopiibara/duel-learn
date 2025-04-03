import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Snackbar } from "@mui/material"; // Import Snackbar and Alert from MUI
import "./../../styles/setupques.css";
import ManaIcon from "../../../../../assets/ManaIcon.png";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PageTransition from "../../../../../styles/PageTransition";
import { generateCode } from "../../utils/codeGenerator";
import axios from "axios";
import { usePvPLobby } from "../../../../../hooks/usePvPLobby";

const SetUpQuestionType: React.FC = () => {
  // Move all hooks to the top before any conditional logic
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, material, fromWelcome, lobbyCode, isPvpLobbyCreation, role } = location.state || {};
  const [isComponentReady, setIsComponentReady] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [questionTypes] = useState([
    {
      display: "Identification",
      value: "identification",
    },
    {
      display: "Multiple Choice",
      value: "multiple-choice",
    },
    {
      display: "True or False",
      value: "true-false",
    },
  ]);
  const [openAlert, setOpenAlert] = useState(false); // State to control alert visibility
  const [manaPoints, _setManaPoints] = useState(10); // State for dynamic mana points
  const [openManaAlert, setOpenManaAlert] = useState(false); // State for the mana alert
  const [isGenerating, setIsGenerating] = useState(false);
  const { createLobby, loading: lobbyLoading } = usePvPLobby();

  // Signal when component is fully ready
  useEffect(() => {
    const prepareComponent = async () => {
      try {
        // Add any necessary initialization here
        setIsComponentReady(true);
      } catch (error) {
        console.error("Error preparing component:", error);
      }
    };

    prepareComponent();
  }, []);

  // Redirect if not coming from welcome
  useEffect(() => {
    if (!fromWelcome) {
      navigate("/dashboard/welcome", {
        state: { mode, material },
        replace: true,
      });
    }
  }, [fromWelcome, navigate, mode, material]);

  // Show nothing until everything is ready
  if (!isComponentReady || !fromWelcome) {
    return null;
  }

  console.log(
    "Mode:",
    mode,
    "Material:",
    material,
    "Selected Types:",
    selectedTypes
  );

  const toggleSelection = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const backToHome = () => {
    navigate("/dashboard/home");
  };

  const handleStartLearning = async () => {
    // If no question type is selected, show the alert
    if (selectedTypes.length === 0) {
      setOpenAlert(true);
      return;
    }

    // If manaPoints are below 10 and mode is not "Time Pressured", show the mana alert
    if (mode !== "Time Pressured" && manaPoints < 10) {
      setOpenManaAlert(true);
      return;
    }

    // Set loading state
    setIsGenerating(true);

    // Pass role information in navigation state
    const navigationState = {
      mode,
      material,
      selectedTypes,
      lobbyCode,
      role: role || 'host' // Default to host if not specified
    };

    // Check if this is for PvP lobby creation
    if (isPvpLobbyCreation && !lobbyCode) {
      try {
        // Create a lobby with initial settings
        const result = await createLobby({
          questionTypes: selectedTypes,
          studyMaterialId: material?.id,
          studyMaterialTitle: material?.title
        });
        
        if (result.success) {
          // Navigate to the PVP lobby with the generated lobby code
          navigate(`/dashboard/pvp-lobby/${result.lobbyCode}`, {
            state: { 
              ...navigationState,
              lobbyCode: result.lobbyCode,
              fromWelcome: true
            }
          });
        } else {
          // Handle error
          console.error("Failed to create lobby:", result.error);
          setIsGenerating(false);
        }
        return;
      } catch (error) {
        console.error("Error creating lobby:", error);
        setIsGenerating(false);
        return;
      }
    } else if (isPvpLobbyCreation && lobbyCode) {
      // Navigate directly to the PVP lobby with the selected question types
      navigate(`/dashboard/pvps-lobby/${lobbyCode}`, {
        state: { 
          ...navigationState,
          fromWelcome: true
        }
      });
      return;
    }


    // Navigate based on mode with more flexible mode checks
    if (mode === "Time Pressured" || mode === "Time Pressured Mode") {
      console.log("Navigating to timer setup");
      navigate("/dashboard/setup/timer", { state: navigationState });
    } else if (mode === "Peaceful" || mode === "Peaceful Mode") {
      console.log("Navigating to peaceful mode");
      // Navigate directly to peaceful mode instead of loading screen
      navigate("/dashboard/study/peaceful-mode", {
        state: { ...navigationState, timeLimit: null },
      });
    } else {
      // This is for PvP mode without explicit isPvpLobbyCreation flag
      console.log("Navigating to PVP mode via API");
      try {
        // Use the API to create a lobby instead of just generating a code
        const result = await createLobby({
          questionTypes: selectedTypes,
          studyMaterialId: material?.id,
          studyMaterialTitle: material?.title
        });
        
        if (result.success) {
          // Navigate with the API-generated lobby code
          navigate(`/dashboard/pvp-lobby/${result.lobbyCode}`, {
            state: { 
              ...navigationState, 
              lobbyCode: result.lobbyCode,
              fromWelcome: true
            }
          });
        } else {
          // Handle error - fall back to local code generation
          console.error("Failed to create lobby via API, using local fallback:", result.error);
          const generatedLobbyCode = generateCode();
          navigate(`/dashboard/pvp-lobby/${generatedLobbyCode}`, {
            state: { ...navigationState, lobbyCode: generatedLobbyCode },
          });
        }
      } catch (error) {
        // If the API fails, fall back to local code generation
        console.error("Error creating lobby via API, using local fallback:", error);
        const generatedLobbyCode = generateCode();
        navigate(`/dashboard/pvp-lobby/${generatedLobbyCode}`, {
          state: { ...navigationState, lobbyCode: generatedLobbyCode },
        });
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleCloseAlert = () => {
    setOpenAlert(false); // Close the alert when the user acknowledges
  };

  const handleCloseManaAlert = () => {
    setOpenManaAlert(false); // Close the mana alert
  };

  return (
    <PageTransition>
      <div className="relative h-screen text-white px-6 py-8 overflow-hidden overflow-y-hidden">
        {/* Full-Width Fixed Header */}
        <div className="absolute top-0 left-0 w-full sm:px-8 md:px-16 lg:px-32 px-12 mt-5 py-12 flex justify-between items-center">
          {/* Left Side: Back Button + Title + Subtitle */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <IconButton
              className="text-gray-300"
              onClick={backToHome}
              style={{
                border: "2px solid #6F658D",
                borderRadius: "50%",
                padding: "4px",
                color: "#6F658D",
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <div>
              <h2 className="text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-semibold mb-1 uppercase">
                {mode} Mode
              </h2>
              <p className="text-[12px] sm:text-[14px] text-gray-400">
                Chosen Study Material:{" "}
                <span className="font-bold text-white">{material?.title}</span>
              </p>
            </div>
          </div>

          {/* Right Side: Points + Animated Settings Icon */}
          <div className="flex items-center gap-1 sm:gap-2">
            <img
              src={ManaIcon}
              alt="Mana"
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1"
            />
            <span className="text-[14px] sm:text-[16px] text-gray-300 mr-2 sm:mr-3">
              {manaPoints}
            </span>{" "}
            {/* Dynamic mana points */}
            <span className="animate-spin text-[14px] sm:text-[16px] text-purple-400">
              ⚙️
            </span>
          </div>
        </div>

        {/* Top Alert (for question type selection) */}
        <Snackbar
          open={openAlert} // Show the alert if openAlert is true
          autoHideDuration={6000}
          onClose={handleCloseAlert}
        >
          <Alert
            onClose={handleCloseAlert}
            severity="warning"
            sx={{ width: "100%" }}
          >
            Please select a question type before proceeding.
          </Alert>
        </Snackbar>

        {/* Mana Points Alert */}
        <Snackbar
          open={openManaAlert} // Show the mana alert if openManaAlert is true
          autoHideDuration={6000}
          onClose={handleCloseManaAlert}
        >
          <Alert
            onClose={handleCloseManaAlert}
            severity="error"
            sx={{ width: "100%" }}
          >
            Your Mana points are running low. Please recharge to continue.
          </Alert>
        </Snackbar>

        {/* Centered Paper Container */}
        <div className="flex justify-center items-center h-full overflow-x-hidden overflow-y-hidden">
          <div className="paper-container flex flex-col items-center justify-center max-h-full overflow-y-hidden w-full">
            {/* Top Scroll Bar */}
            <div className="scroll-wrapper">
              <div className="scroll-holder"></div>
              <div className="scroll-bar"></div>
              <div className="scroll-holder"></div>
            </div>

            {/* Paper Content (Perfectly Centered) */}
            <div className="paper flex justify-center items-center p-4 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md">
              <div className="w-full text-center">
                <h3 className="text-[20px] sm:text-[22px] md:text-[24px] lg:text-[26px] font-bold text-black">
                  Choose your question types
                </h3>
                <p className="text-[12px] sm:text-[14px] w-[200px] sm:w-[250px] md:w-[300px] mx-auto text-gray-700">
                  Tailor your study flow and focus on what suits you best!
                </p>

                {/* Question Type Selection */}
                <div className="mt-5 space-y-2">
                  {questionTypes.map((type) => (
                    <div
                      key={type.value}
                      className="flex justify-between items-center text-black py-2 sm:py-3 px-8 sm:px-10 md:px-14"
                    >
                      <span className="font-bold text-[14px] sm:text-[16px]">
                        {type.display}
                      </span>

                      {/* Toggle Button */}
                      <div
                        onClick={() => toggleSelection(type.value)}
                        className={`relative w-12 sm:w-14 md:w-16 h-7 sm:h-8 md:h-9 flex items-center justify-between px-[4px] sm:px-[5px] md:px-[6px] rounded-md cursor-pointer transition-all ${
                          selectedTypes.includes(type.value)
                            ? "bg-black"
                            : "bg-black"
                        }`}
                      >
                        {/* Check Icon */}
                        <div
                          className={`w-5 sm:w-6 h-5 sm:h-6 flex items-center justify-center rounded-md transition-all ${
                            selectedTypes.includes(type.value)
                              ? "bg-black text-[#461ABD]"
                              : "bg-white text-[#461ABD]"
                          } `}
                        >
                          <CloseIcon />
                        </div>

                        {/* Uncheck Icon */}
                        <div
                          className={`w-5 sm:w-6 h-5 sm:h-6 flex items-center justify-center rounded transition-all ${
                            selectedTypes.includes(type.value)
                              ? "bg-white text-[#461ABD]"
                              : "bg-black text-[#461ABD]"
                          }`}
                        >
                          <CheckIcon />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Start Learning Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleStartLearning}
                    disabled={isGenerating || lobbyLoading}
                    className="mt-8 w-[240px] sm:w-[280px] md:w-[320px] py-2 sm:py-3 border-2 border-black text-black rounded-lg text-md sm:text-lg shadow-lg hover:bg-purple-700 hover:text-white hover:border-transparent flex items-center justify-center"
                  >
                    {isGenerating || lobbyLoading
                      ? "Setting up lobby..."
                      : mode === "Time Pressured"
                      ? "Continue"
                      : "START LEARNING!"}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Scroll Bar */}
            <div className="scroll-wrapper">
              <div className="scroll-holder"></div>
              <div className="scroll-bar"></div>
              <div className="scroll-holder"></div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SetUpQuestionType;
