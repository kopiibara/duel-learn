import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import googleIcon from "../../assets/images/googleIcon.png";
import axios from "axios";
import { toast } from "react-hot-toast";
import { TextField, InputAdornment, IconButton } from "@mui/material"
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };
  
  const validateForm = async (event) => {
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
        navigate("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="font-aribau min-h-screen flex items-center justify-center">
      <div className="p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2 text-center text-[#E2DDF3]">
          Create an Account
        </h1>
        <p className="text-lg mb-8 text-center text-[#9F9BAE]">
          Please enter your details to sign up.
        </p>
        <form onSubmit={validateForm}>
          <TextField
            id="username"
            label="Enter your username"
            variant="filled"
            type="text"
            value={formData.username}
            autoComplete="off"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
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
          />

          <TextField
            id="email"
            label="Enter your email"
            variant="filled"
            type="email"
            value={formData.email}
            autoComplete="off"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
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
          />

          <div className="relative ">
            <TextField
              id="password"
              label="Enter your password"
              variant="filled"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              autoComplete="off"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
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
                          color: '#9F9BAE',
                          paddingRight: '18px', // Add padding to the right side
                        }}
                        edge="end"
                      >
                        {showPassword ? <VisibilityRoundedIcon /> : <VisibilityOffRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {formData.passwordError && (
              <p className="text-red-500 mt-1 text-sm">
                {formData.passwordError}
              </p>
            )}
          </div>

          <div className="relative">
            <TextField
              id="confirmPassword"
              label="Confirm your password"
              variant="filled"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="off"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              fullWidth
              sx={{
                width: '100%',
                backgroundColor: '#3B354D',
                color: '#E2DDF3',
                marginBottom: '27px',
                borderRadius: '8px',
                '& .MuiInputBase-root': {
                  color: '#E2DDF3',
                  backgroundColor: '#3B354D',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#3B354D',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#3B354D',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#9F9BAE',
                },
                '& .MuiInput-underline:before': {
                  borderBottomColor: '#9F9BAE',
                },
                '& .MuiInput-underline:after': {
                  borderBottomColor: '#4D18E8',
                },
                '&:focus-within': {
                  outline: 'none',
                  boxShadow: '0 0 0 2px #4D18E8',
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleConfirmPassword}
                        sx={{
                          color: '#9F9BAE',
                          paddingRight: '18px',
                        }}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityRoundedIcon />
                        ) : (
                          <VisibilityOffRoundedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {formData.confirmPasswordError && (
              <p className="text-red-500 mt-1 text-sm">
                {formData.confirmPasswordError}
              </p>
            )}
          </div>


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

        <div className="flex items-center my-5">
          <hr className="flex-grow border-t border-[#9F9BAE]" />
          <span className="mx-2 text-[#9F9BAE]">or</span>
          <hr className="flex-grow border-t border-[#9F9BAE]" />
        </div>

        {/* Google Sign-In */}
        <button className="w-full border border-[#4D18E8] bg-[#0F0A18] text-white py-3 rounded-lg flex items-center justify-center hover:bg-[#1A1426] transition-colors">
          <img src={googleIcon} alt="Google Icon" className="w-10  mr-2" />
          Sign in with Google
        </button>

        <p className="mt-7 text-center text-sm text-[#9F9BAE]">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/")}
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
