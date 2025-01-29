import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "../contexts/UserContext";

import PrivateRoutes from "./PrivateRoutes";
import WelcomePage from "../pages/Useronboarding/WelcomePage";
import TutorialOnePage from "../pages/Useronboarding/TutorialOne";
import TutorialTwo from "../pages/Useronboarding/TutorialTwo";
import Personalization from "../pages/Useronboarding/Personalization";
import LandingPage from "../pages/landing-page/LandingPage";
import Login from "../pages/user-account/Login";
import SignUp from "../pages/user-account/SignUp";
import ForgotPassword from "../pages/user-account/ForgotPassword";

const AppRoutes: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing-page" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          //* dito muna route ng useronboarding
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/tutorial/step-one" element={<TutorialOnePage />} />
          <Route path="/tutorial/step-two" element={<TutorialTwo />} />
          <Route path="/my-preferences" element={<Personalization />} />
          <Route path="/dashboard/*" element={<PrivateRoutes />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default AppRoutes;
