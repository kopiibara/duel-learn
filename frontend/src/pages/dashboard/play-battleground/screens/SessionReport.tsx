import { Button } from "@mui/material";
import SessionComplete from "../../../../assets/General/SessionComplete.png";
import ClockIcon from "../../../../assets/clock.png";
import ManaIcon from "../../../../assets/ManaIcon.png";
import { useNavigate, useLocation } from 'react-router-dom';
import banner from "../banner.jpg"

interface SessionReportProps {
    timeSpent: string;
    correctCount: number;
    incorrectCount: number;
    mode: 'Peaceful' | 'time-pressured' | 'pvp';
    material: { title: string }; // Update this line
    earlyEnd?: boolean;
    startTime: Date;
    highestStreak: number;
}

interface StatisticProps {
    label: string;
    value: string | number;
}

const StatisticBox = ({ label, value, icon }: StatisticProps & { icon: string }) => (
    <div className="backdrop-blur-sm px-6 py-7 rounded-md border border-white">
        <div className="flex items-center gap-2 justify-center">
            <img src={icon} alt="" className="w-4 h-4 mb-1" />
            <div className="text-sm mb-1 text-gray-400 uppercase tracking-wider">{label}</div>
        </div>
        <div className="text-xl font-bold text-white mt-1">{value}</div>
    </div>
);

const SessionReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { timeSpent, correctCount, incorrectCount, mode, material, earlyEnd, startTime, highestStreak } = location.state as SessionReportProps;


    // Add console log to check the value of highestStreak after destructuring it from location.state
    console.log('Received highestStreak:', highestStreak);

    // Calculate XP based on mode and number of questions answered
    const calculateXP = () => {
        // If the game was ended early, return 0 XP
        if (earlyEnd) {
            return 0;
        }

        // For Peaceful mode
        if (mode === 'Peaceful') {
            return 5;
        }

        // For Time Pressured mode
        if (mode === 'time-pressured') {
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
    console.log('Session Report Data:', {
        timeSpent,
        correctCount,
        incorrectCount,
        mode,
        material,
        earnedXP,
        highestStreak
    });


    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 text-center">
                {/* Session Complete Banner */}
                <div className="relative inline-block mx-auto">
                    <img
                        src={SessionComplete}
                        alt="SESSION COMPLETE"
                        className="relative z-10"
                    />
                </div>

                <div>
                    <div className="flex justify-center">
                        <img
                            src={banner}
                            alt="Session Report Banner"
                            className="w-72"
                        />
                    </div>

                    {/* Stats Box */}
                    <div className="backdrop-blur-sm p-8 mt-[8px] mb-[-20px] rounded-xl">
                        <div className="text-lg text-white mb-6 uppercase tracking-wider">
                            STATISTICS
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                            {!earlyEnd && (
                                <StatisticBox
                                    label="HIGHEST STREAK"
                                    value={`${highestStreak}x`}
                                    icon={ManaIcon}
                                />
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
                            backgroundColor: '#2C2C38',
                            color: 'white',
                            borderRadius: 2,
                            '&:hover': {
                                backgroundColor: '#1E1E26',
                            }
                        }}
                        onClick={() => navigate('/dashboard/welcome-game-mode', {
                            state: { mode, material }
                        })}
                    >
                        STUDY AGAIN
                    </Button>
                    <Button
                        sx={{
                            px: 4,
                            py: 1.5,
                            backgroundColor: '#4D18E8',
                            color: 'white',
                            borderRadius: 2,
                            '&:hover': {
                                backgroundColor: '#3A12B0',
                            }
                        }}
                        onClick={() => navigate('/dashboard/home')}
                    >
                        Go Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SessionReport;
