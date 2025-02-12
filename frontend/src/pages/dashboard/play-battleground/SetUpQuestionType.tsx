import React from "react";
import "./styles/setupques.css";
import malupiton from "./malupiton.jpg";

const SetUpQuestionType: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="paper-container">
        {/* Top Scroll Holder + Rod (Now Touching the Paper) */}
        <div className="scroll-wrapper">
          <div className="scroll-holder"></div>
          <div className="scroll-bar"></div>
          <div className="scroll-holder"></div>
        </div>

        <div className="paper flex justify-center items-center">
          {/* Image inside the paper, centered */}
          <img src={malupiton} alt="Malupiton" className="max-w-[90%] max-h-[90%] object-contain image" />
        </div>

        {/* Bottom Scroll Holder + Rod (Now Touching the Paper) */}
        <div className="scroll-wrapper">
          <div className="scroll-holder"></div>
          <div className="scroll-bar"></div>
          <div className="scroll-holder"></div>
        </div>
      </div>
    </div>
  );
};

export default SetUpQuestionType;
