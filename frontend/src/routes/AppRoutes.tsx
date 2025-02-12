import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PrivateRoutes from "./PrivateRoutes";
import WelcomePage from "../pages/Useronboarding/WelcomePage";
import TutorialOnePage from "../pages/Useronboarding/TutorialOne";
import TutorialTwo from "../pages/Useronboarding/TutorialTwo";
import TutorialThree from "../pages/Useronboarding/TutorialThree";
import TutorialFour from "../pages/Useronboarding/TutorialFour";
import TutorialFive from "../pages/Useronboarding/TutorialFive";
import TutorialSix from "../pages/Useronboarding/TutorialSix";
import TutorialLast from "../pages/Useronboarding/TutorialLast";

import Personalization from "../pages/Useronboarding/Personalization";
import LandingPage from "../pages/landing-page/LandingPage";
import Login from "../pages/user-account/Login";
import SignUp from "../pages/user-account/SignUp";
import ForgotPassword from "../pages/user-account/ForgotPassword";
import TermsAndConditions from "../components/TermsAndConditions";
import CheckYourMail from "../pages/user-account/CheckYourMail";
import LoadingScreen from "../components/LoadingScreen";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/check-your-mail" element={<CheckYourMail />} />
        <Route path="/loading-screen" element={<LoadingScreen />} />

        {/* User onboarding routes */}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/tutorial/step-one" element={<TutorialOnePage />} />
        <Route path="/tutorial/step-two" element={<TutorialTwo />} />
        <Route path="/tutorial/step-three" element={<TutorialThree />} />
        <Route path="/tutorial/step-four" element={<TutorialFour />} />
        <Route path="/tutorial/step-five" element={<TutorialFive />} />
        <Route path="/tutorial/step-six" element={<TutorialSix />} />
        <Route path="/tutorial/step-seven" element={<TutorialLast />} />
        <Route path="/my-preferences" element={<Personalization />} />

        <Route path="/dashboard/*" element={<PrivateRoutes />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;