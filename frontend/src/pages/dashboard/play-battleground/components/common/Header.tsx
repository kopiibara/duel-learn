import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import IconButton from "@mui/material/IconButton";

interface HeaderProps {
    mode: string;
    material: {
        title: string;
    } | null;
    correct: number;
    incorrect: number;
    startTime: Date;
}

export default function Header({ material, mode, correct, incorrect, startTime }: HeaderProps) {
    const navigate = useNavigate();
    const [openGameOptionsDialog, setOpenGameOptionsDialog] = useState(false);
    const [openLeaveConfirmDialog, setOpenLeaveConfirmDialog] = useState(false);
    const [openEndGameDialog, setOpenEndGameDialog] = useState(false);

    const handleBackClick = () => {
        setOpenGameOptionsDialog(true);
    };

    const handleLeaveGame = () => {
        setOpenGameOptionsDialog(false);
        setOpenLeaveConfirmDialog(true);
    };

    const handleEndGame = () => {
        setOpenGameOptionsDialog(false);
        setOpenEndGameDialog(true);
    };

    const handleConfirmLeave = () => {
        setOpenLeaveConfirmDialog(false);
        navigate("/dashboard/home");
    };

    const handleConfirmEndGame = () => {
        const endTime = new Date();
        const timeDiff = endTime.getTime() - startTime.getTime();
        const minutes = Math.floor(timeDiff / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
        const timeSpent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        navigate('/dashboard/study/session-summary', {
            state: {
                timeSpent,
                correctCount: correct,
                incorrectCount: incorrect,
                mode,
                material: material?.title || 'Unknown Material',
                earlyEnd: true
            }
        });
    };

    return (
        <>
            <header className="absolute top-0 left-0 w-full sm:px-8 md:px-16 lg:px-32 px-12 mt-5 py-12">
                <div className="flex items-center justify-between">
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
                        <div className="flex flex-col">
                            <span className="text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-semibold mb-1 text-white">
                                {mode} Mode - {material?.title || 'No Material Selected'}
                            </span>
                            <div className="flex items-center gap-4 text-[12px] sm:text-[14px] text-[#6F658D]">
                                <div>Correct {correct}</div>
                                <div>Incorrect {incorrect}</div>
                            </div>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors">
                        <SettingsIcon sx={{ fontSize: 24 }} />
                    </button>
                </div>
            </header>

            {/* Game Options Dialog */}
            <Dialog
                open={openGameOptionsDialog}
                onClose={() => setOpenGameOptionsDialog(false)}
                sx={{
                    "& .MuiDialog-paper": {
                        backgroundColor: "#080511",
                        paddingY: "30px",
                        paddingX: "20px",
                        paddingRight: "40px",
                        borderRadius: "10px",
                    }
                }}
            >
                <DialogTitle className="text-white">
                    Game Options
                </DialogTitle>
                <DialogContent className="text-white">
                    <p className="mb-4">Choose an action:</p>
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleLeaveGame}
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
                            Leave Game
                        </Button>
                        <Button
                            onClick={handleEndGame}
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
                            End Game (0 XP)
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Leave Game Confirmation Dialog */}
            <Dialog
                open={openLeaveConfirmDialog}
                onClose={() => setOpenLeaveConfirmDialog(false)}
                sx={{
                    "& .MuiDialog-paper": {
                        backgroundColor: "#080511",
                        paddingY: "30px",
                        paddingX: "20px",
                        paddingRight: "40px",
                        borderRadius: "10px",
                    }
                }}
            >
                <DialogTitle className="text-white">
                    Are you sure you want to leave?
                </DialogTitle>
                <DialogContent className="text-white">
                    <p>If you leave, your current progress will be lost. Please confirm if you wish to proceed.</p>
                </DialogContent>
                <DialogActions className="bg-[#080511]" sx={{ padding: "16px 0" }}>
                    <Button
                        onClick={() => setOpenLeaveConfirmDialog(false)}
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
                            },
                        }}
                    >
                        Yes, Leave
                    </Button>
                </DialogActions>
            </Dialog>

            {/* End Game Confirmation Dialog */}
            <Dialog
                open={openEndGameDialog}
                onClose={() => setOpenEndGameDialog(false)}
                sx={{
                    "& .MuiDialog-paper": {
                        backgroundColor: "#080511",
                        paddingY: "30px",
                        paddingX: "20px",
                        paddingRight: "40px",
                        borderRadius: "10px",
                    }
                }}
            >
                <DialogTitle className="text-white">
                    End Game Early?
                </DialogTitle>
                <DialogContent className="text-white">
                    <p>Ending the game now will result in 0 XP earned. Your progress will still be recorded. Do you want to continue?</p>
                </DialogContent>
                <DialogActions className="bg-[#080511]" sx={{ padding: "16px 0" }}>
                    <Button
                        onClick={() => setOpenEndGameDialog(false)}
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
                        onClick={handleConfirmEndGame}
                        autoFocus
                        sx={{
                            backgroundColor: "#4D1EE3",
                            color: "#FFFFFF",
                            py: 1,
                            px: 4,
                            "&:hover": {
                                backgroundColor: "#6A3EEA",
                            },
                        }}
                    >
                        End Game
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

