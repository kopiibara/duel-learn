import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoadingScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Destructure everything from location.state
  const { mode, material, selectedTypes, timeLimit, aiQuestions } = location.state || {};

  console.log("LoadingScreen received state:", location.state);
  console.log("Mode:", mode, "Material:", material, "Selected Types:", selectedTypes, "AI Questions:", aiQuestions);

  useEffect(() => {
    // Set a timer to simulate loading
    const timer = setTimeout(() => {
      // Navigate to the appropriate mode, passing ALL state including aiQuestions
      if (mode === "Peaceful") {
        navigate("/dashboard/play-battleground/peaceful", {
          state: {
            mode,
            material,
            selectedTypes,
            timeLimit,
            aiQuestions // Make sure to include aiQuestions!
          }
        });
      } else if (mode === "Time Pressured") {
        navigate("/dashboard/play-battleground/time-pressured", {
          state: {
            mode,
            material,
            selectedTypes,
            timeLimit,
            aiQuestions // Make sure to include aiQuestions!
          }
        });
      }
      // ...other mode handling...
    }, 3000); // 3 second loading screen

    return () => clearTimeout(timer);
  }, [navigate, mode, material, selectedTypes, timeLimit, aiQuestions]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        <p className="text-lg">Please wait while we prepare your study session.</p>
      </div>
    </div>
  );
};

export default LoadingScreen;