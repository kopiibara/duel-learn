import React, { useState } from "react";
import {
    Box,
    Button,
    Modal,
    Typography,
    Stack,
    Backdrop,
    Fade,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ModalFriendList from "../../../../../assets/General/ModalFriendList.png"; // Adjust the path as necessary
import SelectStudyMaterialModal from "../../../../../components/modals/SelectStudyMaterialModal"; // Import the material selection modal

interface PvPModeModalProps {
    open: boolean;
    handleClose: () => void;
    selectedTypes: string[];
}

const ChoosePvPModeModal: React.FC<PvPModeModalProps> = ({ open, handleClose, selectedTypes }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    console.log("Selected Types in ChoosePvPModeModal:", selectedTypes); // Log the selectedTypes

    const buttonData = [
        { label: "Easy", subtitle: "20 secs" },
        { label: "Average", subtitle: "15 secs" },
        { label: "Hard", subtitle: "10 secs" },
    ];

    const handleMaterialSelect = (material: any) => {
        // Logic to handle the selected material
    };

    const handleModeSelect = (mode: string) => {
        setSelectedMode(mode); // Set the selected mode
        setModalOpen(true); // Open the SelectStudyMaterialModal
    };

    return (
        <>
            <Modal
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.5)", // Darker background
                    },
                }}
            >
                <Fade in={open}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: { xs: "90%", sm: "880px" },
                            height: { xs: "auto", sm: "600px" },
                            bgcolor: "#080511",
                            borderRadius: "10px",
                            boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: { xs: "20px", sm: "40px" },
                            paddingY: { xs: "60px", sm: "40px" },
                        }}
                    >
                        {/* Close button */}
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
                            sx={{
                                position: "absolute",
                                top: 16,
                                right: 16,
                                color: "#FFFFFF",
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

                        {/* Modal Friend List Image */}
                        <Box
                            component="img"
                            src={ModalFriendList}
                            alt="Modal Friend List"
                            sx={{
                                width: "70px",
                                objectFit: "cover",
                                borderRadius: "5px 5px 0 0",
                                mb: 2,
                            }}
                        />

                        {/* Modal Header */}
                        <Typography
                            sx={{
                                fontWeight: "bold",
                                fontSize: { xs: "24px", sm: "32px" },
                                color: "#FFFFFF",
                                textAlign: "center",
                            }}
                        >
                            Choose Your Challenge
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: "#9F9BAE",
                                mb: 5,
                                textAlign: "center",
                                fontSize: { xs: "14px", sm: "16px" },
                            }}
                        >
                            Forge your learning quest, Magician!
                        </Typography>

                        {/* Buttons */}
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={3}
                            justifyContent="center"
                            alignItems="stretch" // Ensure buttons stretch to fill the height
                            sx={{ width: "100%", mt: 2 }}
                        >
                            {buttonData.map((button, index) => (
                                <Box
                                    key={index}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    sx={{
                                        width: { xs: "100%", sm: "231px" },
                                        height: "272px", // Set a consistent height
                                        borderRadius: "8px",
                                        backgroundColor:
                                            hoveredIndex === index
                                                ? "#E8E2FE" // Highlight color for hovered button
                                                : hoveredIndex !== null
                                                    ? "#B0B0B0" // Dimmed color for non-hovered buttons
                                                    : "#E2DBF8", // Default color
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "flex-end", // Align text to the bottom
                                        textAlign: "center", // Center text horizontally
                                        padding: "20px", // Add padding for text
                                        transition: "background-color 0.3s ease",
                                    }}
                                    onClick={() => {
                                        const formattedMode = `PvP Mode - ${button.label}`; // Format the mode
                                        handleModeSelect(formattedMode); // Call the handleModeSelect function
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            color: "#000000",
                                            fontWeight: "bold",
                                            fontSize: "17px",
                                            mb: "1px",
                                        }}
                                    >
                                        {button.label}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: "#322168",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {button.subtitle}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Fade>
            </Modal>

            {/* Select Study Material Modal */}
            <SelectStudyMaterialModal
                open={modalOpen}
                handleClose={() => setModalOpen(false)} // This closes the study material modal
                mode={selectedMode} // Pass the selected mode
                isLobby={true} // Indicate that this is being used in the lobby
                onMaterialSelect={handleMaterialSelect} // Pass the selection handler
                onModeSelect={handleModeSelect} // Pass the mode selection handler
                selectedTypes={selectedTypes} // Pass selectedTypes to the modal
            />
        </>
    );
};

export default ChoosePvPModeModal;