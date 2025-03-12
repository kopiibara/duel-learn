import { Button } from "@mui/material";
import SessionComplete from "../../../../assets/General/SessionComplete.png";
import ClockIcon from "../../../../assets/clock.png";
import ManaIcon from "../../../../assets/ManaIcon.png";
import { useNavigate, useLocation } from "react-router-dom";
import AutoConfettiAnimation from "../../../../pages/dashboard/play-battleground/components/common/AutoConfettiAnimation";
import { useAudio } from "../../../../contexts/AudioContext"; // Import the useAudio hook

interface SessionReportProps {
  timeSpent: string;
  correctCount: number;
  incorrectCount: number;
  mode: "Peaceful" | "time-pressured" | "pvp";
  material: { title: string };
  earlyEnd?: boolean;
  startTime: Date;
  highestStreak: number;
  masteredCount: number;
  unmasteredCount: number;
}

interface StatisticProps {
  label: string;
  value: string | number;
}

const StatisticBox = ({
  label,
  value,
  icon,
}: StatisticProps & { icon: string }) => (
  <div className="backdrop-blur-sm px-10 py-7 rounded-md border w-[660px] border-[#3B354D] flex justify-between items-center">
    <div className="flex items-center gap-2">
      <img src={icon} alt="" className="w-5 h-5 mb-1 mr-3" />
      <div className="text-base mb-1 text-white uppercase tracking-wider">
        {label}
      </div>
    </div>
    <div className="text-base font-bold text-white mt-1">{value}</div>
  </div>
);

const SessionReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    timeSpent,
    correctCount,
    incorrectCount,
    mode,
    material,
    earlyEnd,
    highestStreak,
    masteredCount,
    unmasteredCount,
  } = location.state as SessionReportProps;
  const { pauseAudio } = useAudio(); // Use the pauseAudio function

  // Add console log to check the value of highestStreak after destructuring it from location.state
  console.log("Received highestStreak:", highestStreak);

  // Calculate XP based on mode and number of questions answered
  const calculateXP = () => {
    // If the game was ended early, return 0 XP
    if (earlyEnd) {
      return 0;
    }

    // For Peaceful mode
    if (mode === "Peaceful") {
      return 5;
    }

    // For Time Pressured mode
    if (mode === "time-pressured") {
      const totalQuestions = correctCount + incorrectCount;

      if (totalQuestions >= 50) return 30;
      if (totalQuestions >= 40) return 25;
      if (totalQuestions >= 30) return 20;
      if (totalQuestions >= 20) return 10;
      if (totalQuestions < 10) return 5; // For below 10 questions
    }

    // For other modes (like PVP if implemented later)
    return correctCount * 5;
  };

  const earnedXP = calculateXP();

  // Add console logs to check passed data
  console.log("Session Report Data:", {
    timeSpent,
    correctCount,
    incorrectCount,
    mode,
    material,
    earnedXP,
    highestStreak,
  });

  return (
    <div
      style={{ overflow: "auto", height: "80vh" }}
      className="min-h-screen flex items-center justify-center p-4 pb-16"
    >
      {" "}
      {/* Added pb-16 for padding-bottom */}
      {!earlyEnd && <AutoConfettiAnimation />}
      <div className="w-full max-w-[800px ] space-y-8 text-center mb-[600px]  max-h-screen">
        {/* Session Complete Banner */}
        <div className="relative inline-block mx-auto mt-[490px]">
          <img
            src={SessionComplete}
            alt="SESSION COMPLETE"
            className="relative z-10 w-[554px] h-[96px]"
          />
        </div>

        <div>
          {/* Stats Box */}
          <div className="backdrop-blur-sm p-8 mt-[8px] mb-[-20px] rounded-xl">
            <div className="flex flex-col mt-3 gap-4 items-center">
              <StatisticBox
                label="EARNED XP"
                value={`${earnedXP} XP`}
                icon={ManaIcon}
              />
              <StatisticBox
                label="TOTAL TIME"
                value={timeSpent}
                icon={ClockIcon}
              />
              {mode === "Peaceful" ? (
                <>
                  <StatisticBox
                    label="MASTERED"
                    value={masteredCount}
                    icon={ManaIcon}
                  />
                  <StatisticBox
                    label="UNMASTERED"
                    value={unmasteredCount}
                    icon={ManaIcon}
                  />
                </>
              ) : (
                <>
                  <StatisticBox
                    label="HIGHEST STREAK"
                    value={`${highestStreak}x`}
                    icon={ManaIcon}
                  />
                  <StatisticBox
                    label="CORRECT ANSWERS"
                    value={correctCount}
                    icon={ManaIcon}
                  />
                  <StatisticBox
                    label="INCORRECT ANSWERS"
                    value={incorrectCount}
                    icon={ManaIcon}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            sx={{
              px: 4,
              py: 1.5,
              backgroundColor: "#2C2C38",
              color: "white",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#1E1E26",
              },
            }}
            onClick={() =>
              navigate("/dashboard/welcome-game-mode", {
                state: { mode, material },
              })
            }
          >
            STUDY AGAIN
          </Button>
          <Button
            sx={{
              px: 4,
              py: 1.5,
              backgroundColor: "#4D18E8",
              color: "white",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#3A12B0",
              },
            }}
            onClick={() => {
              pauseAudio(); // Stop audio when navigating back to home
              navigate("/dashboard/home");
            }}
          >
            Go Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionReport;
