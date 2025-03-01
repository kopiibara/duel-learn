import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PrivateRoutes from "./PrivateRoutes";
import LandingPage from "../pages/landing-page/LandingPage";
import Login from "../pages/user-account/Login";
import SignUp from "../pages/user-account/SignUp";
import ForgotPassword from "../pages/user-account/ForgotPassword";
import TermsAndConditions from "../components/TermsAndConditions";
import PrivacyPolicy from "../components/PrivacyPolicy";
import AccountSettings from "../pages/user-account/AccountSettings";
import CheckYourMail from "../pages/user-account/CheckYourMail";
import PasswordChangedSuccessfully from "../pages/user-account/PasswordChangedSuccessfully";
import ConfirmationAccount from "../pages/user-account/ConfirmationAccount";
import NotFoundPage from "../pages/user-account/NotFoundPage";
import ResetPassword from "../pages/user-account/ResetPassword";
import SuccessReset from "../pages/user-account/SuccessReset";
import Personalization from "../pages/user-onboarding/Personalization";
import TutorialLast from "../pages/user-onboarding/TutorialLast";
import TutorialSix from "../pages/user-onboarding/TutorialSix";
import TutorialFive from "../pages/user-onboarding/TutorialFive";
import TutorialThree from "../pages/user-onboarding/TutorialThree";
import TutorialFour from "../pages/user-onboarding/TutorialFour";
import TutorialTwo from "../pages/user-onboarding/TutorialTwo";
import TutorialOnePage from "../pages/user-onboarding/TutorialOne";
import WelcomePage from "../pages/user-onboarding/WelcomePage";
import EmailActionHandler from "../pages/user-account/EmailActionHandler"; // Import EmailActionHandler
import EmailVerified from "../pages/user-account/EmailVerified"; // Import EmailVerified
import LoadingScreen from "../components/LoadingScreen";

const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/check-your-mail" element={<CheckYourMail />} />
        <Route path="/loading-screen" element={<LoadingScreen />} />
        <Route path="/password-changed-successfully" element={<PasswordChangedSuccessfully />} />

      
        <Route path="/confirmation-account" element={<ConfirmationAccount />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/success-reset" element={<SuccessReset />} />
        <Route path="/email-action" element={<EmailActionHandler />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route path="/dashboard/*" element={<PrivateRoutes />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
