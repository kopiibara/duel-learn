import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "../contexts/UserContext";
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
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing-page" element={<LandingPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
          //* dito muna route ng useronboarding
          <Route path="/dashboard/*" element={<PrivateRoutes />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default AppRoutes;
