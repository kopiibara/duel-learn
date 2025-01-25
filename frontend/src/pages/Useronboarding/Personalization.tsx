// Personalization.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import PersonalizationBG from "../../assets/UserOnboarding/PersonalizationBG.png";
import { useNavigate } from "react-router-dom";
import { topics } from "./data/topics";  // Import the topics from the separate file

const Personalization: React.FC = () => {
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Preload the background image
        const img = new Image();
        img.src = PersonalizationBG;

        img.onload = () => {
            setTimeout(() => {
                setIsLoaded(true);
                setImageLoaded(true);
                document.body.style.overflow = "auto"; // Re-enable scrolling
            }, 1000); // Delay the loading screen for smooth transition
        };

        img.onerror = () => {
            console.error("Failed to load background image.");
            setTimeout(() => {
                setIsLoaded(true);
                setImageLoaded(true);
                document.body.style.overflow = "auto"; // Re-enable scrolling
            }, 2000);
        };

        // Disable scrolling during loading
        document.body.style.overflow = "hidden";
    }, []);

    const handleClickDone = () => {
        alert(`Selected topics: ${selectedSubjects.join(", ")}`);
        navigate("/dashboard/home");
    };

    const handleSubjectClick = (subject: string) => {
        if (selectedSubjects.includes(subject)) {
            setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
        } else {
            setSelectedSubjects([...selectedSubjects, subject]);
        }
    };

    if (!isLoaded) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    width: "100%",
                    backgroundColor: "#080511", // Dark background for loading
                }}
            >
                {/* Loading Spinner */}
                <div
                    style={{
                        border: "8px solid rgba(255, 255, 255, 0.2)", // Light gray border
                        borderTop: "8px solid #FFFFFF", // White border for spinning effect
                        borderRadius: "50%",
                        width: "50px",
                        height: "50px",
                        animation: "spin 1s linear infinite", // Spinner animation
                    }}
                ></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-hidden text-white p-6 flex flex-col items-center relative">
            {/* Independent container for the background image */}
            <img
                src={imageLoaded ? PersonalizationBG : ''}  // Only set the source once the image is loaded
                alt="Personalization Background"
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)', // Center the image horizontally
                    width: '100%', // Make the width of the image span the entire width of the viewport
                    height: 'auto', // Maintain aspect ratio
                    zIndex: -1, // Ensure it's behind the content
                }}
            />

            <div className="mt-8 mr-20 flex justify-end w-full gap-4">
                {/* Skip Button */}
                <Button
                    sx={{
                        textTransform: "capitalize",
                        color: "#7F6F8B",
                        padding: "10px 20px", // Add padding for better button size
                        "&:hover": {
                            color: "white",
                        },
                    }}
                    onClick={() => {
                        // Clear the selected subjects
                        setSelectedSubjects([]);
                        // Navigate to the dashboard or the desired route
                        navigate("/dashboard/home");
                    }}
                >
                    Skip
                </Button>

                {/* Conditionally render Done Button based on the selected subjects */}
                {selectedSubjects.length > 0 && (
                    <Button
                        sx={{
                            textTransform: "capitalize",
                            backgroundColor: "#4D18E8",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "#7B3FFF", // Lighter purple on hover
                                color: "white",
                            },
                        }}
                        variant="contained"
                        onClick={() => handleClickDone()}
                    >
                        Done
                    </Button>
                )}
            </div>

            <div className="w-28 h-28 rounded bg-white mb-6 mt-36"></div>
            <h1 className="text-2xl font-bold mb-2">Your Magical Journey Starts Here!</h1>
            <p className="text-md mb-20 text-center text-[#786d99]">
                Select topics to open the gates to a world of personalized discovery.
            </p>

            <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
                {topics.map((category, index) => (
                    <div key={index} className="mb-16">
                        <h2 className="text-lg font-semibold mb-7">{category.topic}</h2>
                        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 justify-center">
                            {category.subjects.map((subject, idx) => (
                                <button
                                    key={idx}
                                    className={`p-4 border rounded-lg transition-all h-[204px] w-[209px] ${selectedSubjects.includes(subject.name)
                                        ? "bg-[#A28CE2] border-indigo-400 font-bold text-[#322168]"
                                        : "bg-white text-[#322168] font-bold hover:bg-gray-200"
                                        }`}
                                    onClick={() => handleSubjectClick(subject.name)}
                                >
                                    <div className="flex flex-col items-center">
                                        {subject.icon}
                                        <span className="mt-2">{subject.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <footer className="mt-10 mb-5 w-full px-2 sm:px-3 md:px-3 lg:px-28 text-gray-500 text-sm md:text-base">
                <div className="flex justify-between items-center w-full">
                    {/* Privacy and Terms Links */}
                    <div className="flex gap-6">
                        <p className="cursor-pointer hover:text-white transition">Privacy</p>
                        <p className="cursor-pointer hover:text-white transition">Terms</p>
                    </div>
                    {/* Copyright */}
                    <p>© 2024 Duel-Learn Inc.</p>
                </div>
            </footer>
        </div>
    );
};

export default Personalization;
