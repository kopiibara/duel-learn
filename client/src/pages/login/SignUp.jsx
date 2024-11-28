import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import googleIcon from "../../assets/images/googleIcon.png";
import axios from "axios";
import { TextField, InputAdornment, IconButton } from "@mui/material"
import "../../index.css";
import ExitIcon from '../../assets/images/Exit.png';


const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    terms: false, // Add this to track the checkbox status
    passwordError: "",
    confirmPasswordError: "",
    usernameError: "",
    emailError: "",
    termsError: "", // Add this to track terms and conditions error
  });


  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");  // Add state for success message


  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const validateForm = async (event) => {
    event.preventDefault(); // Prevent form submission by default
    setFormData((prev) => ({
      ...prev,
      passwordError: "",
      confirmPasswordError: "",
      usernameError: "",
      emailError: "",
      termsError: "", // Reset the terms error
    }));

    const { username, password, confirmPassword, email, terms } = formData;

    let hasError = false;

    // Username validation
    if (!username) {
      setFormData((prev) => ({ ...prev, usernameError: "Username is required." }));
      hasError = true;
    } else if (username.length < 3) {
      setFormData((prev) => ({ ...prev, usernameError: "Username must be at least 3 characters." }));
      hasError = true;
    } else if (username.length > 20) {
      setFormData((prev) => ({ ...prev, usernameError: "Username cannot exceed 20 characters." }));
      hasError = true;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setFormData((prev) => ({ ...prev, usernameError: "Username can only contain alphanumeric characters and underscores." }));
      hasError = true;
    }

    // Email validation
    if (!email) {
      setFormData((prev) => ({ ...prev, emailError: "Email is required." }));
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setFormData((prev) => ({ ...prev, emailError: "Please enter a valid email address." }));
      hasError = true;
    }

    // Password validation
    if (!password) {
      setFormData((prev) => ({ ...prev, passwordError: "Password is required." }));
      hasError = true;
    } else if (password.length < 8) {
      setFormData((prev) => ({ ...prev, passwordError: "Password must be at least 8 characters." }));
      hasError = true;
    } else if (!/[A-Z]/.test(password)) {
      setFormData((prev) => ({ ...prev, passwordError: "Password must contain at least one uppercase letter." }));
      hasError = true;
    } else if (!/[a-z]/.test(password)) {
      setFormData((prev) => ({ ...prev, passwordError: "Password must contain at least one lowercase letter." }));
      hasError = true;
    } else if (!/[0-9]/.test(password)) {
      setFormData((prev) => ({ ...prev, passwordError: "Password must contain at least one number." }));
      hasError = true;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setFormData((prev) => ({ ...prev, passwordError: "Password must contain at least one special character." }));
      hasError = true;
    }

    // Confirm Password validation
    if (!confirmPassword) {
      setFormData((prev) => ({ ...prev, confirmPasswordError: "Please confirm your password." }));
      hasError = true;
    } else if (confirmPassword !== password) {
      setFormData((prev) => ({ ...prev, confirmPasswordError: "Passwords do not match." }));
      hasError = true;
    }

    // Terms and Conditions validation
    if (!terms) {
      setFormData((prev) => ({ ...prev, termsError: "You must agree to the terms and conditions." }));
      hasError = true;
    }

    if (hasError) return; // Stop if there are errors

    try {
      const response = await axios.post("/sign-up", { username, password, email });
      console.log(response);  // Log response for debugging

      if (response.data.error) {
        setFormData((prev) => ({ ...prev, emailError: response.data.error }));
      } else {
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          email: "",
          terms: false, // Reset the checkbox after submission
          passwordError: "",
          confirmPasswordError: "",
          usernameError: "",
          emailError: "",
          termsError: "",
        });
        setSuccessMessage("Account successfully created! Redirecting to login...");
        setTimeout(() => {
          navigate("/"); // Redirect to login after 2 seconds
        }, 2000);
      }
    } catch (error) {
      console.error("Registration error:", error);  // Log any errors
    }
  };


  return (
    <div className="font-aribau min-h-screen flex flex-col items-center justify-center">
      <div className="w-[430px] sm:w-[500px] md:w-[700px] lg:w-[800px] pb-6 text-right flex justify-end">
        <img
          src={ExitIcon}
          alt=""
          style={{ width: '39px' }}
          className="hover:scale-110 cursor-pointer"
        />
      </div>
      <div className="p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2 text-center text-[#E2DDF3]">
          Create an Account
        </h1>
        <p className="text-lg mb-8 text-center text-[#9F9BAE]">
          Please enter your details to sign up.
        </p>


        {/* Success Message Container */}
        {successMessage && (
          <div className="bg-green-700 text-white text-center py-2 mb-4 rounded">
            {successMessage}
          </div>
        )}
        <form onSubmit={validateForm}>
          <TextField
            id="username"
            label="Enter your username"
            variant="filled"
            type="text"
            value={formData.username}
            autoComplete="off"
            onChange={(e) =>
              setFormData({
                ...formData,
                username: e.target.value,
                usernameError: "", // Clear error when typing
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Validate the username only when Enter is pressed
                if (!formData.username) {
                  // Set error if username is empty
                  setFormData((prevData) => ({
                    ...prevData,
                    usernameError: "Username is required.",
                  }));
                  e.preventDefault(); // Prevent focus shift and form submission
                } else if (!formData.usernameError) {
                  // Only move to the next field if there's no error in the username field
                  document.getElementById("email").focus(); // Move to email field on Enter
                }
              }
            }}
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
            error={!!formData.usernameError}
          />
          {formData.usernameError && (
            <p className="text-red-500 text-sm mt-[-9px] mb-4">{formData.usernameError}</p>
          )}

          <TextField
            id="email"
            label="Enter your email"
            variant="filled"
            type="email"
            value={formData.email}
            autoComplete="off"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value, emailError: "" })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Validate the email only when Enter is pressed
                if (!formData.email) {
                  // Set error if email is empty
                  setFormData((prevData) => ({
                    ...prevData,
                    emailError: "Email is required.",
                  }));
                  e.preventDefault(); // Prevent focus shift and form submission
                } else if (!formData.emailError) {
                  // Only move to the next field if there's no error in the email field
                  document.getElementById("password").focus(); // Move to password field on Enter
                }
              }
            }}
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
            error={!!formData.emailError}
          />
          {formData.emailError && (
            <p className="text-red-500 text-sm mt-[-9px] mb-4">{formData.emailError}</p>
          )}

          <div className="relative ">
            <TextField
              id="password"
              label="Enter your password"
              variant="filled"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              autoComplete="off"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value, passwordError: "" })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Validate the password only when Enter is pressed
                  if (!formData.password) {
                    // Set error if password is empty
                    setFormData((prevData) => ({
                      ...prevData,
                      passwordError: "Password is required.",
                    }));
                    e.preventDefault(); // Prevent focus shift and form submission
                  } else if (!formData.passwordError) {
                    // Only move to the next field if there's no error in the password field
                    document.getElementById("confirmPassword").focus(); // Move to confirm password field on Enter
                  }
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
              <p className="text-red-500 text-sm mt-[-9px] mb-4">{formData.passwordError}</p>
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
                setFormData({ ...formData, confirmPassword: e.target.value, confirmPasswordError: "" })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  validateForm(); // Trigger the form validation on Enter press
                }
              }}
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
              <p className="text-red-500 text-sm mt-[-20px] mb-6">
                {formData.confirmPasswordError}
              </p>
            )}
          </div>


          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 text-[#4D18E8] bg-[#3B354D] border-gray-300 rounded focus:ring-2 focus:ring-[#4D18E8]"
              onChange={(e) => setFormData({ ...formData, terms: e.target.checked, termsError: "" })}
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
          {formData.termsError && (
            <p className="text-red-500 text-sm mt-[-16px] mb-4">{formData.termsError}</p>
          )}


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
