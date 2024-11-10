import React from "react";
import "../index.css";
import Content1 from "../components/LandingPageComponents/Content1";
import Content2 from "../components/LandingPageComponents/Content2";
import Content3 from "../components/LandingPageComponents/Content3";
import Content4 from "../components/LandingPageComponents/Content4";
import Logo from "../components/Assets/LandingPageAssets/DuelLearnLogo.svg";

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      <img src={Logo} alt="Duel Learn Logo" />
      <Content1 />
      <Content2 />
      <Content3 />
      <Content4 />
    </div>
  );
};

export default LandingPage;