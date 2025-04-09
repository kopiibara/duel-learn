import { Button } from "@mui/material";
import SessionComplete from "../../../../../../../assets/General/SessionComplete.png";
import ClockIcon from "../../../../../../../assets/clock.png";
import ManaIcon from "../../../../../../../assets/ManaIcon.png";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import AutoConfettiAnimation from "../../../../../../../pages/dashboard/play-battleground/components/common/AutoConfettiAnimation";
import { useAudio } from "../../../../../../../contexts/AudioContext";
import { useEffect, useState } from "react";
import CompleteOrVictory from "../../../../../../../../public/session-reports/CompleteOrVictory.png";
import IncompleteOrDefeat from "../../../../../../../../public/session-reports/IncompleteOrDefeat.png";

interface PvpSessionReportProps {
    timeSpent: string;
    correctCount: number;
    incorrectCount: number;
    mode: "pvp";
    material: any;
    earlyEnd?: boolean;
    startTime?: Date;
    highestStreak: number;
    playerHealth: number;
    opponentHealth: number;
    playerName: string;
    opponentName: string;
    isWinner: boolean;
    sessionUuid: string;
    hostId?: string;
    guestId?: string;
    isHost?: boolean;
    earnedXP?: number;
    earnedCoins?: number;
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

const PvpSessionReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showAllStats, setShowAllStats] = useState(false);

    // If there's no state, redirect to home
    if (!location.state) {
        return <Navigate to="/dashboard/home" replace />;
    }

    const {
        timeSpent,
        correctCount,
        incorrectCount,
        mode,
        material,
        earlyEnd,
        highestStreak,
        playerHealth,
        opponentHealth,
        playerName,
        opponentName,
        isWinner,
        sessionUuid,
        hostId,
        guestId,
        isHost,
        earnedXP,
        earnedCoins
    } = location.state as PvpSessionReportProps;

    const { pauseAudio, playSessionCompleteSound } = useAudio();

    // Keep the sound effects useEffects
    useEffect(() => {
        const playSound = async () => {
            if (!earlyEnd) {
                await playSessionCompleteSound();
            }
        };
        playSound();
    }, [earlyEnd, playSessionCompleteSound]);

    useEffect(() => {
        const delay = 1000;
        const timer = setTimeout(() => {
            pauseAudio();
        }, delay);

        return () => clearTimeout(timer);
    }, [pauseAudio]);

    // Add console logs to check passed data
    console.log("PVP Session Report Data:", {
        timeSpent,
        correctCount,
        incorrectCount,
        mode,
        material,
        earnedXP,
        earnedCoins,
        highestStreak,
        playerHealth,
        opponentHealth,
        isWinner
    });

    return (
        <div
            style={{ overflow: "auto", height: "80vh" }}
            className="min-h-screen flex items-center justify-center p-4 pb-16"
        >
            {!earlyEnd && isWinner && <AutoConfettiAnimation />}
            <div className="w-full max-w-[1000px] space-y-8 text-center mt-[330px] mb-[1000px] max-h-screen">
                {/* Session Complete Banner */}
                <div className="relative inline-block mx-auto mt-[490px]">
                    <img
                        src={SessionComplete}
                        alt="BATTLE COMPLETE"
                        className="relative z-10 w-[554px] h-[96px]"
                    />
                </div>
                <div className="relative inline-block mx-auto mt-[490px]">
                    <img
                        src={isWinner ? CompleteOrVictory : IncompleteOrDefeat}
                        alt={isWinner ? "VICTORY" : "DEFEAT"}
                        className="relative z-10 w-[574px] h-[278px] mt-5"
                    />
                </div>

                <div>
                    {/* Stats Box */}
                    <div className="backdrop-blur-sm p-8 mt-[5px] mb-[-20px] rounded-xl">
                        <div className="flex flex-col mt-[-10px] gap-4 items-center">
                            <StatisticBox
                                label="EARNED XP"
                                value={`${earnedXP} XP`}
                                icon={ManaIcon}
                            />
                            <StatisticBox
                                label="EARNED COINS"
                                value={`${earnedCoins} Coins`}
                                icon={ManaIcon}
                            />
                            <StatisticBox
                                label="TOTAL TIME"
                                value={timeSpent}
                                icon={ClockIcon}
                            />
                            <StatisticBox
                                label="BATTLE RESULT"
                                value={isWinner ? "VICTORY" : "DEFEAT"}
                                icon={ManaIcon}
                            />

                            {showAllStats && (
                                <>
                                    <StatisticBox
                                        label={`${playerName}'S HEALTH`}
                                        value={playerHealth}
                                        icon={ManaIcon}
                                    />
                                    <StatisticBox
                                        label={`${opponentName}'S HEALTH`}
                                        value={opponentHealth}
                                        icon={ManaIcon}
                                    />
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

                            <Button
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    color: "white",
                                    borderRadius: 2,
                                    marginTop: 2,
                                    backgroundColor: "#2C2C38",
                                    "&:hover": {
                                        backgroundColor: "#1E1E26",
                                    },
                                }}
                                onClick={() => setShowAllStats(!showAllStats)}
                            >
                                {showAllStats ? "Show Less" : "See More"}
                            </Button>
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
                        PLAY AGAIN
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
                            pauseAudio();
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

export default PvpSessionReport;