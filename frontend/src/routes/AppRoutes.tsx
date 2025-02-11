import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PrivateRoutes from "./PrivateRoutes";
import LandingPage from "../pages/landing-page/LandingPage";
import Login from "../pages/user-account/Login";
import SignUp from "../pages/user-account/SignUp";
import ForgotPassword from "../pages/user-account/ForgotPassword";
import ConfirmationAccount from "../pages/user-account/ConfirmationAccount";
import NotFoundPage from "../pages/user-account/NotFoundPage";
import ResetPassword from "../pages/user-account/ResetPassword";
import SuccessReset from "../pages/user-account/SuccessReset";
import SecurityCode from "../pages/user-account/SecurityCode";

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
        <Route path="/confirmation-account" element={<ConfirmationAccount />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/success-reset" element={<SuccessReset />} />
        <Route path="/security-code" element={<SecurityCode />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/dashboard/*" element={<PrivateRoutes />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
