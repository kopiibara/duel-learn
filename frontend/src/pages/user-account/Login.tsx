import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../index.css";
import { useUser } from "../../contexts/UserContext";
import { toast } from "react-hot-toast";

import axios from "axios";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../services/firebase"; // Ensure you have this import for Firebase auth
// Icons
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

const Login = () => {
  const { setUser } = useUser();
  const [data, setData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [error, setError] = useState(""); // State for handling errors
  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log(result);
      const token = await result.user.getIdToken();

      // Handle user data directly on the frontend
      const userData = {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        uid: result.user.uid,
      };
      console.log("User Data:", userData);

      // Store user data in context
      setUser(userData);

      // Optionally, you can store the token in local storage or context
      localStorage.setItem("userToken", token);

      // Redirect to a protected route or dashboard
      navigate("/dashboard/home");
    } catch (error) {
      console.error("Error during sign-in:", error);
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { username, password } = data;

    try {
      const result = await signInWithEmailAndPassword(auth, username, password);
      console.log("User Credential:", result);
      const token = await result.user.getIdToken();

      // Create user data object
      const userData = {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        uid: result.user.uid,
      };
      console.log("User Data:", userData);
      // Store user data in context
      setUser(userData);

      // Optionally, you can store the token in local storage or context
      localStorage.setItem("userToken", token);
      setData({ username: "", password: "" });
      navigate("/dashboard/home"); // Redirect on successful login
    } catch (error) {
      console.error("Login error:", error); // Handle login error
      setError((error as any).message); // Set error message
      console.error("Login error:", error); // Handle login error
      setError((error as any).message); // Set error message
    }
  };

  return (
    <div className="h-screen flex items-center justify-center ">
      <div className="w-full max-w-md  rounded-lg p-8 shadow-md">
        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-white mb-2">
          Login your Account
        </h1>
        <p className="text-sm text-center text-[#9F9BAE] mb-8">
          Please enter your details to login.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="sr-only">
              Username or Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={data.username}
              onChange={(e) => setData({ ...data, username: e.target.value })}
              placeholder="Enter your username or email"
              required
              className="w-full bg-[#3B354D] text-[#E2DDF3] placeholder-[#9F9BAE] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              placeholder="Enter your password"
              required
              className="w-full bg-[#3B354D] text-[#E2DDF3] placeholder-[#9F9BAE] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
            />
            <span
              onClick={togglePassword}
              className="absolute right-3 top-3 text-[#9F9BAE] cursor-pointer"
            >
              {showPassword ? (
                <VisibilityRoundedIcon />
              ) : (
                <VisibilityOffRoundedIcon />
              )}
            </span>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-[#9F9BAE] hover:text-[#E2DDF3]"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-[#3B354D]"></div>
          <span className="text-sm text-[#9F9BAE] mx-3">or</span>
          <div className="flex-grow border-t border-[#3B354D]"></div>
        </div>

        {/* Google Sign-In */}
        <button
          className="w-full border border-[#4D18E8] bg-[#0F0A18] text-white py-3 rounded-lg flex items-center justify-center hover:bg-[#1A1426] transition-colors"
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-[#9F9BAE] mt-6">
          Don’t have an account?{" "}
          <Link to="/sign-up" className="text-[#4D18E8] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
