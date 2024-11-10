import React from "react";
import "./LandingPageStyles.css";
import icon from "../Assets/LandingPageAssets/icon.svg";
import CardFeature from "./CardFeature";

const Content4Container = ({ children }) => {
  return (
    <div className="content4-container">
      {children}
      <div className="content4-paragraph-container">
            <div className="text-title">
              Discover Our Features
            </div>
            <div className="text-paragraph" style={{ textAlign: "center" }}>
            Create or generate content effortlessly and explore multiple interactive modes designed to enhance engagement and improve your experience.
            </div>
        </div>
        <div className="CardFeature-container">
        <CardFeature 
                icon={<img src={icon} alt="" />}
                title="Content Creation & Generation"
                content="Create or auto-generate flashcards from notes."
        />
        <CardFeature 
                icon={<img src={icon} alt="" />}
                title="Interactive Study Modes"
                content="Single-player and multiplayer flashcard battles"
        />
        <CardFeature 
                icon={<img src={icon} alt="" />}
                title="AI-Powered Learning"
                content="Enhance flashcards with AI and cross-referencing"
        />
        <CardFeature 
                icon={<img src={icon} alt="" />}
                title="Content Creation & Generation"
                content="Create or auto-generate flashcards from notes."
        />
        <CardFeature 
                icon={<img src={icon} alt="" />}
                title="Interactive Study Modes"
                content="Single-player and multiplayer flashcard battles"
        />
        <CardFeature 
                icon={<img src={icon} alt="" />}
                title="Study Modes"
                content="Single-player and multiplayer flashcard battles"
        />
      </div>
    </div>
  );
};

export default Content4Container;