import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

interface QuestionTypeSelectionModalProps {
    open: boolean;
    onClose: () => void;
    selectedTypes: string[];
    questionTypes: { display: string; value: string; }[];
    onConfirm: (selectedTypes: string[]) => void;
}

const QuestionTypeSelectionModal: React.FC<QuestionTypeSelectionModalProps> = ({ open, onClose, selectedTypes, questionTypes, onConfirm }) => {

    const [openAlert, setOpenAlert] = useState(false); // State to control alert visibility
    const [localSelectedTypes, setLocalSelectedTypes] = useState<string[]>(selectedTypes); // State for selected question types

    const handleSaveChanges = () => {
        // If no question type is selected, show the alert
        if (localSelectedTypes.length === 0) {
            setOpenAlert(true);
        }

        else {
            console.log('Selected Question Types:', localSelectedTypes);
            onConfirm(localSelectedTypes); // Call onConfirm with the selected types
            onClose(); // Close the modal
        }
    };

    const handleCloseAlert = () => {
        setOpenAlert(false); // Close the alert when the user acknowledges
    };

    const toggleSelection = (type: string) => {
        setLocalSelectedTypes((prev: string[]) =>
            prev.includes(type) ? prev.filter((t: string) => t !== type) : [...prev, type]
        );
    };

    return (

        <div>

            <Dialog open={open} onClose={onClose} sx={{ borderRadius: '16px' }}>
                <div className="flex justify-center bg-[#080511] px-20 py-20 items-center h-full overflow-x-hidden overflow-y-hidden">
                    <div className="paper-container  flex flex-col items-center justify-center max-h-full overflow-y-hidden w-full">
                        <div className="paper flex justify-center items-center p-4 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md">
                            <div className="w-full text-center">
                                <h3 className="text-[20px] sm:text-[22px] md:text-[24px] lg:text-[26px] font-bold text-black">
                                    Choose your question types
                                </h3>
                                <p className="text-[12px] sm:text-[14px] w-[200px] sm:w-[250px] md:w-[300px] mx-auto text-gray-700">
                                    Tailor your study flow and focus on what suits you best!
                                </p>
                                <div className="mt-5 space-y-2">
                                    {questionTypes.map((type) => (
                                        <div
                                            key={type.value}
                                            className="flex justify-between items-center text-black py-2 sm:py-3 px-8 sm:px-10 md:px-14"
                                        >
                                            <span className="font-bold text-[14px] sm:text-[16px]">
                                                {type.display}
                                            </span>
                                            <div
                                                onClick={() => toggleSelection(type.value)}
                                                className={`relative w-12 sm:w-14 md:w-16 h-7 sm:h-8 md:h-9 flex items-center justify-between px-[4px] sm:px-[5px] md:px-[6px] rounded-md cursor-pointer transition-all ${localSelectedTypes.includes(type.value) ? "bg-black" : "bg-black"}
                                            `}
                                            >
                                                <div
                                                    className={`w-5 sm:w-6 h-5 sm:h-6 flex items-center justify-center rounded-md transition-all ${localSelectedTypes.includes(type.value)
                                                        ? "bg-black text-[#461ABD]"
                                                        : "bg-white text-[#461ABD]"
                                                        } `}
                                                >
                                                    <CloseIcon />
                                                </div>
                                                <div
                                                    className={`w-5 sm:w-6 h-5 sm:h-6 flex items-center justify-center rounded transition-all ${localSelectedTypes.includes(type.value)
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
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleSaveChanges}
                                        className="mt-8 w-[240px] sm:w-[280px] md:w-[320px] py-2 sm:py-3 border-2 border-black text-black rounded-lg text-md sm:text-lg shadow-lg hover:bg-purple-700 hover:text-white hover:border-transparent flex items-center justify-center"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
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
        </div>

    );
};

export default QuestionTypeSelectionModal; 