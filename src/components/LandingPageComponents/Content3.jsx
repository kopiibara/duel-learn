import React from "react";
import "./LandingPageStyles.css";
import Book from "../Assets/LandingPageAssets/Book.svg";

const Content3Container = ({ children }) => {
  return (
    <div className="content3-container">
      <div className="text-large-bold">
        OUR QUEST
      </div>
      {children}
      <div className="book-container">
        <img src={Book} alt="Quest Book" className="book-image" />
        <div className="book-page-container">
          <div className="leftpage">
            <div className="text-paragraph">
              "To transform learning into an engaging journey by blending the excitement of gamification with powerful tools for building knowledge. We aim to make studying intuitive, efficient, and enjoyable—empowering every learner to unlock their full potential."
            </div>
          </div>
          <div className="rightpage">
            <div className="text-paragraph">
              "To transform learning into an engaging journey by blending the excitement of gamification with powerful tools for building knowledge. We aim to make studying intuitive, efficient, and enjoyable—empowering every learner to unlock their full potential."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content3Container;