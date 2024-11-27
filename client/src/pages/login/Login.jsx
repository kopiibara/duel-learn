import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../index.css";
import googleIcon from "../../assets/images/googleIcon.png";
import axios from "axios";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

const Login = () => {
  const [data, setData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState({ general: "" }); // For general errors
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { username, password } = data;
    let formIsValid = true;
    let newErrors = { username: "", password: "" };

    // Validation for empty fields
    if (!username) {
      newErrors.username = "Username is required.";
      formIsValid = false;
    }
    if (!password) {
      newErrors.password = "Password is required.";
      formIsValid = false;
    }

    // If form is not valid, set errors and stop form submission
    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }

    try {
      const { data: response } = await axios.post(
        "/login",
        { username, password },
        { withCredentials: true } // Include credentials in the request
      );

      if (response.error) {
        // Set general error if credentials do not match
        setError({ general: "Invalid input. Please check your credentials." });
      } else {
        setData({}); // Clear data
        setError({ general: "" }); // Reset general error on success
        navigate("/dashboard"); // Redirect on success
      }
    } catch (error) {
      setError({ general: "Server error. Please try again later." }); // Handle server error
      console.error("Server error:", error); // Handle server error
    }
  };

  const handleInputChange = (field, value) => {
    // Reset the individual error as the user types
    setData((prevData) => ({ ...prevData, [field]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
    setError({ general: "" }); // Clear general error when user starts typing
  };

  return (
    <div className="h-screen flex items-center justify-center ">
      <div className="w-full max-w-md rounded-lg p-8 shadow-md">
        {/* Heading */}
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          Login your Account
        </h1>
        <p className="text-lg text-center text-[#9F9BAE] mb-8">
          Please enter your details to login.
        </p>

        {/* Error Message Box */}
        {error.general && (
          <div className="w-full max-w-sm mb-4 px-4 py-2 bg-red-100 text-red-600 rounded-md border border-red-300">
            {error.general}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="mt-0 mb-0">
            <TextField
              id="filled-basic"
              label="Enter your username or email"
              variant="filled"
              type="text"
              value={data.username}
              autoComplete="off"
              onChange={(e) => handleInputChange("username", e.target.value)}
              sx={{
                width: "100%",
                backgroundColor: "#3B354D",
                color: "#E2DDF3",
                marginBottom: "16px",
                borderRadius: "8px",
                "& .MuiInputBase-root": {
                  color: "#E2DDF3",
                  backgroundColor: "#3B354D",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#3B354D",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "#3B354D",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#E2DDF3",
                },
                "& .MuiInput-underline:before": {
                  borderBottomColor: "#9F9BAE",
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: "#4D18E8",
                },
                "&:focus-within": {
                  outline: "none",
                  boxShadow: "0 0 0 2px #4D18E8",
                },
                "& input::placeholder": {
                  color: "#E2DDF3", // Keep placeholder color consistent
                  opacity: 1,      // Ensure it remains visible
                },
              }}
              error={!!errors.username} // Show error style when there's an error
            />
            {/* Error message for username */}
            {errors.username && (
              <div className="text-red-500 text-sm mt-[-9px] mb-4">{errors.username}</div>
            )}
          </div>
          {/* Password Input */}
          <div className="">
            <TextField
              id="filled-basic"
              label="Enter your password"
              variant="filled"
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              fullWidth
              sx={{
                backgroundColor: "#3B354D",
                color: "#E2DDF3",
                borderRadius: "8px",
                marginBottom: "10px",
                "& .MuiInputBase-root": {
                  color: "#E2DDF3", // Text color
                  backgroundColor: "#3B354D", // Background color
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#3B354D", // Keep the same background color on hover
                  },
                  "&.Mui-focused": {
                    backgroundColor: "#3B354D", // Keep the background color when focused
                  },
                },
                "& .MuiInputLabel-root": {
                  color: errors.password ? "red" : "#9F9BAE", // Label color turns red if there's an error
                },
                "& .MuiInput-underline:before": {
                  borderBottomColor: errors.password ? "red" : "#9F9BAE", // Initial border color
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: errors.password ? "red" : "#4D18E8", // Border color when focused
                },
                "&:focus-within": {
                  outline: "none",
                  boxShadow: "0 0 0 2px #4D18E8", // Focus ring when the input is focused
                },
                "& input::placeholder": {
                  color: errors.password ? "red" : "#9F9BAE", // Placeholder turns red when error exists
                  opacity: 1,
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePassword}
                        sx={{
                          color: "#9F9BAE",
                          paddingRight: "18px", // Add padding to the right side
                        }}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityRoundedIcon />
                        ) : (
                          <VisibilityOffRoundedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              error={!!errors.password} // Show error style when there's an error
            />
            {/* Error message for password */}
            {errors.password && (
              <div className="text-red-500 text-sm mt-[-1px] mb-2">{errors.password}</div>
            )}
          </div>


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
            className="w-full mt-7 bg-[#4D18E8] text-white py-3 rounded-lg hover:bg-[#6931E0] transition-colors"
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
        <button className="w-full border border-[#4D18E8] bg-[#0F0A18] text-white py-3 rounded-lg flex items-center justify-center hover:bg-[#1A1426] transition-colors">
          <img src={googleIcon} alt="Google Icon" className="w-10 mr-2" />
          Sign in with Google
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-[#9F9BAE] mt-6">
          Don’t have an account?{" "}
          <Link to="/sign-up" className="text-[#ffffff] font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
