import React, { useEffect, useState } from "react";
import Typewriter from "typewriter-effect"; // Import the Typewriter component
import "./EffectUserOnboarding.css";
import { useNavigate } from "react-router-dom";

const TutorialOnePage: React.FC = () => {
    const [animate, setAnimate] = useState<boolean>(false);
    const [showFullText, setShowFullText] = useState<boolean>(false); // New state for skipping animation
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 500); // Delay for animation
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const wandCursor = document.querySelector('.wand-cursor') as HTMLElement;
        const sparklesContainer = document.getElementById('sparkles-container') as HTMLElement;

        function createSparkle(x: number, y: number) {
            const sparkle = document.createElement('div');
            sparkle.classList.add('sparkle');
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;

            sparklesContainer.appendChild(sparkle);

            setTimeout(() => {
                sparkle.remove();
            }, 800);
        }

        const handleMouseMove = (e: MouseEvent) => {
            wandCursor.style.left = `${e.pageX}px`;
            wandCursor.style.top = `${e.pageY}px`;

            const numSparkles = 5;
            for (let i = 0; i < numSparkles; i++) {
                const offsetX = Math.random() * 20 - 10; // Random x offset
                const offsetY = Math.random() * 20 - 10; // Random y offset
                createSparkle(e.pageX + offsetX, e.pageY + offsetY);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div
            className="flex flex-col items-center justify-center h-screen bg-[#080511] relative overflow-hidden cursor-none"
            onClick={() => {
                console.log("Screen clicked, navigating...");
                navigate("/my-preferences");
            }}
        >
            {/* Sparkles Container */}
            <div id="sparkles-container"></div>

            {/* Magic Wand Cursor */}
            <div className="wand-cursor"></div>

            {/* Animated Background Glow */}
            <div className="absolute w-[500px] h-[500px] bg-[#6B21A8] blur-[250px] rounded-full opacity-40 animate-pulse"></div>

            {/* Dialogue Box */}
            <div
                className={`relative z-10 bg-[#2C2A35] text-white py-9 px-14 rounded-lg shadow-lg max-w-[580px] transition-transform duration-1000 ${animate ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                style={{ position: "relative" }}
                onClick={() => setShowFullText(true)} // Skip animation on click
            >
                <div className="text-center text-[18px]">
                    {showFullText ? ( // Show full text if skipped
                        <span>
                            Congratulations on stepping into the magical world of{" "}
                            <span className="font-bold">Dark Learn</span>! Let me show you the spells you'll be casting here.
                        </span>
                    ) : (
                        <Typewriter
                            onInit={(typewriter) => {
                                typewriter
                                    .typeString(`Congratulations on stepping into the magical world of <span class="font-bold">Dark Learn</span>! Let me show you the spells you'll be casting here.`)
                                    .start();
                            }}
                            options={{
                                autoStart: true,
                                loop: false,
                                delay: 50,
                            }}
                        />
                    )}
                </div>
                {/* Triangle for the speech bubble */}
                <div className="absolute w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-[#2C2A35] left-[50%] translate-x-[-50%] top-full"></div>
            </div>

            {/* Image Container */}
            <div className={`relative z-10 w-48 h-48 bg-[#D9D9D9] rounded mt-16 mb-28 transition-transform duration-1000 ${animate ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}></div>

            {/* Click to Continue Text */}
            <p
                className={`absolute bottom-[10%] text-[18px] text-[#9F9BAE] transition-opacity duration-1000 ${animate ? "opacity-100" : "opacity-0"}`}
                style={{ animation: "fadeInOut 3s infinite" }}
            >
                Tap anywhere on the screen to continue
            </p>
        </div>
    );
};

export default TutorialOnePage;
