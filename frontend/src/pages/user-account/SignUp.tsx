import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import axios from "axios";
import { toast } from "react-hot-toast";
import { auth, googleProvider } from "../../services/firebase";
import { signInWithPopup } from "firebase/auth";
import "../../index.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    passwordError: "",
    confirmPasswordError: "",
  });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormData((prev) => ({
      ...prev,
      passwordError: "",
      confirmPasswordError: "",
    }));
    const { username, password, confirmPassword, email } = formData;

    // Basic validation (Password requirements)
    if (password !== confirmPassword) {
      setFormData((prev) => ({
        ...prev,
        confirmPasswordError: "Passwords do not match.",
      }));
      return;
    }

    try {
      const response = await axios.post("/sign-up", {
        username,
        password,
        email,
      });
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          email: "",
          passwordError: "",
          confirmPasswordError: "",
        });
        toast.success("Register Successful. Welcome!");
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log(result);
      const token = await result.user.getIdToken();

      const response = await fetch("http://localhost:8000/api/protected", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      const userData = await response.json();
      console.log("User Data:", userData);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };
  return (
    <div className=" font-aribau min-h-screen flex items-center justify-center">
      <div className=" p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-[#E2DDF3]">
          Create an Account
        </h1>
        <p className="text-sm mb-8 text-center text-[#9F9BAE]">
          Please enter your details to sign up.
        </p>
        <form onSubmit={validateForm}>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            required
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="block w-full p-3 mb-4 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="block w-full p-3 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
            />
            <span
              onClick={togglePassword}
              className="absolute top-3 right-3 text-[#9F9BAE] cursor-pointer"
            >
              {showPassword ? (
                <VisibilityRoundedIcon />
              ) : (
                <VisibilityOffRoundedIcon />
              )}
            </span>
            {formData.passwordError && (
              <p className="text-red-500 mt-1 text-sm">
                {formData.passwordError}
              </p>
            )}
          </div>

          <div className="relative mb-4">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="block w-full p-3 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
            />
            {formData.confirmPasswordError && (
              <p className="text-red-500 mt-1 text-sm">
                {formData.confirmPasswordError}
              </p>
            )}
          </div>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="block w-full p-3 mb-6 rounded-lg bg-[#3B354D] text-[#9F9BAE] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4D18E8]"
          />

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 text-[#4D18E8] bg-[#3B354D] border-gray-300 rounded focus:ring-2 focus:ring-[#4D18E8]"
            />
            <label htmlFor="terms" className="ml-2 text-[#9F9BAE] text-sm">
              I agree to{" "}
              <a
                href="#"
                className="text-[#4D18E8] underline hover:text-[#4D18E8]"
              >
                Terms and Conditions
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white bg-[#4D18E8] rounded-lg hover:bg-[#3814b6] focus:outline-none focus:ring-4 focus:ring-[#4D18E8]"
          >
            Create Account
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-[#9F9BAE]" />
          <span className="mx-2 text-[#9F9BAE]">or</span>
          <hr className="flex-grow border-t border-[#9F9BAE]" />
        </div>

        {/* Google Sign-In */}
        <button
          className="w-full border border-[#4D18E8] bg-[#0F0A18] text-white py-3 rounded-lg flex items-center justify-center hover:bg-[#1A1426] transition-colors"
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </button>

        <p className="mt-4 text-center text-sm text-[#9F9BAE]">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-[#4D18E8] hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
