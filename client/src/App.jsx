import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "/context/userContext";
import { Toaster } from "react-hot-toast";
import Login from "./pages/login/Login";
import SignUp from "./pages/login/SignUp";
import Welcome from "./pages/login/Welcome";
import ForgotPass from "./pages/login/ForgotPass";
import Dashboard from "./pages/Dashboard";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import YourLibrary from "./pages/YourLibrary";
import Profile from "./pages/Profile";
import Shop from "./pages/Shop";
import "./index.css";

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="flex">
          <Routes>
            <Route
              path="/login"
              element={
                <>
                  <div className="flex-1 p-7 h-screen overflow-auto">
                    <Login />
                  </div>
                </>
              }
            />
            <Route
              path="/sign-up"
              element={
                <>
                  <div className="flex-1 p-7 h-screen overflow-auto">
                    <SignUp />
                  </div>
                </>
              }
            />
            <Route
              path="/welcome"
              element={
                <>
                  <div className="flex-1 p-7 h-screen overflow-auto">
                    <Welcome />
                  </div>
                </>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <>
                  <div className="flex-1 p-7 h-screen overflow-auto">
                    <ForgotPass />
                  </div>
                </>
              }
            />
            <Route
              path="*"
              element={
                <>
                  <Sidebar />
                  <div className="flex-1 p-7 h-screen overflow-auto">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                      />
                      <Route path="/home" element={<Home />} />
                      <Route path="/explore" element={<Explore />} />
                      <Route path="/your-library" element={<YourLibrary />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/shop" element={<Shop />} />
                    </Routes>
                  </div>
                </>
              }
            />
          </Routes>
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{ duration: 2000 }}
          />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
