import React from "react";

const WelcomePage = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-[#080511]">
            {/* Animated circles */}
            <div className="relative flex items-center justify-center">
                {/* Largest Circle */}
                <div className="absolute w-[1600px] h-[1600px] bg-[#A38CE6] rounded-full slow-pulse opacity-20"></div>
                {/* Second Largest Circle */}
                <div className="absolute w-[1400px] h-[1400px] bg-[#A38CE6] rounded-full slow-pulse opacity-25"></div>
                {/* Third Largest Circle */}
                <div className="absolute w-[1200px] h-[1200px] bg-[#A38CE6] rounded-full slow-pulse opacity-30"></div>
                {/* Fourth Largest Circle */}
                <div className="absolute w-[1000px] h-[1000px] bg-[#A38CE6] rounded-full slow-pulse opacity-40"></div>
                {/* Fifth Largest Circle */}
                <div className="absolute w-[800px] h-[800px] bg-[#A38CE6] rounded-full slow-pulse opacity-50"></div>
                {/* Sixth Circle */}
                <div className="absolute w-[600px] h-[600px] bg-[#A38CE6]0 rounded-full slow-pulse opacity-60"></div>

                {/* Center square */}
                <div className="relative z-10 w-40 h-40 bg-white rounded"></div>
            </div>

            {/* Welcome text */}
            <div className="absolute bottom-[25%] text-center">
                <p className="text-5xl text-white">
                    Welcome, <span className="font-bold">Justine.</span>
                </p>
            </div>
        </div>
    );
};

export default WelcomePage;
