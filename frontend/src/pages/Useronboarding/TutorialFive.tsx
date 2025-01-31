import * as React from "react";
import Typewriter from "typewriter-effect"; // Import the Typewriter component
import useWandCursor from "./data/useWandCursor"; // Import the wand cursor hook
import { useNavigate } from "react-router-dom";
import CharacterTalking from "../../assets/UserOnboarding/CharacterTalking.png"

export default function TutorialFive() {
    // Initialize the wand cursor effect
    useWandCursor();
    const navigate = useNavigate();

    const handleSkipTutorial = (event: React.MouseEvent) => {
        event.stopPropagation(); // Stop the event from propagating to the main click handler
        navigate("/my-preferences"); // Navigate directly using React Router
    };

    return (
        <main
            className="relative flex flex-col items-center px-20 py-20 text-white h-screen bg-[#080511] overflow-hidden cursor-none"
            role="main"
            onClick={() => {
                console.log("Screen clicked, navigating...");
                navigate("/tutorial/step-six");
            }}
        >
            {/* Magic Wand Cursor */}
            <div className="wand-cursor"></div>

            {/* Animated Background Glow */}
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#6B21A8] blur-[250px] rounded-full opacity-40 animate-pulse transform -translate-x-1/2 -translate-y-1/2"></div>

            {/* Skip Tutorial Button */}
            <button
                onClick={handleSkipTutorial}
                className="flex gap-3 items-center hover:opacity-80 transition-opacity self-end mb-2 md:mb-0 z-10"
                aria-label="Skip tutorial"
            >
                <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/b20313cd550bb82f6d702b44430af4b69c7971c4c162fa3d8d515d17cb8bbecb?placeholderIfAbsent=true&apiKey=ff410939217f45aaab06e3ea5ab60b09"
                    alt="Skip Tutorial"
                    className="w-5 aspect-square object-contain"
                />
                <span className="text-[14px] md:text-lg font-bold text-white">SKIP TUTORIAL</span>
            </button>

            {/* Video Section */}
            <div className="flex justify-center items-center w-full mt-10 md:mt-16 z-10">
                <div className="w-full max-w-[801px] h-[297px] bg-zinc-300 rounded-xl"></div>
            </div>

            {/* Dialogue Box */}
            <div className="flex flex-col-reverse md:flex-row mt-12 sm:mt-15 md:mt-20 gap-10 w-full items-center justify-between max-w-[1100px] z-10">
                {/* Avatar Section */}
                <div className="flex-shrink-0">
                    {/* Use the CharacterTalking image as an avatar */}
                    <img
                        src={CharacterTalking} // Set the character image
                        alt="Character talking"
                        className="w-[130px] h-[130px] animate-tutorial1  md:w-[210px] md:h-[210px] rounded-md object-cover"
                    />
                </div>

                {/* Speech Bubble with Typewriter Effect */}
                <div className="relative bg-[#1D1828] text-sm md:text-xl text-white rounded px-8 md:px-16 py-8 md:py-14 w-[816px] h-[auto] max-w-full">
                    <Typewriter
                        onInit={(typewriter) => {
                            typewriter
                                .typeString(
                                    ` <span class="font-bold">Time-Pressured Mode</span> to sharpen your reflexes. Get your mind ready for those timed questions and some pressuring twists!`
                                )
                                .start();
                        }}
                        options={{
                            autoStart: true,
                            loop: false,
                            delay: 30, // Adjust delay for typing speed
                        }}
                    />

                    {/* Left-Pointing Arrow for larger screens */}
                    <div className="absolute w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[15px] border-r-[#1D1828] left-[-15px] top-1/2 transform -translate-y-1/2 md:block hidden"></div>
                    {/* Down-Pointing Arrow for smaller screens */}
                    <div className="absolute w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-[#1D1828] left-1/2 top-full transform -translate-x-1/2 md:hidden block"></div>
                </div>

            </div>
        </main>
    );
}
