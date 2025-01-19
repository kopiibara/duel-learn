import * as React from "react";

export default function TutorialTwo() {
    const handleSkipTutorial = () => {
        window.location.href = "/dashboard";
    };

    return (
        <main
            className="relative flex flex-col items-center px-20 py-20 text-white h-screen bg-[#080511] overflow-hidden"
            role="main"
        >
            {/* Animated Background Glow */}
            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#6B21A8] blur-[250px] rounded-full opacity-40 animate-pulse transform -translate-x-1/2 -translate-y-1/2"></div>

            {/* Skip Tutorial Button */}
            <button
                onClick={handleSkipTutorial}
                className="flex gap-3 items-center hover:opacity-80 transition-opacity self-end mb-4 md:mb-0 z-10"
                aria-label="Skip tutorial"
            >
                <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/b20313cd550bb82f6d702b44430af4b69c7971c4c162fa3d8d515d17cb8bbecb?placeholderIfAbsent=true&apiKey=ff410939217f45aaab06e3ea5ab60b09"
                    alt="Skip Tutorial"
                    className="w-5 aspect-square object-contain"
                />
                <span className="text-[17px] font-bold text-white">SKIP TUTORIAL</span>
            </button>

            {/* Video Section */}
            <div className="flex justify-center items-center w-full mt-10 md:mt-16 z-10">
                <div className="w-full max-w-[801px] h-[297px] bg-zinc-300 rounded-xl"></div>
            </div>

            {/* Dialogue Box */}
            <div className="flex flex-col md:flex-row mt-20 gap-20 w-full items-center justify-between max-w-[1100px] z-10">
                {/* Avatar Section */}
                <div className="flex-shrink-0">
                    <div className="w-[210px] h-[210px] bg-zinc-300 rounded-md"></div>
                </div>

                {/* Speech Bubble */}
                <div className="relative bg-[#1D1828] text-xl text-white rounded px-16 py-14 max-w-[816px]">
                    <p>
                        First, you'll want to{" "}
                        <span className="font-bold">create study materials</span>. Think of
                        them as your magical tomes—crafted manually or with the help of our
                        assistive tools such as <span className="font-bold">OCR & AI</span>!
                    </p>
                    {/* Left-Pointing Arrow */}
                    <div className="absolute w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[15px] border-r-[#1D1828] left-[-15px] top-1/2 transform -translate-y-1/2"></div>
                </div>
            </div>

            
        </main>
    );
}
