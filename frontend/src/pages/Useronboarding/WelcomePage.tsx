import React, { useEffect, useState } from "react";
import "./styles/EffectUserOnboarding.css";
import { useNavigate } from "react-router-dom";
import useWandCursor from "./data/useWandCursor"; // Import the custom hook

const WelcomePage = () => {
    const [fadeIn, setFadeIn] = useState(false);
    const navigate = useNavigate();

    // Use the wand cursor effect
    useWandCursor();

    useEffect(() => {
        const timer = setTimeout(() => setFadeIn(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className="flex flex-col gap-[65px] items-center justify-center h-screen bg-[#080511] relative overflow-hidden cursor-none"
            onClick={() => {
                console.log("Screen clicked, navigating...");
                navigate("/tutorial/step-one");
            }}
        >
            {/* Animated Background Glow */}
            <div className="absolute w-[500px] h-[500px] bg-[#6B21A8] blur-[250px] rounded-full opacity-40 animate-pulse"></div>

            {/* Center Square */}
            <div className="relative z-10 w-48 h-48 bg-[#D9D9D9] rounded"></div>

            {/* Welcome Text */}
            <p
                className={`text-[24px] text-white transition-opacity duration-1000 ${
                    fadeIn ? "opacity-100" : "opacity-0"
                }`}
            >
                You've finally made it here, <span className="font-bold">JING009!</span>
            </p>

            {/* Click to Continue Text */}
            <p
                className={`absolute bottom-[10%] text-[18px] text-[#3B354D] transition-opacity duration-1000 ${
                    fadeIn ? "opacity-100" : "opacity-0"
                }`}
                style={{ animation: "fadeInOut 3s infinite" }}
            >
                Tap anywhere on the screen to continue
            </p>
        </div>
    );
};

export default WelcomePage;
