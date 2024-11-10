import React from "react";
import "./LandingPageStyles.css";
import Button from "./Button";

const Content1Container = ({ children }) => {
    const handleGetStartedClick = () => {
        // Add your logic for the "GET STARTED" button click here
        console.log("GET STARTED button clicked");
      };
    
      const handleAlreadyHaveAccountClick = () => {
        // Add your logic for the "ALREADY HAVE AN ACCOUNT" button click here
        console.log("ALREADY HAVE AN ACCOUNT button clicked");
      };
  return (
    <div className="content1-container">
      <div className="graphics-left" />
        <div className="content-style">
            {children}
            <div className="title-container">
            <div className="text-large-bold">
                Unlock the<br />Magic of Learning!
            </div>
            <div className="text-medium">
                Master your studies with powerful tools and gamified study modes.
            </div>
            </div>
            <div className="button-container">
            <Button variant="Primary" text="GET STARTED" onClick={handleGetStartedClick} />
            <Button variant="Secondary" text="ALREADY HAVE AN ACCOUNT" onClick={handleAlreadyHaveAccountClick} />
            </div>
        </div>
      <div className="graphics-right" />
    </div>
  );
};

export default Content1Container;