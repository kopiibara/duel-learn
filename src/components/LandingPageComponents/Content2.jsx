import React from "react";
import "./LandingPageStyles.css";

const Content2Container = ({ children }) => {
    return (
    <div className="content2-container">
      <div className="square-graphic" />
      <div className="content2-style">
        {children}
        <div className="text-title">
          Introducing Duel-Learn
        </div>
            <div className="text-paragraph">
            <span className="text-paragraph-bold">
                Learning doesn’t have to feel like schoolwork.
            </span>
            <span>
                {" "}With our magical, gamified platform, you can study in a world of adventure—
            </span>
            <span className="text-paragraph-italic">
                using AI and OCR
            </span>
            <span>
                {" "}to make creating study materials fast and effortless. <br /><br />
                We’re here to turn challenges into quests and keep you motivated with every spell you cast on your path to mastery!
            </span>
            </div>
        </div>
    </div>
  );
};

export default Content2Container;