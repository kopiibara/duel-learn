import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "/context/userContext"; // Fixed import path
import { Toaster } from "react-hot-toast";
import Login from "./pages/login/Login";
import SignUp from "./pages/login/SignUp";
import ForgotPass from "./pages/login/ForgotPass";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Home from "./pages/dashboard/Home";
import Explore from "./pages/dashboard/Explore";
import YourLibrary from "./pages/dashboard/YourLibrary";
import Profile from "./pages/dashboard/Profile";
import Shop from "./pages/dashboard/Shop";
import PrivateRoute from "./PrivateRoute"; // Private Route wrapper
import NotFound from "./pages/login/NotFoundPage"; // Not Found component
import "./index.css";
import ConfirmationAccount from "./pages/login/ConfirmationAccount";
import SecurityCode from "./pages/login/SecurityCode";
import ResetPassword from "./pages/login/ResetPassword";
import SuccessReset from "./pages/login/SuccessReset";
import WelcomePage from "./pages/dashboard/WelcomePage";

// Set Axios defaults
axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={<Login />}
          />
          <Route
            path="/sign-up"
            element={<SignUp />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPass />}
          />
          <Route
            path="/confirmation-account"
            element={<ConfirmationAccount />}
          />
          <Route
            path="/security-code"
            element={<SecurityCode />}
          />
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />
          <Route
            path="/success-reset-password"
            element={<SuccessReset />}
          />
          <Route
            path="/welcome-page"
            element={<WelcomePage />}
          />

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route
              path="/dashboard/*"
              element={
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 p-7 h-screen overflow-auto">
                    <Routes>
                      {/* Default Route */}
                      <Route index element={<Navigate to="home" replace />} />
                      {/* Nested Routes */}
                      <Route path="home" element={<Home />} />
                      <Route path="explore" element={<Explore />} />
                      <Route path="your-library" element={<YourLibrary />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="shop" element={<Shop />} />
                      {/* Catch-All Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </div>
              }
            />
          </Route>

          {/* Catch-All Route for Public Paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
      </Router>
    </UserProvider>
  );
}

export default App;
