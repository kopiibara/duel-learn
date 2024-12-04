import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../index.css";
import googleIcon from "../../assets/images/googleIcon.png";
import axios from "axios";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ExitIcon from '../../assets/images/Exit.png';

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
        navigate("/dashboard/home"); // Redirect on success
      }
    } catch (error) {
      setError({ general: "Server error. Please try again later." }); // Handle server error
      console.error("Server error:", error); // Handle server error
    }
  };

  const handleInputChange = (field, value) => {
    // Update the input value
    setData((prevData) => ({ ...prevData, [field]: value }));

    // Only reset the specific field's error
    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));

    // Clear the general error when typing in either field
    setError({ general: "" });
  };



  return (
    <div className="h-screen flex flex-col items-center justify-center ">
      <div className="w-[430px] sm:w-[500px] md:w-[700px] lg:w-[800px] pb-6 text-right flex justify-end">
        <img
          src={ExitIcon}
          alt=""
          style={{ width: '39px' }}
          className="hover:scale-110 cursor-pointer"
        />
      </div>

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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Validate the username only when Enter is pressed
                  if (!data.username) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      username: "Username is required.", // Set error if username is empty
                    }));
                    e.preventDefault(); // Prevent focus shift and form submission
                  } else {
                    // If no errors, move focus to the password field
                    document.getElementById("password-field").focus();
                  }
                }
              }}
              error={!!errors.username} // This ensures error styling is applied when there's an error
              sx={{
                width: '100%',
                backgroundColor: '#3B354D',
                color: '#E2DDF3',
                marginBottom: '14px',
                borderRadius: '8px',
                '& .MuiInputBase-root': {
                  color: '#E2DDF3', // Text color
                  backgroundColor: '#3B354D', // Background color
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#3B354D', // Keep the same background color on hover
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#3B354D', // Keep the background color when focused
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#9F9BAE', // Label color
                },
                '& .MuiInput-underline:before': {
                  borderBottomColor: '#9F9BAE', // Initial border color
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#4D18E8', // Border color when focused
                },
                // Conditionally apply red border when there's an error
                '& .MuiFilledInput-root': {
                  borderColor: errors.username ? 'red' : '#9F9BAE', // Red border when error
                  '&:hover': {
                    borderColor: errors.username ? 'red' : '#9F9BAE', // Hover color when there's an error
                  },
                },
              }}
            />


            {/* Error message for username */}
            {errors.username && (
              <div className="text-red-500 text-sm mt-[-9px] mb-4">{errors.username}</div>
            )}
          </div>
          {/* Password Input */}
          <div className="">
            <TextField
              id="password-field"
              label="Enter your password"
              variant="filled"
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(e); // Submit form when Enter is pressed in password field
                }
              }}
              fullWidth
              sx={{
                width: '100%',
                backgroundColor: '#3B354D', // Maintain background color even when focused
                color: '#E2DDF3',
                marginBottom: '14px',
                borderRadius: '8px',
                '& .MuiInputBase-root': {
                  color: '#E2DDF3', // Text color
                  backgroundColor: '#3B354D', // Background color
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#3B354D', // Keep the same background color on hover
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#3B354D', // Keep the background color when focused
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#9F9BAE', // Label color
                },
                '& .MuiInput-underline:before': {
                  borderBottomColor: '#9F9BAE', // Initial border color
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#4D18E8', // Border color when focused
                },
                '&:focus-within': {
                  outline: 'none',
                  boxShadow: '0 0 0 2px #4D18E8', // Focus ring when the input is focused
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
