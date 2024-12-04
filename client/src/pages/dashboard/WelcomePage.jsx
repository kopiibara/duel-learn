import React from "react";

const WelcomePage = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-[#080511]">
            {/* Animated circles */}
            <div className="relative flex items-center justify-center">
                {/* Largest Circle */}
                <div className="absolute w-[1600px] h-[1600px] bg-[#A38CE6] rounded-full slow-pulse opacity-20 sm:w-[1200px] sm:h-[1200px] md:w-[1400px] md:h-[1400px]"></div>
                {/* Second Largest Circle */}
                <div className="absolute w-[1400px] h-[1400px] bg-[#A38CE6] rounded-full slow-pulse opacity-25 sm:w-[1000px] sm:h-[1000px] md:w-[1200px] md:h-[1200px]"></div>
                {/* Third Largest Circle */}
                <div className="absolute w-[1200px] h-[1200px] bg-[#A38CE6] rounded-full slow-pulse opacity-30 sm:w-[800px] sm:h-[800px] md:w-[1000px] md:h-[1000px]"></div>
                {/* Fourth Largest Circle */}
                <div className="absolute w-[1000px] h-[1000px] bg-[#A38CE6] rounded-full slow-pulse opacity-40 sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px]"></div>
                {/* Fifth Largest Circle */}
                <div className="absolute w-[800px] h-[800px] bg-[#A38CE6] rounded-full slow-pulse opacity-50 sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px]"></div>
                {/* Sixth Circle */}
                <div className="absolute w-[600px] h-[600px] bg-[#A38CE6] rounded-full slow-pulse opacity-60 sm:w-[300px] sm:h-[300px] md:w-[500px] md:h-[500px]"></div>

                {/* Center square */}
                <div className="relative z-10 w-40 h-40 bg-white rounded"></div>
            </div>

            {/* Welcome text */}
            <div className="absolute bottom-[25%] text-center w-full">
                <p className="text-3xl sm:text-4xl md:text-5xl text-white">
                    Welcome, <span className="font-bold">Justine.</span>
                </p>
            </div>
        </div>
    );
};

export default WelcomePage;
