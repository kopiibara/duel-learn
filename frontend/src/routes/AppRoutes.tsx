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
import ConfirmationAccount from "../pages/user-account/ConfirmationAccount";
import NotFoundPage from "../pages/user-account/NotFoundPage";
import ResetPassword from "../pages/user-account/ResetPassword";
import SuccessReset from "../pages/user-account/SuccessReset";
import SecurityCode from "../pages/user-account/SecurityCode";
import TutorialThree from "../pages/Useronboarding/TutorialThree";
import TutorialFour from "../pages/Useronboarding/TutorialFour";
import TutorialFive from "../pages/Useronboarding/TutorialFive";
import TutorialSix from "../pages/Useronboarding/TutorialSix";
import TutorialLast from "../pages/Useronboarding/TutorialLast";
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
          <Route
            path="/confirmation-account"
            element={<ConfirmationAccount />}
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/success-reset" element={<SuccessReset />} />
          <Route path="/security-code" element={<SecurityCode />} />
          <Route path="*" element={<NotFoundPage />} />
          //* dito muna route ng useronboarding
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
    </UserProvider>
  );
};

export default AppRoutes;
