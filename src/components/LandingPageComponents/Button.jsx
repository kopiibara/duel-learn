import React from "react";
import "./LandingPageStyles.css";

const Button = ({ variant, text, onClick }) => {
  return (
    <div className={variant === "Primary" ? "button-primary" : "button-secondary"} onClick={onClick}>
      <div className={variant === "Primary" ? "button-text-primary" : "button-text-secondary"}>
        {text}
      </div>
    </div>
  );
};

export default Button;